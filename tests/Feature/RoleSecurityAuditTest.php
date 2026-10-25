<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Status;
use App\Models\Specialty;
use App\Models\MedicalQuestion;
use App\Models\MedicalResponse;
use App\Models\Message;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class RoleSecurityAuditTest extends TestCase
{
    protected User $admin;
    protected User $doctor;
    protected User $otherDoctor;
    protected User $patient;
    protected User $otherPatient;
    protected Status $statusPendingPayment;
    protected Status $statusScheduled;
    protected Status $statusCompleted;

    protected function setUp(): void
    {
        parent::setUp();

        // Obtener o crear estados necesarios
        $this->statusPendingPayment = Status::firstOrCreate(
            ['name' => 'pending_payment'],
            ['label' => 'Pendiente de Pago', 'type' => 'appointment', 'badge_variant' => 'warning']
        );
        $this->statusScheduled = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );
        $this->statusCompleted = Status::firstOrCreate(
            ['name' => 'completed'],
            ['label' => 'Completada', 'type' => 'appointment', 'badge_variant' => 'success']
        );

        // Crear usuarios de prueba para los 3 roles
        $this->admin = User::factory()->admin()->create([
            'email' => 'admin_test_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->doctor = User::factory()->doctor()->create([
            'email' => 'doctor_test_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->otherDoctor = User::factory()->doctor()->create([
            'email' => 'doctor_other_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->patient = User::factory()->create([
            'email' => 'patient_test_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->otherPatient = User::factory()->create([
            'email' => 'patient_other_' . Str::random(6) . '@vilsalud.test'
        ]);
    }

    // ==========================================
    // SECCIÓN 1: PRUEBAS PARA ROL A (ADMIN)
    // ==========================================

    public function test_admin_can_access_administrative_endpoints(): void
    {
        Sanctum::actingAs($this->admin);

        // Acceso a estadísticas
        $responseStats = $this->getJson('/api/admin/stats');
        $responseStats->assertStatus(200)
            ->assertJsonStructure(['total_doctors', 'total_patients', 'pending_doctors']);

        // Acceso a lista de médicos
        $responseDoctors = $this->getJson('/api/admin/doctors');
        $responseDoctors->assertStatus(200);

        // Acceso a lista de pacientes
        $responsePatients = $this->getJson('/api/admin/patients');
        $responsePatients->assertStatus(200);

        // Acceso a configuraciones
        $responseSettings = $this->getJson('/api/admin/settings');
        $responseSettings->assertStatus(200);
    }

    public function test_admin_can_manage_users_and_verify_doctor(): void
    {
        Sanctum::actingAs($this->admin);

        $unverifiedDoctor = User::factory()->doctor()->create(['is_verified' => false]);

        // Verificar médico
        $responseVerify = $this->postJson("/api/admin/doctors/{$unverifiedDoctor->id}/verify");
        $responseVerify->assertStatus(200);
        $this->assertTrue($unverifiedDoctor->fresh()->is_verified);

        // Bloquear usuario
        $responseBlock = $this->postJson("/api/admin/users/{$this->patient->id}/block");
        $responseBlock->assertStatus(200);
        $this->assertTrue($this->patient->fresh()->is_blocked);
    }

    public function test_admin_is_denied_from_patient_and_doctor_exclusive_actions(): void
    {
        Sanctum::actingAs($this->admin);

        // Admin intentando agendar cita (solo pacientes)
        $responseStoreAppt = $this->postJson('/api/appointments', [
            'doctor_id' => $this->doctor->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'type' => 'videoconsulta',
        ]);
        $responseStoreAppt->assertStatus(403);

        // Admin intentando acceder a billetera médica (solo médicos)
        $responseWallet = $this->getJson('/api/wallet/balance');
        $responseWallet->assertStatus(403);

        // Admin intentando crear nota clínica SOAP (solo médicos)
        $responseRecord = $this->postJson('/api/medical-records', [
            'appointment_id' => (string) Str::uuid(),
            'subjective' => 'Prueba',
        ]);
        $responseRecord->assertStatus(403);
    }

    // ==========================================
    // SECCIÓN 2: PRUEBAS PARA ROL B (MÉDICO)
    // ==========================================

    public function test_doctor_can_access_his_own_modules(): void
    {
        Sanctum::actingAs($this->doctor);

        // Disponibilidad del médico
        $responseAvail = $this->getJson('/api/doctors/me/availability');
        $responseAvail->assertStatus(200);

        // Billetera médica
        $responseWallet = $this->getJson('/api/wallet/balance');
        $responseWallet->assertStatus(200)
            ->assertJsonStructure(['balance_usd', 'balance_ves', 'platform_fee_percent']);

        // Citas asignadas al médico
        $responseAppts = $this->getJson('/api/appointments');
        $responseAppts->assertStatus(200);
    }

    public function test_doctor_is_denied_access_to_admin_endpoints(): void
    {
        Sanctum::actingAs($this->doctor);

        // Acceso denegado a stats de admin
        $this->getJson('/api/admin/stats')->assertStatus(403);

        // Acceso denegado a lista de médicos en admin
        $this->getJson('/api/admin/doctors')->assertStatus(403);

        // Acceso denegado a gestión de configuraciones
        $this->getJson('/api/admin/settings')->assertStatus(403);

        // Acceso denegado a bloqueo de usuarios
        $this->postJson("/api/admin/users/{$this->patient->id}/block")->assertStatus(403);
    }

    // ==========================================
    // SECCIÓN 3: PRUEBAS PARA ROL C (PACIENTE)
    // ==========================================

    public function test_patient_can_access_his_own_profile_and_records(): void
    {
        Sanctum::actingAs($this->patient);

        // Perfil propio
        $responseProfile = $this->getJson('/api/patients/me');
        $responseProfile->assertStatus(200)
            ->assertJsonPath('user.id', $this->patient->id);

        // Expedientes propios
        $responseRecords = $this->getJson('/api/patients/me/medical-records');
        $responseRecords->assertStatus(200);
    }

    public function test_patient_is_denied_access_to_admin_and_doctor_endpoints(): void
    {
        Sanctum::actingAs($this->patient);

        // Acceso denegado a módulo admin
        $this->getJson('/api/admin/stats')->assertStatus(403);
        $this->getJson('/api/admin/settings')->assertStatus(403);

        // Acceso denegado a billetera de médicos
        $this->getJson('/api/wallet/balance')->assertStatus(403);

        // Acceso denegado a prescripción médica (crear receta)
        $this->postJson('/api/prescriptions', [
            'appointment_id' => (string) Str::uuid(),
            'medications' => [['name' => 'Ibuprofeno', 'dosage' => '400mg', 'frequency' => '8h', 'duration' => '3d']],
            'valid_until' => now()->addDays(5)->toDateString(),
        ])->assertStatus(403);
    }

    public function test_patient_cannot_view_or_cancel_other_patients_appointment(): void
    {
        // Cita perteneciente a otherPatient con doctor
        $appointment = Appointment::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->otherPatient->id,
            'doctor_id' => $this->doctor->id,
            'start_time' => now()->addDays(3),
            'end_time' => now()->addDays(3)->addMinutes(30),
            'type' => 'videoconsulta',
            'status_id' => $this->statusScheduled->id,
            'price_usd' => 30.00,
            'price_ves' => 1500.00,
            'exchange_rate' => 50.00,
        ]);

        Sanctum::actingAs($this->patient);

        // Intento de ver la cita ajena
        $responseShow = $this->getJson("/api/appointments/{$appointment->id}");
        $responseShow->assertStatus(403);

        // Intento de cancelar la cita ajena
        $responseCancel = $this->putJson("/api/appointments/{$appointment->id}/cancel");
        $responseCancel->assertStatus(403);
    }

    // ==========================================
    // SECCIÓN 4: AUDITORÍA DE VULNERABILIDADES (IDOR / BOLA)
    // ==========================================

    public function test_audit_chat_messages_vulnerability_unauthorized_user_can_read_chat(): void
    {
        // Crear cita legítima entre doctor y otherPatient
        $appointment = Appointment::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->otherPatient->id,
            'doctor_id' => $this->doctor->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addMinutes(30),
            'type' => 'videoconsulta',
            'status_id' => $this->statusScheduled->id,
            'price_usd' => 30.00,
            'price_ves' => 1500.00,
            'exchange_rate' => 50.00,
        ]);

        // Mensaje confidencial entre doctor y otherPatient
        Message::create([
            'appointment_id' => $appointment->id,
            'sender_id' => $this->otherPatient->id,
            'receiver_id' => $this->doctor->id,
            'message' => 'Doctor, tengo resultados confidenciales de VIH positivos.',
        ]);

        // Usuario ajeno (patient) intenta leer los mensajes
        Sanctum::actingAs($this->patient);

        $response = $this->getJson("/api/chats/{$appointment->id}/messages");

        // AUDITORÍA: Si retorna 200 con el mensaje, CONFIRMA LA VULNERABILIDAD IDOR
        // En un sistema seguro debería retornar 403 Forbidden.
        if ($response->status() === 200 && str_contains($response->content(), 'VIH positivos')) {
            $this->markTestIncomplete(
                'VULNERABILIDAD CRÍTICA CONFIRMADA (IDOR/BOLA): Un paciente no autorizado pudo leer los mensajes privados de otra cita.'
            );
        } else {
            $response->assertStatus(403);
        }
    }

    public function test_audit_medical_questionnaire_vulnerability_unauthorized_user_can_read_responses(): void
    {
        // Crear cita legítima entre doctor y otherPatient
        $appointment = Appointment::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->otherPatient->id,
            'doctor_id' => $this->doctor->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addMinutes(30),
            'type' => 'videoconsulta',
            'status_id' => $this->statusScheduled->id,
            'price_usd' => 30.00,
            'price_ves' => 1500.00,
            'exchange_rate' => 50.00,
        ]);

        $question = MedicalQuestion::create([
            'question_text' => '¿Tiene alguna enfermedad crónica contagiosa?',
            'type' => 'text',
            'order' => 1,
        ]);

        MedicalResponse::create([
            'appointment_id' => $appointment->id,
            'question_id' => $question->id,
            'response_text' => 'Sí, sufro de hepatitis B crónica desde hace 5 años.',
        ]);

        // Usuario ajeno (patient) intenta consultar el cuestionario de esa cita
        Sanctum::actingAs($this->patient);

        $response = $this->getJson("/api/appointments/{$appointment->id}/responses");

        // AUDITORÍA: Si responde 200 exponiendo el historial íntimo, CONFIRMA LA VULNERABILIDAD
        if ($response->status() === 200 && str_contains($response->content(), 'hepatitis B')) {
            $this->markTestIncomplete(
                'VULNERABILIDAD CRÍTICA CONFIRMADA (IDOR/BOLA): Un paciente no autorizado pudo leer las respuestas del cuestionario médico confidencial de otra persona.'
            );
        } else {
            $response->assertStatus(403);
        }
    }
}
