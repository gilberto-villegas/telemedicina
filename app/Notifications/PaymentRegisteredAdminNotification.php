<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentRegisteredAdminNotification extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment->load(['appointment.patient', 'appointment.doctor', 'user']);
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
        $method_labels = [
            'pago_movil' => 'Pago Móvil',
            'bank_transfer' => 'Transferencia',
            'zelle' => 'Zelle',
            'paypal' => 'PayPal',
            'wise' => 'Wise',
            'cash' => 'Efectivo',
        ];

        return (new MailMessage)
            ->subject('VALIDACIÓN REQUERIDA: Pago de ' . $patient->full_name)
            ->view('emails.payment_registered_admin', [
                'patient_name' => $patient->full_name,
                'patient_document' => $patient->document_id ?? 'N/A',
                'doctor_name' => $doctor->last_name,
                'method' => $method_labels[$this->payment->method] ?? $this->payment->method,
                'reference' => $this->payment->reference_number,
                'payment_date' => $this->payment->payment_date,
                'payment_phone' => $this->payment->payment_phone ?? 'N/A',
                'exchange_rate' => number_format($this->payment->exchange_rate, 4, ',', '.'),
                'amount_usd' => number_format($this->payment->amount_usd, 2, ',', '.'),
                'amount_ves' => number_format($this->payment->amount_ves, 2, ',', '.'),
                'proof_url' => $this->payment->proof_url,
                'admin_url' => url('/dashboard/admin/payments'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'message' => 'Nuevo pago por validar de ' . $this->payment->user->full_name,
            'type' => 'payment_awaiting_validation'
        ];
    }
}
