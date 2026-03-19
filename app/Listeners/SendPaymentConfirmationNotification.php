<?php

namespace App\Listeners;

use App\Jobs\SendNotificationJob;
use App\Models\Payment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPaymentConfirmationNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle($event): void
    {
        $payment = $event->payment ?? $event;

        if (!($payment instanceof Payment)) {
            return;
        }

        if ($payment->status !== 'completed') {
            return;
        }

        $user = $payment->user;
        $appointment = $payment->appointment;

        SendNotificationJob::dispatch(
            $user,
            'payment_confirmation',
            [
                'title' => 'Pago Confirmado',
                'message' => "Tu pago de \${$payment->amount_usd} USD ha sido confirmado",
                'payment_id' => $payment->id,
                'amount_usd' => $payment->amount_usd,
                'amount_ves' => $payment->amount_ves,
                'method' => $payment->method,
                'appointment_id' => $appointment?->id,
            ]
        );
    }
}
