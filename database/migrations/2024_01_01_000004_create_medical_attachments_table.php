<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('record_id');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->string('file_name', 255);
            $table->string('file_type', 100);
            $table->unsignedInteger('file_size');
            $table->string('storage_path', 500); // S3/MinIO path
            $table->string('thumbnail_path', 500)->nullable(); // Versión comprimida
            
            $table->enum('category', ['lab_result', 'prescription', 'image', 'other']);
            
            $table->json('metadata')->nullable()->comment('EXIF, dimensiones, etc.');
            
            $table->timestamps();
            
            $table->index('record_id');
            $table->index(['user_id', 'category'], 'idx_user_category');
            
            $table->foreign('record_id')->references('id')->on('medical_records')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_attachments');
    }
};

