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
}
