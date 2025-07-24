<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
        'amount_paid',
        'currency',
        'registered_by',
        'notes',
        'plan_price_paid',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount_paid' => 'float',
        'plan_price_paid' => 'float',
    ];

    // Relaciones
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function renewals()
    {
        return $this->hasMany(MembershipRenewal::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 3)
    {
        return $query->where('end_date', '<=', now()->addDays($days))
                    ->where('end_date', '>=', now());
    }

    public function scopeByMonth($query, $month = null, $year = null)
    {
        $month = $month ?: now()->month;
        $year = $year ?: now()->year;

        return $query->whereMonth('start_date', $month)
                    ->whereYear('start_date', $year);
    }

    // Métodos auxiliares
    public function isActive()
    {
        return $this->status === 'active' && $this->end_date >= now();
    }

    public function isExpired()
    {
        return $this->end_date < now();
    }

    public function isExpiringSoon($days = 3)
    {
        return $this->end_date <= now()->addDays($days) && $this->end_date >= now();
    }

    public function getDaysUntilExpiration()
    {
        return now()->diffInDays($this->end_date, false);
    }

    // Método estático para verificar si un cliente tiene membresía activa
    public static function hasActiveMembership($clientId)
    {
        return static::where('client_id', $clientId)
            ->where('status', 'active')
            ->exists();
    }

    // Método estático para obtener la membresía activa de un cliente
    public static function getActiveMembership($clientId)
    {
        return static::where('client_id', $clientId)
            ->where('status', 'active')
            ->first();
    }
}

