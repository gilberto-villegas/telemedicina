<?php

namespace App\Listeners;

use App\Jobs\SendNotificationJob;
use App\Models\Prescription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPrescriptionReadyNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle($event): void
    {
        $prescription = $event->prescription ?? $event;

        if (!($prescription instanceof Prescription)) {
            return;
        }

        if ($prescription->status !== 'filled') {
            return;
        }

        $patient = $prescription->patient;

        SendNotificationJob::dispatch(
            $patient,
            'prescription_ready',
            [
                'title' => 'Receta Despachada',
                'message' => "Tu receta ha sido despachada y está lista para retirar",
                'prescription_id' => $prescription->id,
                'pharmacy_id' => $prescription->pharmacy_id,
            ]
        );
    }
}
