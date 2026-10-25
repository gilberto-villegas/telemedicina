<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Status;
use App\Models\Message;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class ChatSecurityTest extends TestCase
{
    protected User $patient;
    protected User $otherPatient;
    protected User $doctor;
    protected User $otherDoctor;
    protected Appointment $appointment;

    protected function setUp(): void
    {
        parent::setUp();

        $status = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $this->patient = User::factory()->create([
            'email' => 'chat_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->otherPatient = User::factory()->create([
            'email' => 'chat_other_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->doctor = User::factory()->doctor()->create([
            'email' => 'chat_doctor_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->otherDoctor = User::factory()->doctor()->create([
            'email' => 'chat_other_doctor_' . Str::random(6) . '@vilsalud.test',
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

        Message::create([
            'appointment_id' => $this->appointment->id,
            'sender_id' => $this->patient->id,
            'receiver_id' => $this->doctor->id,
            'message' => 'Hola Doctor, tengo una duda sobre el tratamiento.',
        ]);
    }

    public function test_other_patient_gets_403_on_get_and_post_messages(): void
    {
        Sanctum::actingAs($this->otherPatient);

        // Intento de leer mensajes ajenos
        $responseGet = $this->getJson("/api/chats/{$this->appointment->id}/messages");
        $responseGet->assertStatus(403);

        // Intento de enviar mensaje a cita ajena
        $responsePost = $this->postJson("/api/chats/{$this->appointment->id}/messages", [
            'message' => 'Intruso intentando escribir',
        ]);
        $responsePost->assertStatus(403);
    }

    public function test_assigned_patient_gets_200_on_get_and_post_messages(): void
    {
        Sanctum::actingAs($this->patient);

        // Paciente legítimo lee mensajes
        $responseGet = $this->getJson("/api/chats/{$this->appointment->id}/messages");
        $responseGet->assertStatus(200)
            ->assertJsonFragment(['message' => 'Hola Doctor, tengo una duda sobre el tratamiento.']);

        // Paciente legítimo envía mensaje
        $responsePost = $this->postJson("/api/chats/{$this->appointment->id}/messages", [
            'message' => 'Doctor, ¿cuál es la dosis?',
        ]);
        $responsePost->assertStatus(200)
            ->assertJsonFragment(['message' => 'Doctor, ¿cuál es la dosis?']);
    }

    public function test_assigned_doctor_gets_200_on_get_and_post_messages(): void
    {
        Sanctum::actingAs($this->doctor);

        // Médico legítimo lee mensajes
        $responseGet = $this->getJson("/api/chats/{$this->appointment->id}/messages");
        $responseGet->assertStatus(200)
            ->assertJsonFragment(['message' => 'Hola Doctor, tengo una duda sobre el tratamiento.']);

        // Médico legítimo envía mensaje
        $responsePost = $this->postJson("/api/chats/{$this->appointment->id}/messages", [
            'message' => 'Toma una tableta cada 8 horas.',
        ]);
        $responsePost->assertStatus(200)
            ->assertJsonFragment(['message' => 'Toma una tableta cada 8 horas.']);
    }

    public function test_other_doctor_gets_403_on_get_and_post_messages(): void
    {
        Sanctum::actingAs($this->otherDoctor);

        // Médico ajeno intenta leer mensajes
        $responseGet = $this->getJson("/api/chats/{$this->appointment->id}/messages");
        $responseGet->assertStatus(403);

        // Médico ajeno intenta enviar mensaje
        $responsePost = $this->postJson("/api/chats/{$this->appointment->id}/messages", [
            'message' => 'Médico no autorizado intentando escribir',
        ]);
        $responsePost->assertStatus(403);
    }
}
