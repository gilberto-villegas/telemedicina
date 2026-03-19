<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Eliminar todos los índices relacionados con qr_code
        $indexes = DB::select("SHOW INDEX FROM prescriptions WHERE Column_name = 'qr_code'");
        foreach ($indexes as $index) {
            try {
                DB::statement("ALTER TABLE prescriptions DROP INDEX `{$index->Key_name}`");
            } catch (\Exception $e) {
                // Continuar si el índice no existe
            }
        }
        
        // Cambiar el tipo de columna a text nullable usando SQL directo
        DB::statement('ALTER TABLE prescriptions MODIFY qr_code TEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->string('qr_code', 500)->nullable(false)->unique()->change();
        });
    }
};
