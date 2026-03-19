<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:create-test 
                            {--force : Forzar creación aunque ya existan}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crea usuarios de prueba: un médico y un paciente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creando usuarios de prueba...');
        
        // Crear médico
        $doctor = $this->createDoctor();
        if ($doctor) {
            $this->info("✓ Médico creado: {$doctor->email} (ID: {$doctor->id})");
        }
        
        // Crear paciente
        $patient = $this->createPatient();
        if ($patient) {
            $this->info("✓ Paciente creado: {$patient->email} (ID: {$patient->id})");
        }
        
        $this->newLine();
        $this->info('Usuarios de prueba creados exitosamente!');
        $this->table(
            ['Tipo', 'Email', 'Contraseña', 'ID'],
            [
                ['Médico', $doctor?->email ?? 'N/A', 'password123', $doctor?->id ?? 'N/A'],
                ['Paciente', $patient?->email ?? 'N/A', 'password123', $patient?->id ?? 'N/A'],
            ]
        );
        
        return Command::SUCCESS;
    }

    private function createDoctor(): ?User
    {
        $email = 'doctor@test.com';
        $force = $this->option('force');
        
        // Verificar si ya existe
        $existing = User::where('email', $email)->first();
        if ($existing && !$force) {
            $this->warn("⚠ Médico con email {$email} ya existe. Usa --force para recrearlo.");
            return null;
        }
        
        if ($existing && $force) {
            $existing->delete();
            $this->info("Eliminando médico existente...");
        }
        
        return User::create([
            'uuid' => Str::uuid(),
            'type' => 'doctor',
            'email' => $email,
            'phone' => '+584121234567',
            'document_id' => 'V-12345678',
            'document_verified' => true,
            'password' => Hash::make('password123'),
            'first_name' => 'Dr. Juan',
            'last_name' => 'Pérez',
            'mpps_number' => 'MPPS-12345',
            'specialty' => 'Cardiología',
            'consultation_price_usd' => 50.00,
            'rating' => 4.8,
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);
    }

    private function createPatient(): ?User
    {
        $email = 'paciente@test.com';
        $force = $this->option('force');
        
        // Verificar si ya existe
        $existing = User::where('email', $email)->first();
        if ($existing && !$force) {
            $this->warn("⚠ Paciente con email {$email} ya existe. Usa --force para recrearlo.");
            return null;
        }
        
        if ($existing && $force) {
            $existing->delete();
            $this->info("Eliminando paciente existente...");
        }
        
        return User::create([
            'uuid' => Str::uuid(),
            'type' => 'patient',
            'email' => $email,
            'phone' => '+584129876543',
            'document_id' => 'V-87654321',
            'document_verified' => true,
            'password' => Hash::make('password123'),
            'first_name' => 'María',
            'last_name' => 'González',
            'birth_date' => '1990-05-15',
            'blood_type' => 'O+',
            'allergies' => 'Ninguna conocida',
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);
    }
}
