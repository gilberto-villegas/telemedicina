<?php

namespace App\Providers;

use App\Listeners\SendMedicalRecordCreatedNotification;
use App\Listeners\SendPaymentConfirmationNotification;
use App\Listeners\SendPrescriptionReadyNotification;
use App\Models\MedicalRecord;
use App\Models\Payment;
use App\Models\Prescription;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Eventos de Payment
        'payment.completed' => [
            SendPaymentConfirmationNotification::class,
        ],

        // Eventos de Prescription
        'prescription.filled' => [
            SendPrescriptionReadyNotification::class,
        ],

        // Eventos de MedicalRecord
        'medical_record.created' => [
            SendMedicalRecordCreatedNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // Disparar evento cuando Payment se completa
        Payment::updated(function ($payment) {
            if ($payment->isDirty('status') && $payment->status === 'completed') {
                event('payment.completed', $payment);
            }
        });

        // Disparar evento cuando Prescription se marca como filled
        Prescription::updated(function ($prescription) {
            if ($prescription->isDirty('status') && $prescription->status === 'filled') {
                event('prescription.filled', $prescription);
            }
        });

        // Disparar evento cuando se crea MedicalRecord
        MedicalRecord::created(function ($medicalRecord) {
            event('medical_record.created', $medicalRecord);
        });
    }
}
