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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('type', ['patient', 'doctor', 'clinic_admin', 'pharmacy', 'admin'])->change();
            $table->boolean('is_blocked')->default(false)->after('is_verified');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('type', ['patient', 'doctor', 'clinic_admin', 'pharmacy'])->change();
            $table->dropColumn('is_blocked');
        });
    }
};
