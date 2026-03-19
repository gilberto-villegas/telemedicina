<?php

namespace App\Services\Notifications\Channels;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WhatsAppChannel implements NotificationChannelInterface
{
    private bool $circuitOpen = false;
    private int $failureCount = 0;
    private ?\DateTime $lastFailureTime = null;
    private const MAX_FAILURES = 5;
    private const CIRCUIT_TIMEOUT = 300; // 5 minutos

    public function send(Notification $notification, User $user, array $data = []): bool
    {
        if ($this->isCircuitOpen()) {
            Log::warning('WhatsAppChannel: Circuit breaker abierto', [
                'notification_id' => $notification->id,
            ]);
            return false;
        }

        try {
            if (!$user->canReceiveWhatsApp()) {
                Log::warning('WhatsAppChannel: Usuario no puede recibir WhatsApp', [
                    'user_id' => $user->id,
                ]);
                return false;
            }

            $sid = config('notifications.twilio.sid');
            $token = config('notifications.twilio.token');
            $from = config('notifications.twilio.whatsapp_number');

            if (empty($sid) || empty($token) || empty($from)) {
                Log::error('WhatsAppChannel: Configuración de Twilio incompleta');
                return false;
            }

            // Formatear número de teléfono (agregar código de país si no tiene)
            $to = $this->formatPhoneNumber($user->phone);

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To' => $to,
                    'Body' => $notification->message,
                ]);

            if ($response->successful()) {
                $this->resetCircuit();
                Log::info('WhatsAppChannel: Notificación enviada', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                ]);
                return true;
            }

            $this->recordFailure();
            Log::error('WhatsAppChannel: Error en respuesta Twilio', [
                'notification_id' => $notification->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            $this->recordFailure();
            Log::error('WhatsAppChannel: Excepción al enviar', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function isAvailable(User $user): bool
    {
        return $user->canReceiveWhatsApp() && !$this->isCircuitOpen();
    }

    public function getName(): string
    {
        return 'whatsapp';
    }

    private function formatPhoneNumber(string $phone): string
    {
        // Remover caracteres no numéricos
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si no empieza con código de país, agregar +58 (Venezuela)
        if (!str_starts_with($phone, '58')) {
            $phone = '58' . $phone;
        }

        return 'whatsapp:+' . $phone;
    }

    private function isCircuitOpen(): bool
    {
        if (!$this->circuitOpen) {
            return false;
        }

        if ($this->lastFailureTime && 
            now()->diffInSeconds($this->lastFailureTime) > self::CIRCUIT_TIMEOUT) {
            $this->resetCircuit();
            return false;
        }

        return true;
    }

    private function recordFailure(): void
    {
        $this->failureCount++;
        $this->lastFailureTime = now();

        if ($this->failureCount >= self::MAX_FAILURES) {
            $this->circuitOpen = true;
            Log::warning('WhatsAppChannel: Circuit breaker abierto por múltiples fallos');
        }
    }

    private function resetCircuit(): void
    {
        $this->circuitOpen = false;
        $this->failureCount = 0;
        $this->lastFailureTime = null;
    }
}
