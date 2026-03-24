<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentRegisteredPatientNotification extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment->load(['appointment.doctor']);
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->payment->appointment;
        $doctor = $appointment->doctor;

        return (new MailMessage)
            ->subject('Hemos recibido tu pago - Telemedicina')
            ->view('emails.payment_registered_patient', [
                'patient_name' => $notifiable->first_name,
                'reference' => $this->payment->reference_number,
                'amount_usd' => number_format($this->payment->amount_usd, 2, ',', '.'),
                'amount_ves' => number_format($this->payment->amount_ves, 2, ',', '.'),
                'doctor_name' => $doctor->last_name,
                'appointment_date' => $appointment->start_time?->format('d/m/Y') ?? 'N/A',
                'appointment_time' => $appointment->start_time?->format('H:i') ?? 'N/A',
                'appointments_url' => url('/dashboard/patient/appointments'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'message' => 'Tu pago ha sido registrado y está en proceso de verificación.',
            'type' => 'payment_registered'
        ];
    }
}
