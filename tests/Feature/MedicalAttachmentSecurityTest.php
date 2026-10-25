<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Status;
use App\Models\MedicalRecord;
use App\Models\MedicalAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class MedicalAttachmentSecurityTest extends TestCase
{
    protected User $patient;
    protected User $otherPatient;
    protected User $doctor;
    protected User $otherDoctor;
    protected Appointment $appointment;
    protected MedicalRecord $record;
    protected MedicalAttachment $attachment;
    protected string $fileName;
    protected string $storagePath;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
        Storage::fake('public');

        $status = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $this->patient = User::factory()->create([
            'email' => 'att_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->otherPatient = User::factory()->create([
            'email' => 'att_other_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $this->doctor = User::factory()->doctor()->create([
            'email' => 'att_doctor_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true
        ]);

        $this->otherDoctor = User::factory()->doctor()->create([
            'email' => 'att_other_doctor_' . Str::random(6) . '@vilsalud.test',
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

        $this->record = MedicalRecord::create([
            'id' => (string) Str::uuid(),
            'patient_id' => $this->patient->id,
            'appointment_id' => $this->appointment->id,
            'subjective' => 'Notas del paciente',
        ]);

        $this->fileName = 'laboratorio_sangre.pdf';
        $this->storagePath = 'medical_attachments/' . time() . '_' . $this->fileName;

        // Guardar archivo estrictamente en disco privado
        Storage::disk('private')->put($this->storagePath, 'Contenido confidencial del examen médico');

        $this->attachment = MedicalAttachment::create([
            'id' => (string) Str::uuid(),
            'record_id' => $this->record->id,
            'user_id' => $this->patient->id,
            'file_name' => $this->fileName,
            'file_type' => 'application/pdf',
            'file_size' => 1024,
            'storage_path' => $this->storagePath,
            'category' => 'lab_result',
        ]);
    }

    public function test_authorized_patient_can_download_attachment(): void
    {
        Sanctum::actingAs($this->patient);

        $response = $this->get("/api/medical-attachments/{$this->attachment->id}/download");

        $response->assertStatus(200);
        $response->assertHeader('content-disposition', 'attachment; filename=' . $this->fileName);
    }

    public function test_authorized_doctor_can_download_attachment(): void
    {
        Sanctum::actingAs($this->doctor);

        $response = $this->get("/api/medical-attachments/{$this->attachment->id}/download");

        $response->assertStatus(200);
        $response->assertHeader('content-disposition', 'attachment; filename=' . $this->fileName);
    }

    public function test_unauthorized_other_patient_gets_403_on_download(): void
    {
        Sanctum::actingAs($this->otherPatient);

        $response = $this->getJson("/api/medical-attachments/{$this->attachment->id}/download");

        $response->assertStatus(403);
    }

    public function test_unauthorized_other_doctor_gets_403_on_download(): void
    {
        Sanctum::actingAs($this->otherDoctor);

        $response = $this->getJson("/api/medical-attachments/{$this->attachment->id}/download");

        $response->assertStatus(403);
    }

    public function test_old_public_url_returns_404_preventing_unauthenticated_leakage(): void
    {
        // El archivo NO debe existir en el disco público
        $this->assertFalse(Storage::disk('public')->exists($this->storagePath));

        // Petición no autenticada a la ruta del symlink público
        $response = $this->get('/storage/' . $this->storagePath);
        $response->assertStatus(404);
    }
}
