<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Status;
use App\Models\Specialty;
use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class PerformanceQueryCountTest extends TestCase
{
    public function test_appointment_index_with_10_appointments_executes_at_most_5_queries(): void
    {
        $specialty = Specialty::firstOrCreate(
            ['name' => 'Cardiología'],
            ['slug' => 'cardiologia']
        );

        $status = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $patient = User::factory()->create([
            'email' => 'perf_patient_' . Str::random(6) . '@vilsalud.test'
        ]);

        $doctor = User::factory()->doctor()->create([
            'email' => 'perf_doctor_' . Str::random(6) . '@vilsalud.test',
            'specialty_id' => $specialty->id,
            'is_verified' => true,
        ]);

        // Crear 10 citas
        for ($i = 0; $i < 10; $i++) {
            Appointment::create([
                'id' => (string) Str::uuid(),
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => now()->addDays($i + 1),
                'end_time' => now()->addDays($i + 1)->addMinutes(30),
                'type' => 'videoconsulta',
                'status_id' => $status->id,
                'price_usd' => 30.00,
                'price_ves' => 1500.00,
                'exchange_rate' => 50.00,
            ]);
        }

        Sanctum::actingAs($patient);

        $queryCount = 0;
        $queries = [];
        DB::listen(function ($query) use (&$queryCount, &$queries) {
            $queryCount++;
            $queries[] = $query->sql;
        });

        $response = $this->getJson('/api/appointments');
        $response->assertStatus(200);
        $this->assertCount(10, $response->json());

        // Aseverar que con 10 citas NO hay N+1 (ejecuta ≤ 5 consultas)
        $this->assertLessThanOrEqual(
            5,
            $queryCount,
            "Se detectó problema N+1: se ejecutaron {$queryCount} consultas para 10 citas. Consultas: " . implode(' | ', $queries)
        );
    }

    public function test_chat_index_with_10_appointments_executes_minimal_constant_queries(): void
    {
        $status = Status::firstOrCreate(
            ['name' => 'scheduled'],
            ['label' => 'Programada', 'type' => 'appointment', 'badge_variant' => 'info']
        );

        $patient = User::factory()->create([
            'email' => 'perf_chat_pat_' . Str::random(6) . '@vilsalud.test'
        ]);

        $doctor = User::factory()->doctor()->create([
            'email' => 'perf_chat_doc_' . Str::random(6) . '@vilsalud.test',
            'is_verified' => true,
        ]);

        for ($i = 0; $i < 10; $i++) {
            $apt = Appointment::create([
                'id' => (string) Str::uuid(),
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => now()->addDays($i + 1),
                'end_time' => now()->addDays($i + 1)->addMinutes(30),
                'type' => 'videoconsulta',
                'status_id' => $status->id,
                'price_usd' => 30.00,
                'price_ves' => 1500.00,
                'exchange_rate' => 50.00,
            ]);

            Message::create([
                'appointment_id' => $apt->id,
                'sender_id' => $patient->id,
                'receiver_id' => $doctor->id,
                'message' => 'Mensaje de prueba ' . $i,
            ]);
        }

        Sanctum::actingAs($patient);

        $queryCount = 0;
        DB::listen(function () use (&$queryCount) {
            $queryCount++;
        });

        $response = $this->getJson('/api/chats');
        $response->assertStatus(200);
        $this->assertCount(10, $response->json());

        // Con 10 citas y mensajes, NO debe haber 2 consultas por cita (que serían 20+).
        // Debe ejecutar un número fijo y pequeño (≤ 6 consultas).
        $this->assertLessThanOrEqual(
            6,
            $queryCount,
            "Se detectó N+1 en chat: {$queryCount} consultas."
        );
    }
}
