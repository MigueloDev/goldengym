<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pathology extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    protected $table = 'pathologies';

    // Relación muchos a muchos con clientes
    public function clients()
    {
        return $this->belongsToMany(Client::class, 'client_pathology')
                    ->withPivot('notes')
                    ->withTimestamps();
    }

    // Scope para buscar por nombre
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', '%' . $search . '%');
    }
}
