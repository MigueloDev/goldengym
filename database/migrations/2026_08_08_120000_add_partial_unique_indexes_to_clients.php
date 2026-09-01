<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Los índices únicos originales no consideran deleted_at, por lo que un
     * cliente eliminado bloquea para siempre su correo y su cédula. Se
     * reemplazan por índices parciales que solo aplican a los clientes vivos.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique('clients_email_unique');
            $table->dropUnique('clients_identification_number_unique');
        });

        DB::statement('CREATE UNIQUE INDEX clients_email_active_unique ON clients (email) WHERE deleted_at IS NULL');
        DB::statement('CREATE UNIQUE INDEX clients_identification_number_active_unique ON clients (identification_number) WHERE deleted_at IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS clients_email_active_unique');
        DB::statement('DROP INDEX IF EXISTS clients_identification_number_active_unique');

        Schema::table('clients', function (Blueprint $table) {
            $table->unique('email');
            $table->unique('identification_number');
        });
    }
};
