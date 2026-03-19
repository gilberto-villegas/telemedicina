<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('appointment_id');
            
            // Datos clínicos (SOAP)
            $table->text('subjective')->nullable()->comment('Lo que el paciente reporta');
            $table->text('objective')->nullable()->comment('Hallazgos del médico');
            $table->text('assessment')->nullable()->comment('Diagnóstico');
            $table->text('plan')->nullable()->comment('Plan de tratamiento');
            
            // Códigos estandarizados
            $table->json('diagnosis_codes')->nullable()->comment('Array de códigos CIE-10');
            $table->json('procedure_codes')->nullable()->comment('Array de códigos procedimientos');
            
            // Signos vitales
            $table->string('blood_pressure', 10)->nullable();
            $table->unsignedInteger('heart_rate')->nullable();
            $table->decimal('temperature', 4, 2)->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            
            $table->timestamps();
            
            $table->index('patient_id');
            $table->index('appointment_id');
            $table->index('created_at');
            
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};

