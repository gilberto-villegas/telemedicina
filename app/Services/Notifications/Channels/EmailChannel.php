<?php

namespace App\Services\Notifications\Channels;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailChannel implements NotificationChannelInterface
{
    public function send(Notification $notification, User $user, array $data = []): bool
    {
        try {
            if (empty($user->email)) {
                Log::warning('EmailChannel: Usuario sin email', ['user_id' => $user->id]);
                return false;
            }

            Mail::raw($notification->message, function ($message) use ($notification, $user) {
                $message->to($user->email, $user->full_name)
                    ->subject($notification->title);
            });

            Log::info('EmailChannel: Notificación enviada', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('EmailChannel: Error al enviar', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function isAvailable(User $user): bool
    {
        return !empty($user->email);
    }

    public function getName(): string
    {
        return 'email';
    }
}
