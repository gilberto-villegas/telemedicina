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
            // Datos Bancarios (Transferencia)
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('bank_document_id')->nullable(); // CI o RIF
            $table->string('bank_account_type')->nullable(); // Corriente o Ahorro

            // Pago Móvil
            $table->string('pago_movil_phone')->nullable();
            $table->string('pago_movil_document_id')->nullable();
            $table->string('pago_movil_bank')->nullable();

            // Zelle
            $table->string('zelle_email')->nullable();
            $table->string('zelle_holder')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_document_id', 'bank_account_type',
                'pago_movil_phone', 'pago_movil_document_id', 'pago_movil_bank',
                'zelle_email', 'zelle_holder'
            ]);
        });
    }
};
