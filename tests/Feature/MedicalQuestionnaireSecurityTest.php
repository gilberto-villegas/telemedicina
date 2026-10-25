<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Status;
use App\Models\MedicalQuestion;
use App\Models\MedicalResponse;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class MedicalQuestionnaireSecurityTest extends TestCase
{
    protected User $patient;
    protected User $otherPatient;
    protected User $doctor;
    protected User $otherDoctor;
    protected Appointment $appointment;
    protected MedicalQuestion $question;

    protected function setUp(): void
    {
        parent::setUp();

        $status = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $this->patient = User::factory()->create([
            'email' => 'quest_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->otherPatient = User::factory()->create([
            'email' => 'quest_other_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->doctor = User::factory()->doctor()->create([
            'email' => 'quest_doctor_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->otherDoctor = User::factory()->doctor()->create([
            'email' => 'quest_other_doctor_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->appointment = Appointment::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addMinutes(30),
            'type' => 'videoconsulta',
            'status_id' => $status->id,
            'price_usd' => 30.00,
            'price_ves' => 1500.00,
            'exchange_rate' => 50.00,
        ]);

        $this->question = MedicalQuestion::create([
            'question_text' => '¿Tiene alergia a medicamentos?',
            'type' => 'text',
            'order' => 1,
        ]);

        MedicalResponse::create([
            'appointment_id' => $this->appointment->id,
            'question_id' => $this->question->id,
            'response_text' => 'Alergia severa a la Penicilina.',
        ]);
    }

    public function test_other_patient_gets_403_on_get_and_post_responses(): void
    {
        Sanctum::actingAs($this->otherPatient);

        // Intento de leer respuestas médicas ajenas
        $responseGet = $this->getJson("/api/appointments/{$this->appointment->id}/responses");
        $responseGet->assertStatus(403);

        // Intento de enviar respuestas a cita ajena
        $responsePost = $this->postJson("/api/appointments/{$this->appointment->id}/responses", [
            'responses' => [
                ['question_id' => $this->question->id, 'response_text' => 'Intruso modificando']
            ]
        ]);
        $responsePost->assertStatus(403);
    }

    public function test_assigned_patient_can_view_and_submit_responses(): void
    {
        Sanctum::actingAs($this->patient);

        // Paciente legítimo lee sus respuestas
        $responseGet = $this->getJson("/api/appointments/{$this->appointment->id}/responses");
        $responseGet->assertStatus(200)
            ->assertJsonFragment(['response_text' => 'Alergia severa a la Penicilina.']);

        // Paciente legítimo envía respuestas
        $responsePost = $this->postJson("/api/appointments/{$this->appointment->id}/responses", [
            'responses' => [
                ['question_id' => $this->question->id, 'response_text' => 'Alergia confirmada a Penicilina y AINES.']
            ]
        ]);
        $responsePost->assertStatus(200);
    }

    public function test_assigned_doctor_can_view_responses_but_cannot_submit(): void
    {
        Sanctum::actingAs($this->doctor);

        // Médico asignado puede consultar las respuestas médicas
        $responseGet = $this->getJson("/api/appointments/{$this->appointment->id}/responses");
        $responseGet->assertStatus(200)
            ->assertJsonFragment(['response_text' => 'Alergia severa a la Penicilina.']);

        // Médico no puede responder el cuestionario del paciente
        $responsePost = $this->postJson("/api/appointments/{$this->appointment->id}/responses", [
            'responses' => [
                ['question_id' => $this->question->id, 'response_text' => 'Médico intentando responder']
            ]
        ]);
        $responsePost->assertStatus(403);
    }

    public function test_other_doctor_gets_403_on_get_and_post_responses(): void
    {
        Sanctum::actingAs($this->otherDoctor);

        // Médico ajeno intenta leer respuestas
        $responseGet = $this->getJson("/api/appointments/{$this->appointment->id}/responses");
        $responseGet->assertStatus(403);

        // Médico ajeno intenta responder
        $responsePost = $this->postJson("/api/appointments/{$this->appointment->id}/responses", [
            'responses' => [
                ['question_id' => $this->question->id, 'response_text' => 'Médico ajeno']
            ]
        ]);
        $responsePost->assertStatus(403);
    }
}
