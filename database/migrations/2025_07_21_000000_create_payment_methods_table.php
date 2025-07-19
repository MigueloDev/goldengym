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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->enum('method', ['cash_usd', 'cash_local', 'card_usd', 'card_local', 'transfer_usd', 'transfer_local', 'crypto','other']);
            $table->decimal('amount', 16, 2);
            $table->decimal('exchange_rate', 16, 2)->nullable();
            $table->string('reference')->nullable(); // Referencia específica para este método
            $table->text('notes')->nullable(); // Notas específicas para este método
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};