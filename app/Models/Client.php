<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'birth_date',
        'gender',
        'status',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    // Relación polimórfica con archivos
    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    // Archivos específicos
    public function profilePhoto()
    {
        return $this->morphOne(File::class, 'fileable')->where('type', 'profile_photo');
    }

    public function documents()
    {
        return $this->morphMany(File::class, 'fileable')->where('type', 'document');
    }

    // Relaciones
    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function activeMembership()
    {
        return $this->hasOne(Membership::class)->where('status', 'active');
    }

    public function documentSignatures()
    {
        return $this->hasMany(DocumentSignature::class);
    }

    // Relación muchos a muchos con patologías
    public function pathologies()
    {
        return $this->belongsToMany(Pathologies::class, 'client_pathology')
                    ->withPivot('notes')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithExpiringSoon($query, $days = 3)
    {
        return $query->whereHas('activeMembership', function ($q) use ($days) {
            $q->where('end_date', '<=', now()->addDays($days))
              ->where('end_date', '>=', now());
        });
    }

    // Métodos auxiliares
    public function hasActiveMembership()
    {
        return $this->activeMembership()->exists();
    }

    public function getMembershipStatus()
    {
        $membership = $this->activeMembership;

        if (!$membership) {
            return 'no_membership';
        }

        if ($membership->end_date < now()) {
            return 'expired';
        }

        if ($membership->end_date <= now()->addDays(3)) {
            return 'expiring_soon';
        }

        return 'active';
    }

    // Método para obtener la edad del cliente
    public function getAge()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    // Método para obtener el estado de membresía con colores
    public function getMembershipStatusColor()
    {
        $status = $this->getMembershipStatus();

        return match($status) {
            'active' => 'success',
            'expiring_soon' => 'warning',
            'expired' => 'danger',
            default => 'secondary'
        };
    }
}
