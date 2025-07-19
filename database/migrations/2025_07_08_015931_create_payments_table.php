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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->decimal('exchange_rate', 16, 2)->nullable();
            $table->date('payment_date');
            $table->enum('payment_method', ['cash_usd', 'cash_local', 'card_usd', 'card_local', 'transfer_usd', 'transfer_local', 'crypto','other']);
            $table->enum('currency', ['local', 'usd'])->default('local');
            $table->string('reference')->nullable(); // Referencia de transferencia, etc.
            $table->foreignId('registered_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
