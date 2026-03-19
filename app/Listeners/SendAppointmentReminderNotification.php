<?php

namespace App\Listeners;

use App\Jobs\SendNotificationJob;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminderNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle($event): void
    {
        // Este listener se ejecutará desde un scheduled command
        // que buscará appointments próximos
    }

    public static function sendReminders(): void
    {
        // Recordatorios 24 horas antes
        $appointments24h = Appointment::where('status', 'scheduled')
            ->whereBetween('start_time', [
                now()->addHours(24)->subMinutes(30),
                now()->addHours(24)->addMinutes(30),
            ])
            ->with(['patient', 'doctor'])
            ->get();

        foreach ($appointments24h as $appointment) {
            SendNotificationJob::dispatch(
                $appointment->patient,
                'appointment_reminder',
                [
                    'title' => 'Recordatorio: Cita en 24 horas',
                    'message' => "Tienes una cita con Dr. {$appointment->doctor->full_name} el " . 
                                 $appointment->start_time->format('d/m/Y H:i'),
                    'appointment_id' => $appointment->id,
                    'doctor_name' => $appointment->doctor->full_name,
                    'appointment_date' => $appointment->start_time->format('d/m/Y H:i'),
                ]
            );
        }

        // Recordatorios 1 hora antes
        $appointments1h = Appointment::where('status', 'scheduled')
            ->whereBetween('start_time', [
                now()->addHour()->subMinutes(15),
                now()->addHour()->addMinutes(15),
            ])
            ->with(['patient', 'doctor'])
            ->get();

        foreach ($appointments1h as $appointment) {
            SendNotificationJob::dispatch(
                $appointment->patient,
                'appointment_reminder',
                [
                    'title' => 'Recordatorio: Cita en 1 hora',
                    'message' => "Tu cita con Dr. {$appointment->doctor->full_name} es en 1 hora",
                    'appointment_id' => $appointment->id,
                    'doctor_name' => $appointment->doctor->full_name,
                    'appointment_date' => $appointment->start_time->format('d/m/Y H:i'),
                    'urgent' => true,
                ]
            );
        }
    }
}
