<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Status;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add status_id to appointments
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('status_id')->nullable()->after('status')->constrained('statuses');
        });

        // 2. Add status_id to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('status_id')->nullable()->after('status')->constrained('statuses');
        });

        // 3. Migrate data for appointments
        $aptStatuses = Status::where('type', 'appointment')->get();
        foreach ($aptStatuses as $status) {
            DB::table('appointments')
                ->where('status', $status->name)
                ->update(['status_id' => $status->id]);
        }

        // 4. Migrate data for payments
        $pmtStatuses = Status::where('type', 'payment')->get();
        foreach ($pmtStatuses as $status) {
            // Map 'pending' to 'payment_pending', etc.
            $oldName = str_replace('payment_', '', $status->name);
            DB::table('payments')
                ->where('status', $oldName)
                ->update(['status_id' => $status->id]);
        }

        // 5. Cleanup: Make status_id required and remove old status column
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('status')->nullable()->after('status_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('status')->nullable()->after('status_id');
        });

        // Inverse migration logic...
        $statuses = Status::all();
        foreach ($statuses as $status) {
             $oldName = str_replace('payment_', '', $status->name);
             DB::table('appointments')
                ->where('status_id', $status->id)
                ->update(['status' => $status->name]);
             
             DB::table('payments')
                ->where('status_id', $status->id)
                ->update(['status' => $oldName]);
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });
    }
};
