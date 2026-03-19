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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_phone', 20)->nullable()->after('transaction_id');
            $table->date('payment_date')->nullable()->after('payment_phone');
        });

        // Add pending_verification to appointments status enum
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'pending_payment', 'pending_verification') DEFAULT 'pending_payment'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_phone', 'payment_date']);
        });

        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'pending_payment') DEFAULT 'pending_payment'");
    }
};
