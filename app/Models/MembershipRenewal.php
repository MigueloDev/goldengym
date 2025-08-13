<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MembershipRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'membership_id',
        'previous_end_date',
        'new_end_date',
        'amount_paid',
        'currency',
        'processed_by',
    ];

    protected $casts = [
        'previous_end_date' => 'date',
        'new_end_date' => 'date',
        'amount_paid' => 'float',
    ];

    protected $appends = [
        'sum_local_payments',
        'sum_usd_payments',
    ];

    // Relaciones
    public function membership()
    {
        return $this->belongsTo(Membership::class);
    }

    public function client()
    {
        return $this->hasOneThrough(Client::class, Membership::class, 'id', 'id', 'membership_id', 'client_id');
    }

    public function plan()
    {
        return $this->hasOneThrough(Plan::class, Membership::class, 'id', 'id', 'membership_id', 'plan_id');
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable', 'payable_type', 'payable_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Scopes
    public function scopeByMonth($query, $month = null, $year = null)
    {
        $month = $month ?: now()->month;
        $year = $year ?: now()->year;

        return $query->whereMonth('created_at', $month)
                    ->whereYear('created_at', $year);
    }

    public static function hasRecentRenewal($membershipId, $hours = 24)
    {
        return static::where('membership_id', $membershipId)
            ->where('created_at', '>=', now()->subHours($hours))
            ->exists();
    }

    public static function getRecentRenewal($membershipId, $hours = 24)
    {
        return static::where('membership_id', $membershipId)
            ->where('created_at', '>=', now()->subHours($hours))
            ->first();
    }

    public function getSumLocalPaymentsAttribute()
    {
        return $this->payments()->where('currency', '=', 'local')->sum('amount');
    }

    public function getSumUsdPaymentsAttribute()
    {
        return $this->payments()->where('currency', '=', 'usd')->sum('amount');
    }
}
