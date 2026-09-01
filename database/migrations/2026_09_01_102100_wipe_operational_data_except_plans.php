<?php

use App\Models\Client;
use App\Models\Payment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One-shot wipe of operational data. Keeps plans, users, document
     * templates, template keys, and the pathologies catalog.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach (['payments', 'membership_renewals', 'memberships', 'client_pathology'] as $table) {
            DB::table($table)->delete();
        }

        DB::table('files')->whereIn('fileable_type', [Client::class, Payment::class])->delete();
        DB::table('clients')->delete();

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Irreversible without a backup.
     */
    public function down(): void
    {
        //
    }
};
