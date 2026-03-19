<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1 min, 5 min, 15 min

    public function __construct(
        public User $user,
        public string $type,
        public array $data = [],
        public array $channels = []
    ) {
        $this->onQueue(config('notifications.queue_connection', 'default'));
    }

    public function handle(NotificationService $notificationService): void
    {
        try {
            $notificationService->send($this->user, $this->type, $this->data, $this->channels);
        } catch (\Exception $e) {
            Log::error('SendNotificationJob: Error al procesar', [
                'user_id' => $this->user->id,
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-lanzar para que el queue lo reintente
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendNotificationJob: Job falló definitivamente', [
            'user_id' => $this->user->id,
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
