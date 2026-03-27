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
        Schema::table('appointments', function (Blueprint $table) {
            $table->decimal('platform_fee_percentage', 5, 2)->nullable()->after('price_ves');
            $table->decimal('platform_fee_amount_usd', 8, 2)->nullable()->after('platform_fee_percentage');
            $table->decimal('doctor_earnings_usd', 8, 2)->nullable()->after('platform_fee_amount_usd');
            $table->decimal('doctor_earnings_ves', 12, 2)->nullable()->after('doctor_earnings_usd');
            $table->enum('doctor_payment_status', ['pending', 'requested', 'paid'])->default('pending')->after('doctor_earnings_ves');
            $table->uuid('withdrawal_request_id')->nullable()->after('doctor_payment_status');
            
            $table->foreign('withdrawal_request_id')->references('id')->on('withdrawal_requests')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['withdrawal_request_id']);
            $table->dropColumn([
                'platform_fee_percentage',
                'platform_fee_amount_usd',
                'doctor_earnings_usd',
                'doctor_earnings_ves',
                'doctor_payment_status',
                'withdrawal_request_id'
            ]);
        });
    }
};
