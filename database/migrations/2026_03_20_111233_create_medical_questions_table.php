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
        Schema::create('medical_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('doctor_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('type', ['text', 'select', 'body_map', 'file'])->default('text');
            $table->json('options')->nullable(); // For select type
            $table->integer('order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_questions');
    }
};
