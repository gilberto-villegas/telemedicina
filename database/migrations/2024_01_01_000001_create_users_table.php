<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID como identificador principal
            $table->char('uuid', 36)->unique()->nullable(); // UUID como identificador único alternativo (legacy)
            $table->enum('type', ['patient', 'doctor', 'clinic_admin', 'pharmacy'])->index();
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('document_id', 20)->index(); // Cédula/RIF
            $table->boolean('document_verified')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            
            // Datos específicos paciente
            $table->date('birth_date')->nullable();
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->text('allergies')->nullable();
            
            // Datos específicos doctor
            $table->string('mpps_number', 50)->nullable(); // Número MPPS
            $table->string('specialty', 100)->nullable();
            $table->decimal('consultation_price_usd', 8, 2)->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->boolean('is_verified')->default(false);
            
            // Common
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('avatar_url', 500)->nullable();
            
            $table->timestamps();
            
            // Índices críticos
            $table->index(['type', 'specialty'], 'idx_doctor_specialty');
            $table->index(['email', 'phone'], 'idx_email_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
