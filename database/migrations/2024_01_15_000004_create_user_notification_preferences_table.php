<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->json('channels')->comment('Canales habilitados: email, push, whatsapp');
            $table->json('categories')->nullable()->comment('Categorías habilitadas por tipo de notificación');
            $table->json('quiet_hours')->nullable()->comment('Horas silenciosas: {start: "22:00", end: "08:00"}');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
