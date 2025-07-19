<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'method',
        'amount',
        'reference',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relaciones
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    // Scopes
    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    /*
    'cash_usd', 'cash_local', 'card_usd', 'card_local', 'transfer_usd', 'transfer_local', 'crypto','other'
    */
    // Métodos auxiliares
    public function getMethodLabelAttribute()
    {
        $labels = [
            'cash_usd' => 'Efectivo USD',
            'cash_local' => 'Efectivo VES',
            'card_usd' => 'Tarjeta USD',
            'card_local' => 'Tarjeta VES',
            'transfer_usd' => 'Transferencia USD',
            'transfer_local' => 'Transferencia VES',
            'crypto' => 'Crypto',
            'other' => 'Otro',
        ];

        return $labels[$this->method] ?? $this->method;
    }

    public function getMethodColorAttribute()
    {
        $colors = [
            'cash_usd' => 'bg-green-100 text-green-800',
            'cash_local' => 'bg-green-100 text-green-800',
            'card_usd' => 'bg-blue-100 text-blue-800',
            'card_local' => 'bg-blue-100 text-blue-800',
            'transfer_usd' => 'bg-purple-100 text-purple-800',
            'transfer_local' => 'bg-purple-100 text-purple-800',
            'crypto' => 'bg-purple-100 text-purple-800',
            'other' => 'bg-gray-100 text-gray-800',
        ];

        return $colors[$this->method] ?? 'bg-gray-100 text-gray-800';
    }
}