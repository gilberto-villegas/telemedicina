<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('appointment_id')->nullable();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Montos
            $table->decimal('amount_usd', 10, 2);
            $table->decimal('amount_ves', 15, 2)->nullable();
            $table->decimal('exchange_rate', 10, 4);
            $table->string('currency', 3)->default('USD');
            
            // Método de pago
            $table->enum('method', [
                'pago_movil',
                'bank_transfer',
                'zelle',
                'paypal',
                'wise',
                'cash',
                'crypto'
            ]);
            
            $table->string('provider', 50)->nullable(); // Banesco, Mercantil, etc.
            $table->string('reference_number', 100)->nullable();
            $table->string('transaction_id', 100)->nullable();
            
            // Estado
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->text('failure_reason')->nullable();
            
            // Comprobante
            $table->string('proof_url', 500)->nullable(); // Imagen del comprobante
            
            // Facturación SENIAT
            $table->string('invoice_number', 50)->nullable()->unique();
            $table->string('invoice_url', 500)->nullable();
            $table->timestamp('invoice_generated_at')->nullable();
            
            $table->timestamps();
            
            $table->index('appointment_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

