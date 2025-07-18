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
        'payment_id',
        'processed_by',
    ];

    protected $casts = [
        'previous_end_date' => 'date',
        'new_end_date' => 'date',
        'amount_paid' => 'decimal:2',
    ];

    // Relaciones
    public function membership()
    {
        return $this->belongsTo(Membership::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
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
}
