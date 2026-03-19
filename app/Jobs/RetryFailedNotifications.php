<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryFailedNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $failedLogs = NotificationLog::failed()
            ->where('created_at', '>=', now()->subHours(24))
            ->with('notification.user')
            ->get();

        foreach ($failedLogs as $log) {
            try {
                $notification = $log->notification;
                $user = $notification->user;

                // Reintentar solo si el usuario aún existe y el canal está disponible
                $channelClass = match($log->channel) {
                    'email' => \App\Services\Notifications\Channels\EmailChannel::class,
                    'push' => \App\Services\Notifications\Channels\PushChannel::class,
                    'whatsapp' => \App\Services\Notifications\Channels\WhatsAppChannel::class,
                    default => null,
                };

                if ($channelClass) {
                    $channel = app($channelClass);
                    
                    if ($channel && $channel->isAvailable($user)) {
                        $success = $channel->send($notification, $user, $notification->data ?? []);

                        if ($success) {
                            $log->markAsSent();
                            Log::info('RetryFailedNotifications: Reintento exitoso', [
                                'log_id' => $log->id,
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('RetryFailedNotifications: Error al reintentar', [
                    'log_id' => $log->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
