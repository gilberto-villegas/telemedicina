<?php

namespace App\Services\Notifications\Contracts;

use App\Models\Notification;
use App\Models\User;

interface NotificationChannelInterface
{
    /**
     * Enviar notificación a través del canal
     */
    public function send(Notification $notification, User $user, array $data = []): bool;

    /**
     * Verificar si el canal está disponible
     */
    public function isAvailable(User $user): bool;

    /**
     * Obtener nombre del canal
     */
    public function getName(): string;
}
