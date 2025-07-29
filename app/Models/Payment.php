<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payable_id',
        'payable_type',
        'amount',
        'currency',
        'exchange_rate',
        'selected_price',
        'selected_currency',
        'payment_date',
        'payment_method',
        'reference',
        'registered_by',
        'notes',
        'membership_id',
    ];

    protected $casts = [
        'amount' => 'float',
        'payment_date' => 'date',
    ];

    protected $appends = ['method_color', 'method_label'];

    public function file()
    {
        return $this->morphOne(File::class, 'fileable');
    }

    public function paymentEvidences()
    {
        return $this->morphMany(File::class, 'fileable')->where('type', 'payment_evidence');
    }

    public function payable()
    {
        return $this->morphTo();
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function getPaymentTypeLabel()
    {
        return $this->isMembershipPayment() ? 'Membresía Nueva' : 'Renovación';
    }

    // Scopes
    public function scopeByMonth($query, $month = null, $year = null)
    {
        $month = $month ?: now()->month;
        $year = $year ?: now()->year;

        return $query->whereMonth('payment_date', $month)
                    ->whereYear('payment_date', $year);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    public function scopeByCurrency($query, $currency)
    {
        return $query->where('currency', $currency);
    }

    // Métodos auxiliares para evidencias de pago
    public function hasPaymentEvidences()
    {
        return $this->paymentEvidences()->exists();
    }

    public function getPaymentEvidencesCount()
    {
        return $this->paymentEvidences()->count();
    }

    public function addPaymentEvidence($file)
    {
        if (env('APP_ENV') === 'local') {
            $path = $file->store('payments/evidences', 'public');
        } else {
            $path = $file->store('payments/evidences', 's3');
        }

        return $this->paymentEvidences()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => 'payment_evidence',
        ]);
    }

    // Métodos auxiliares para payment methods
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

        return $labels[$this->payment_method] ?? $this->payment_method;
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

        return $colors[$this->payment_method] ?? 'bg-gray-100 text-gray-800';
    }

    public function membership()
    {
        return $this->belongsTo(Membership::class, 'membership_id');
    }
}
