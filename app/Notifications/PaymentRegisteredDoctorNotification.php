<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentRegisteredDoctorNotification extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment->load(['appointment.patient', 'appointment.doctor']);
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->payment->appointment;
        $doctor = $appointment->doctor;
        $patient = $appointment->patient;

        return (new MailMessage)
            ->subject('Registro de Pago Pendiente - ' . $patient->full_name)
            ->view('emails.payment_registered_doctor', [
                'doctor_name' => $doctor->full_name,
                'patient_name' => $patient->full_name,
                'reason' => $appointment->reason ?? 'No especificado',
                'appointment_date' => $appointment->start_time?->format('d/m/Y') ?? 'N/A',
                'appointment_time' => $appointment->start_time?->format('H:i') ?? 'N/A',
                'login_url' => url('/dashboard/doctor/appointments'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'message' => 'Se ha registrado un pago para tu cita con ' . $this->payment->appointment->patient->full_name,
            'type' => 'payment_registered'
        ];
    }
}
