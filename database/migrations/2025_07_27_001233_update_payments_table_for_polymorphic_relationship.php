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
        Schema::table('payments', function (Blueprint $table) {
            // Agregar campos polimórficos
            $table->unsignedBigInteger('payable_id')->nullable()->after('id');
            $table->string('payable_type')->nullable()->after('payable_id');

            // Agregar índices para mejorar rendimiento
            $table->index(['payable_id', 'payable_type']);
        });

        // Migrar datos existentes
        DB::statement("
            UPDATE payments
            SET payable_id = membership_id,
                payable_type = 'App\\Models\\Membership'
            WHERE membership_id IS NOT NULL
        ");

        // Eliminar columna antigua después de migrar
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['membership_id']);
            $table->dropColumn('membership_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Restaurar columna original
            $table->unsignedBigInteger('membership_id')->nullable()->after('id');
            $table->foreign('membership_id')->references('id')->on('memberships')->onDelete('cascade');
        });

        // Migrar datos de vuelta
        DB::statement("
            UPDATE payments
            SET membership_id = payable_id
            WHERE payable_type = 'App\\Models\\Membership'
        ");

        Schema::table('payments', function (Blueprint $table) {
            // Eliminar campos polimórficos
            $table->dropIndex(['payable_id', 'payable_type']);
            $table->dropColumn(['payable_id', 'payable_type']);
        });
    }
};
