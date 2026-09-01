<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * memberships.client_id estaba en CASCADE: un borrado duro de un cliente
     * arrastraba sus membresías (y con ellas las renovaciones), dejando pagos
     * y archivos huérfanos. Con soft delete esto nunca se dispara en la
     * aplicación; el RESTRICT es la red de seguridad ante un DELETE directo.
     */
    public function up(): void
    {
        // SQLite (usado en los tests) no permite alterar claves foráneas.
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('memberships', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->foreign('client_id')->references('id')->on('clients')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('memberships', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
        });
    }
};
