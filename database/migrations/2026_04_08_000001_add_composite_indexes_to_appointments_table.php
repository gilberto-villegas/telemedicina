<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['doctor_id', 'status_id', 'start_time'], 'idx_appointments_doctor_status_time');
            $table->index(['patient_id', 'status_id', 'start_time'], 'idx_appointments_patient_status_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('idx_appointments_doctor_status_time');
            $table->dropIndex('idx_appointments_patient_status_time');
        });
    }
};
