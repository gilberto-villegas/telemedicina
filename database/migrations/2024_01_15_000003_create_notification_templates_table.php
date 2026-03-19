<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type', 100)->unique()->comment('appointment_reminder, payment_confirmation, etc.');
            $table->string('name', 255);
            $table->string('subject', 255)->nullable()->comment('Para email');
            $table->text('body')->comment('Template con variables {{variable_name}}');
            $table->text('whatsapp_template')->nullable()->comment('Template para WhatsApp');
            $table->string('push_title', 255)->nullable();
            $table->text('push_body')->nullable();
            $table->json('variables')->nullable()->comment('Lista de variables disponibles');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
