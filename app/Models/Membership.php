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
        'subscription_price_paid',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount_paid' => 'float',
        'plan_price_paid' => 'float',
    ];

    protected $appends = ['sum_local_payments', 'sum_usd_payments'];

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
        return $this->morphMany(Payment::class, 'payable');
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

    /**
     * Obtiene la última renovación de esta membresía
     */
    public function getLastRenewal()
    {
        return $this->renewals()
            ->orderBy('new_end_date', 'desc')
            ->first();
    }

    /**
     * Obtiene la fecha de vencimiento efectiva (considerando renovaciones)
     */
    public function getEffectiveEndDate()
    {
        $lastRenewal = $this->getLastRenewal();
        return $lastRenewal ? $lastRenewal->new_end_date : $this->end_date;
    }

    /**
     * Verifica si la membresía está vencida considerando renovaciones
     */
    public function isEffectivelyExpired()
    {
        return $this->getEffectiveEndDate() < now();
    }

    /**
     * Verifica si la membresía está activa considerando renovaciones
     */
    public function isEffectivelyActive()
    {
        return $this->status === 'active' && $this->getEffectiveEndDate() >= now();
    }

    /**
     * Calcula cuántos días faltan para que venza (considerando renovaciones)
     */
    public function getDaysUntilEffectiveExpiration()
    {
        $effectiveEndDate = $this->getEffectiveEndDate();
        return max(0, now()->diffInDays($effectiveEndDate, false));
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

    public function getSumLocalPaymentsAttribute()
    {
        return $this->payments()->where('currency', '=', 'local')->sum('amount');
    }

    public function getSumUsdPaymentsAttribute()
    {
        return $this->payments()->where('currency', '=', 'usd')->sum('amount');
    }
}

