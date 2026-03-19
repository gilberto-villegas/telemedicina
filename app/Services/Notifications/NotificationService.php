<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotificationPreferences;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\PushChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use App\Services\Notifications\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotificationService
{
    private TemplateManager $templateManager;
    private array $channels = [];

    public function __construct(TemplateManager $templateManager)
    {
        $this->templateManager = $templateManager;
        $this->registerChannels();
    }

    public function send(User $user, string $type, array $data = [], array $channels = []): ?Notification
    {
        try {
            // Obtener preferencias del usuario
            $preferences = $user->notificationPreferences ?? 
                $this->createDefaultPreferences($user);

            // Verificar si está en horas silenciosas
            if ($preferences->isQuietHours() && !($data['urgent'] ?? false)) {
                Log::info('NotificationService: En horas silenciosas', [
                    'user_id' => $user->id,
                    'type' => $type,
                ]);
                // Guardar notificación pero no enviar ahora
                return $this->createNotification($user, $type, $data, [], false);
            }

            // Obtener canales a usar
            $channelsToUse = $this->determineChannels($user, $preferences, $channels, $type);

            if (empty($channelsToUse)) {
                Log::warning('NotificationService: No hay canales disponibles', [
                    'user_id' => $user->id,
                    'type' => $type,
                ]);
                return null;
            }

            // Renderizar template
            $rendered = $this->templateManager->renderTemplate($type, array_merge([
                'user_name' => $user->full_name,
                'user_email' => $user->email,
            ], $data));

            if (!$rendered) {
                // Si no hay template, usar datos básicos
                $rendered = [
                    'email' => ['subject' => $data['title'] ?? 'Notificación', 'body' => $data['message'] ?? ''],
                    'whatsapp' => $data['message'] ?? '',
                    'push' => ['title' => $data['title'] ?? 'Notificación', 'body' => $data['message'] ?? ''],
                ];
            }

            // Crear notificación
            $notification = $this->createNotification($user, $type, $data, $channelsToUse);

            // Enviar a través de cada canal
            foreach ($channelsToUse as $channelName) {
                $channel = $this->getChannel($channelName);
                if ($channel && $channel->isAvailable($user)) {
                    $this->sendViaChannel($notification, $user, $channel, $rendered, $data);
                }
            }

            return $notification;
        } catch (\Exception $e) {
            Log::error('NotificationService: Error al enviar notificación', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function createNotification(User $user, string $type, array $data, array $channels, bool $sent = true): Notification
    {
        $title = $data['title'] ?? $this->getDefaultTitle($type);
        $message = $data['message'] ?? $this->getDefaultMessage($type);

        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'channels' => $channels,
            'sent_at' => $sent ? now() : null,
        ]);
    }

    private function determineChannels(User $user, UserNotificationPreferences $preferences, array $requestedChannels, string $type): array
    {
        // Si se especificaron canales, usar esos (si están habilitados)
        if (!empty($requestedChannels)) {
            return array_filter($requestedChannels, function ($channel) use ($preferences) {
                return $preferences->isChannelEnabled($channel);
            });
        }

        // Verificar categoría
        if (!$preferences->isCategoryEnabled($type)) {
            return [];
        }

        // Usar canales por defecto del usuario
        $availableChannels = [];
        $defaultChannels = $preferences->channels ?? $preferences->getDefaultChannels();

        foreach ($defaultChannels as $channelName) {
            $channel = $this->getChannel($channelName);
            if ($channel && $channel->isAvailable($user)) {
                $availableChannels[] = $channelName;
            }
        }

        return $availableChannels;
    }

    private function sendViaChannel(Notification $notification, User $user, NotificationChannelInterface $channel, array $rendered, array $data): void
    {
        try {
            // Actualizar mensaje según el canal
            $channelName = $channel->getName();
            if (isset($rendered[$channelName])) {
                if ($channelName === 'email') {
                    $notification->title = $rendered['email']['subject'];
                    $notification->message = $rendered['email']['body'];
                } elseif ($channelName === 'push') {
                    $notification->title = $rendered['push']['title'];
                    $notification->message = $rendered['push']['body'];
                } else {
                    $notification->message = $rendered[$channelName];
                }
                $notification->save();
            }

            $success = $channel->send($notification, $user, $data);

            // Registrar log
            $log = $notification->logs()->create([
                'channel' => $channelName,
                'status' => $success ? 'sent' : 'failed',
            ]);

            if (!$success) {
                $log->markAsFailed('Error al enviar a través del canal');
            } else {
                $log->markAsSent();
            }
        } catch (\Exception $e) {
            Log::error('NotificationService: Error en canal', [
                'notification_id' => $notification->id,
                'channel' => $channel->getName(),
                'error' => $e->getMessage(),
            ]);

            $notification->logs()->create([
                'channel' => $channel->getName(),
                'status' => 'failed',
            ])->markAsFailed($e->getMessage());
        }
    }

    private function registerChannels(): void
    {
        $this->channels = [
            'email' => new EmailChannel(),
            'push' => new PushChannel(),
            'whatsapp' => new WhatsAppChannel(),
        ];
    }

    private function getChannel(string $name): ?NotificationChannelInterface
    {
        return $this->channels[$name] ?? null;
    }

    private function createDefaultPreferences(User $user): UserNotificationPreferences
    {
        return UserNotificationPreferences::create([
            'user_id' => $user->id,
            'channels' => UserNotificationPreferences::getDefaultPreferences()['channels'],
            'categories' => null,
            'quiet_hours' => UserNotificationPreferences::getDefaultPreferences()['quiet_hours'],
        ]);
    }

    private function getDefaultTitle(string $type): string
    {
        return match ($type) {
            'appointment_reminder' => 'Recordatorio de Cita',
            'payment_confirmation' => 'Confirmación de Pago',
            'prescription_ready' => 'Receta Disponible',
            'medical_record_created' => 'Nuevo Registro Médico',
            default => 'Notificación',
        };
    }

    private function getDefaultMessage(string $type): string
    {
        return match ($type) {
            'appointment_reminder' => 'Tienes una cita programada',
            'payment_confirmation' => 'Tu pago ha sido confirmado',
            'prescription_ready' => 'Tu receta está lista',
            'medical_record_created' => 'Se ha creado un nuevo registro médico',
            default => 'Tienes una nueva notificación',
        };
    }
}
