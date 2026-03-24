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
        Schema::create('banks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 4)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('bank_id')->nullable()->after('bank_name');
            $table->uuid('pago_movil_bank_id')->nullable()->after('pago_movil_bank');

            $table->foreign('bank_id')->references('id')->on('banks')->onDelete('set null');
            $table->foreign('pago_movil_bank_id')->references('id')->on('banks')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['bank_id']);
            $table->dropForeign(['pago_movil_bank_id']);
            $table->dropColumn(['bank_id', 'pago_movil_bank_id']);
        });
        Schema::dropIfExists('banks');
    }
};
