<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Appointment;

class ChatPolicy
{
    /**
     * Determine whether the user can view chat messages of the appointment.
     */
    public function viewMessages(User $user, Appointment $appointment): bool
    {
        return $appointment->patient_id === $user->id || $appointment->doctor_id === $user->id;
    }

    /**
     * Determine whether the user can send a message in the appointment.
     */
    public function sendMessage(User $user, Appointment $appointment): bool
    {
        return $appointment->patient_id === $user->id || $appointment->doctor_id === $user->id;
    }
}
