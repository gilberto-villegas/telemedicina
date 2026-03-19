<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->dateTime('start_time', 6);
            $table->dateTime('end_time', 6);
            $table->text('reason')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->enum('type', ['virtual', 'in_person'])->default('virtual');
            
            // Precios (guardar histórico)
            $table->decimal('price_usd', 8, 2);
            $table->decimal('price_ves', 12, 2);
            $table->decimal('exchange_rate', 10, 4);
            
            // Videollamada
            $table->string('video_room_id', 100)->nullable()->index();
            $table->unsignedInteger('video_duration')->nullable(); // en segundos
            $table->string('recording_url', 500)->nullable();
            
            // Relaciones
            $table->uuid('medical_record_id')->nullable();
            $table->uuid('prescription_id')->nullable();
            $table->uuid('payment_id')->nullable();
            
            $table->timestamps();
            
            // ÍNDICES OBLIGATORIOS (optimización)
            $table->index(['doctor_id', 'status', 'start_time'], 'idx_doctor_schedule');
            $table->index(['patient_id', 'status', 'start_time'], 'idx_patient_schedule');
            $table->index(['start_time', 'end_time'], 'idx_date_range');
            $table->index(['status', 'created_at'], 'idx_status_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};

