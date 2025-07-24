<?php

use App\Models\Client;
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
        Client::truncate();

        Schema::table('clients', function (Blueprint $table) {
            $table->string('identification_number')->unique();
            $table->string('identification_prefix')->nullable();
        });

        DB::table('template_keys')->insert([
                'name' => 'CEDULA_CLIENTE',
                'query_method' => 'client_identification',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('identification_number');
            $table->dropColumn('identification_prefix');
        });
    }
};
