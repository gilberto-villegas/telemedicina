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
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->decimal('total_amount_usd', 8, 2);
            $table->decimal('total_fee_usd', 8, 2);
            $table->decimal('net_amount_usd', 8, 2);
            $table->decimal('net_amount_ves', 12, 2);
            $table->decimal('exchange_rate', 10, 4);
            $table->enum('status', ['pending', 'completed', 'rejected'])->default('pending');
            $table->string('receipt_image_url')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
