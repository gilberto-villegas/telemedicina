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
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Slug: e.g., 'scheduled'
            $table->string('label'); // Spanish: e.g., 'Programada'
            $table->string('type'); // 'appointment', 'payment', 'both'
            $table->string('color')->nullable(); // hex or tailwind class
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};
