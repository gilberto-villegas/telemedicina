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
        // 1. Change 'type' column from enum to string
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('type')->default('videoconsulta')->change();
        });

        // 2. Migrate existing data
        \Illuminate\Support\Facades\DB::table('appointments')->where('type', 'virtual')->update(['type' => 'videoconsulta']);
        \Illuminate\Support\Facades\DB::table('appointments')->where('type', 'in_person')->update(['type' => 'presencial']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('type', ['virtual', 'in_person'])->default('virtual')->change();
        });

        \Illuminate\Support\Facades\DB::table('appointments')->where('type', 'videoconsulta')->update(['type' => 'virtual']);
        \Illuminate\Support\Facades\DB::table('appointments')->where('type', 'teleconsulta')->update(['type' => 'virtual']);
        \Illuminate\Support\Facades\DB::table('appointments')->where('type', 'presencial')->update(['type' => 'in_person']);
    }
};
