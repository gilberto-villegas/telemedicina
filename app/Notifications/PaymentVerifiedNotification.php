<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentVerifiedNotification extends Notification
{
    protected $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct($appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $date = $this->appointment->start_time->format('d/m/Y');
        $time = $this->appointment->start_time->format('H:i');
        $doctorName = "Dr. " . $this->appointment->doctor->first_name . " " . $this->appointment->doctor->last_name;

        return (new MailMessage)
                    ->subject('Cita Médica Confirmada - Telemed')
                    ->greeting('¡Hola ' . $notifiable->first_name . '!')
                    ->line('Tu pago ha sido verificado y tu cita médica ha sido agendada con éxito.')
                    ->line('Detalles de la cita:')
                    ->line('Doctor: ' . $doctorName)
                    ->line('Fecha: ' . $date)
                    ->line('Hora: ' . $time)
                    ->action('Ver mis citas', url('/dashboard/patient/appointments'))
                    ->line('Gracias por confiar en Telemed.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'message' => 'Tu pago ha sido verificado. Cita confirmada para el ' . $this->appointment->start_time->format('d/m/Y H:i'),
            'type' => 'payment_verified'
        ];
    }
}
