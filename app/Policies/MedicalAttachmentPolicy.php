<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MedicalAttachment;

class MedicalAttachmentPolicy
{
    /**
     * Determine whether the user can download the medical attachment.
     */
    public function download(User $user, MedicalAttachment $attachment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($attachment->user_id === $user->id) {
            return true;
        }

        $record = $attachment->record;
        if ($record) {
            if ($record->patient_id === $user->id) {
                return true;
            }

            if ($record->appointment && $record->appointment->doctor_id === $user->id) {
                return true;
            }
        }

        return false;
    }
}
