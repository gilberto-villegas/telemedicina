<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Appointment;

class MedicalQuestionnairePolicy
{
    /**
     * Determine whether the user can view medical responses of the appointment.
     */
    public function viewResponses(User $user, Appointment $appointment): bool
    {
        return $appointment->patient_id === $user->id || $appointment->doctor_id === $user->id;
    }

    /**
     * Determine whether the user can submit medical responses for the appointment.
     */
    public function submitResponses(User $user, Appointment $appointment): bool
    {
        return $appointment->patient_id === $user->id;
    }
}
