<?php

namespace App\Services\Notifications\Channels;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PushChannel implements NotificationChannelInterface
{
    private bool $circuitOpen = false;
    private int $failureCount = 0;
    private ?\DateTime $lastFailureTime = null;
    private const MAX_FAILURES = 5;
    private const CIRCUIT_TIMEOUT = 300; // 5 minutos

    public function send(Notification $notification, User $user, array $data = []): bool
    {
        if ($this->isCircuitOpen()) {
            Log::warning('PushChannel: Circuit breaker abierto', [
                'notification_id' => $notification->id,
            ]);
            return false;
        }

        try {
            if (empty($user->fcm_token)) {
                Log::warning('PushChannel: Usuario sin FCM token', ['user_id' => $user->id]);
                return false;
            }

            $firebaseKey = config('notifications.firebase.api_key');
            if (empty($firebaseKey)) {
                Log::error('PushChannel: Firebase API key no configurada');
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => 'key=' . $firebaseKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $user->fcm_token,
                'notification' => [
                    'title' => $notification->title,
                    'body' => $notification->message,
                ],
                'data' => array_merge($notification->data ?? [], [
                    'notification_id' => $notification->id,
                    'type' => $notification->type,
                ]),
            ]);

            if ($response->successful()) {
                $this->resetCircuit();
                Log::info('PushChannel: Notificación enviada', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                ]);
                return true;
            }

            $this->recordFailure();
            Log::error('PushChannel: Error en respuesta FCM', [
                'notification_id' => $notification->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            $this->recordFailure();
            Log::error('PushChannel: Excepción al enviar', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function isAvailable(User $user): bool
    {
        return !empty($user->fcm_token) && !$this->isCircuitOpen();
    }

    public function getName(): string
    {
        return 'push';
    }

    private function isCircuitOpen(): bool
    {
        if (!$this->circuitOpen) {
            return false;
        }

        // Verificar si ha pasado el timeout
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
            Log::warning('PushChannel: Circuit breaker abierto por múltiples fallos');
        }
    }

    private function resetCircuit(): void
    {
        $this->circuitOpen = false;
        $this->failureCount = 0;
        $this->lastFailureTime = null;
    }
}
