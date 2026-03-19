<?php

namespace App\Listeners;

use App\Jobs\SendNotificationJob;
use App\Models\MedicalRecord;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendMedicalRecordCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle($event): void
    {
        $medicalRecord = $event->medicalRecord ?? $event;

        if (!($medicalRecord instanceof MedicalRecord)) {
            return;
        }

        $patient = $medicalRecord->patient;
        $appointment = $medicalRecord->appointment;

        SendNotificationJob::dispatch(
            $patient,
            'medical_record_created',
            [
                'title' => 'Nuevo Registro Médico',
                'message' => "Se ha creado un nuevo registro médico de tu consulta del " . 
                            ($appointment?->start_time?->format('d/m/Y') ?? ''),
                'medical_record_id' => $medicalRecord->id,
                'appointment_id' => $appointment?->id,
            ]
        );
    }
}
