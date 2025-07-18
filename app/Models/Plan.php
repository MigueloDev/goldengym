<?php

namespace App\Models;

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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_usd' => 'decimal:2',
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
        $startDate = $startDate ?: now();
        return $startDate->addDays($this->renewal_period_days);
    }
}
