<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_availability', function (Blueprint $table) {
            $table->id();
            $table->uuid('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->tinyInteger('day_of_week')->comment('0=Domingo, 1=Lunes, ..., 6=Sábado');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            
            $table->timestamps();
            
            $table->unique(['doctor_id', 'day_of_week', 'start_time', 'end_time'], 'unique_doctor_slot');
            $table->index(['doctor_id', 'day_of_week'], 'idx_doctor_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_availability');
    }
};

