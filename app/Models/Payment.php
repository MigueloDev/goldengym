<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'membership_id',
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
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function file()
    {
        return $this->morphOne(File::class, 'fileable');
    }

    // Evidencias de pago (múltiples archivos)
    public function paymentEvidences()
    {
        return $this->morphMany(File::class, 'fileable')->where('type', 'payment_evidence');
    }

    // Relaciones
    public function membership()
    {
        return $this->belongsTo(Membership::class);
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function renewal()
    {
        return $this->hasOne(MembershipRenewal::class);
    }

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
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
        $path = $file->store('payments/evidences', 'public');

        return $this->paymentEvidences()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => 'payment_evidence',
        ]);
    }
}
