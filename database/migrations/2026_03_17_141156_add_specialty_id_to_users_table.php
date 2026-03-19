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
        if (Schema::hasColumn('users', 'specialty_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('specialty_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('specialty_id')->after('specialty')->nullable();
            $table->foreign('specialty_id')->references('id')->on('specialties')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
            $table->dropColumn('specialty_id');
        });
    }
};
