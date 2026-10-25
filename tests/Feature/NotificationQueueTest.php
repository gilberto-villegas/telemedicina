<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Status;
use App\Notifications\PaymentRegisteredDoctorNotification;
use App\Notifications\PaymentRegisteredAdminNotification;
use App\Notifications\PaymentRegisteredPatientNotification;
use App\Notifications\PaymentVerifiedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class NotificationQueueTest extends TestCase
{
    protected User $patient;
    protected User $doctor;
    protected User $admin;
    protected Appointment $appointment;
    protected Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $statusPending = Status::firstOrCreate(
            ['name' => 'payment_pending'],
            ['label' => 'Pago Pendiente', 'type' => 'payment', 'badge_variant' => 'warning']
        );

        $statusProcessing = Status::firstOrCreate(
            ['name' => 'payment_processing'],
            ['label' => 'Pago en Proceso', 'type' => 'payment', 'badge_variant' => 'info']
        );

        $statusPendingVerif = Status::firstOrCreate(
            ['name' => 'pending_verification'],
            ['label' => 'Verificación Pendiente', 'type' => 'appointment', 'badge_variant' => 'warning']
        );

        $statusCompleted = Status::firstOrCreate(
            ['name' => 'payment_completed'],
            ['label' => 'Pago Completado', 'type' => 'payment', 'badge_variant' => 'success']
        );

        $statusScheduled = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $this->patient = User::factory()->create([
            'email' => 'queue_pat_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->doctor = User::factory()->doctor()->create([
            'email' => 'queue_doc_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->admin = User::factory()->admin()->create([
            'email' => 'queue_adm_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->appointment = Appointment::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'start_time' => now()->addDays(2),
            'end_time' => now()->addDays(2)->addMinutes(30),
            'type' => 'videoconsulta',
            'status_id' => $statusPendingVerif->id,
            'price_usd' => 40.00,
            'price_ves' => 2000.00,
            'exchange_rate' => 50.00,
        ]);

        $this->payment = Payment::create([
            'id' => (string) Str::uuid(),
            'appointment_id' => $this->appointment->id,
            'user_id' => $this->patient->id,
            'amount_usd' => 40.00,
            'amount_ves' => 2000.00,
            'exchange_rate' => 50.00,
            'currency' => 'USD',
            'method' => 'pago_movil',
            'status_id' => $statusPending->id,
        ]);

        $this->appointment->update(['payment_id' => $this->payment->id]);
    }

    public function test_payment_notifications_implement_should_queue(): void
    {
        $this->assertInstanceOf(ShouldQueue::class, new PaymentRegisteredDoctorNotification($this->payment));
        $this->assertInstanceOf(ShouldQueue::class, new PaymentRegisteredAdminNotification($this->payment));
        $this->assertInstanceOf(ShouldQueue::class, new PaymentRegisteredPatientNotification($this->payment));
        $this->assertInstanceOf(ShouldQueue::class, new PaymentVerifiedNotification($this->appointment));
    }

    public function test_payment_confirmation_dispatches_queued_notifications(): void
    {
        Notification::fake();
        Sanctum::actingAs($this->patient);

        $response = $this->postJson("/api/payments/{$this->payment->id}/confirm", [
            'reference_number' => 'REF-12345678',
            'payment_date' => now()->toDateString(),
            'payment_phone' => '04141234567',
        ]);

        $response->assertStatus(200);

        // Notificación encolada al médico
        Notification::assertSentTo($this->doctor, PaymentRegisteredDoctorNotification::class);

        // Notificación encolada a los administradores
        Notification::assertSentTo($this->admin, PaymentRegisteredAdminNotification::class);

        // Notificación encolada al paciente
        Notification::assertSentTo($this->patient, PaymentRegisteredPatientNotification::class);
    }

    public function test_payment_verification_approval_dispatches_queued_notification(): void
    {
        Notification::fake();
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/payments/{$this->payment->id}/verify", [
            'action' => 'approve',
        ]);

        $response->assertStatus(200);

        // Notificación encolada al paciente de pago verificado
        Notification::assertSentTo($this->patient, PaymentVerifiedNotification::class);
    }
}
