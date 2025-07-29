<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'price_usd',
        'renewal_period_days',
        'status',
        'features',
        'subscription_price_usd',
        'subscription_price_local',
    ];

    protected $casts = [
        'price' => 'float',
        'price_usd' => 'float',
        'features' => 'array',
    ];

    // Relaciones
    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function activeMemberships()
    {
        return $this->hasMany(Membership::class)->where('status', 'active');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Métodos auxiliares
    public function getDiscountPercentage()
    {
        if ($this->price <= 0) return 0;

        return round((($this->price - $this->price_usd) / $this->price) * 100, 2);
    }

    public function calculateEndDate($startDate = null)
    {
        $startDate = $startDate ? Carbon::parse($startDate) : now();
        return $startDate->addDays($this->renewal_period_days);
    }

    /**
     * Calcula la nueva fecha de vencimiento para una renovación
     * Si la membresía está vencida, calcula desde hoy
     * Si no está vencida, calcula desde la fecha de vencimiento actual
     */
    public function calculateRenewalEndDate(Membership $membership)
    {
        $today = now();

        // Si la membresía está vencida, calcular desde hoy
        if ($membership->isExpired()) {
            return $today->addDays($this->renewal_period_days);
        }

        // Si no está vencida, calcular desde la fecha de vencimiento actual
        return Carbon::parse($membership->end_date)->addDays($this->renewal_period_days);
    }

    /**
     * Obtiene la última renovación de una membresía
     */
    public function getLastRenewalDate(Membership $membership)
    {
        $lastRenewal = $membership->renewals()
            ->orderBy('new_end_date', 'desc')
            ->first();

        return $lastRenewal ? $lastRenewal->new_end_date : $membership->end_date;
    }

    /**
     * Calcula la nueva fecha de vencimiento considerando la última renovación
     */
    public function calculateSmartRenewalEndDate(Membership $membership)
    {
        $today = now();
        $lastRenewalDate = $this->getLastRenewalDate($membership);

        // Si la última renovación está vencida, calcular desde hoy
        if ($lastRenewalDate < $today) {
            return $today->addDays($this->renewal_period_days);
        }

        // Si no está vencida, calcular desde la fecha de la última renovación
        return Carbon::parse($lastRenewalDate)->addDays($this->renewal_period_days);
    }

    /**
     * Obtiene información detallada sobre el cálculo de renovación
     */
    public function getRenewalInfo(Membership $membership)
    {
        $today = now();
        $lastRenewalDate = $this->getLastRenewalDate($membership);
        $isExpired = $lastRenewalDate < $today;
        $newEndDate = $this->calculateSmartRenewalEndDate($membership);

        return [
            'is_expired' => $isExpired,
            'current_end_date' => $lastRenewalDate->format('Y-m-d'),
            'new_end_date' => $newEndDate->format('Y-m-d'),
            'days_added' => $this->renewal_period_days,
            'calculation_basis' => $isExpired ? 'Desde hoy' : 'Desde fecha de vencimiento actual',
            'days_until_expiration' => $isExpired ? 0 : (int) $today->diffInDays($lastRenewalDate, false),
        ];
    }
}
