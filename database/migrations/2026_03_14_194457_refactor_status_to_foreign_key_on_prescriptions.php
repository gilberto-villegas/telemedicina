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
        // 1. Agregar la columna status_id si no existe
        if (!Schema::hasColumn('prescriptions', 'status_id')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->foreignId('status_id')->nullable()->after('status')->constrained('statuses');
            });
        }

        // 2. Migrar los datos existentes
        $prescriptions = DB::table('prescriptions')->get();
        foreach ($prescriptions as $prescription) {
            $statusName = 'prescription_issued'; // default
            
            switch ($prescription->status) {
                case 'issued': $statusName = 'prescription_issued'; break;
                case 'filled': $statusName = 'prescription_filled'; break;
                case 'partially_filled': $statusName = 'prescription_partially_filled'; break;
                case 'expired': $statusName = 'prescription_expired'; break;
            }

            $statusId = DB::table('statuses')->where('name', $statusName)->first()?->id;

            if ($statusId) {
                DB::table('prescriptions')->where('id', $prescription->id)->update(['status_id' => $statusId]);
            }
        }

        // 3. Hacer status_id obligatorio y eliminar status antiguo
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('status_id')->nullable(false)->change();
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->string('status')->default('issued')->after('status_id');
        });

        // Re-migrar datos si es necesario (opcional)

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });
    }
};
