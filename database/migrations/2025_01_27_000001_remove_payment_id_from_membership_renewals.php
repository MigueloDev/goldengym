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
        Schema::table('membership_renewals', function (Blueprint $table) {
            // Eliminar la columna payment_id ya que ahora usamos relación polimórfica
            $table->dropForeign(['payment_id']);
            $table->dropColumn('payment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_renewals', function (Blueprint $table) {
            // Restaurar la columna payment_id
            $table->unsignedBigInteger('payment_id')->nullable()->after('currency');
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('set null');
        });
    }
};
