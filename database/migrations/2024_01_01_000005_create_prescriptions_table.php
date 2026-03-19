<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('appointment_id')->nullable();
            $table->uuid('medical_record_id')->nullable();

            // QR Code
            $table->text('qr_code')->nullable(); // Se genera cuando se necesita
            $table->string('qr_secret')->unique(); // Clave única para encriptación

            // Medicamentos (JSON)
            $table->json('medications'); // Array de medicamentos

            // Integración farmacia
            $table->json('available_pharmacies')->nullable();
            $table->uuid('reserved_pharmacy_id')->nullable();
            $table->dateTime('reservation_expires_at')->nullable();

            // Tracking
            $table->enum('status', ['issued', 'filled', 'partially_filled', 'expired'])->default('issued');
            $table->timestamp('filled_at')->nullable();
            $table->uuid('pharmacy_id')->nullable();

            $table->text('instructions')->nullable();
            $table->date('valid_until');

            $table->timestamps();

            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('status');


            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');
            $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
