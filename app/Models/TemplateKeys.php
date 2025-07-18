<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TemplateKeys extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'query_method'];

    public function getQueryMethodAttribute()
    {
        return $this->attributes['query_method'];
    }

    public function getPlaceholderAttribute()
    {
        return '[[' . $this->name . ']]';
    }

    public function getDescriptionAttribute()
    {
        $descriptions = [
            'name' => 'Nombre completo del cliente',
            'email' => 'Correo electrónico del cliente',
            'phone' => 'Teléfono del cliente',
            'address' => 'Dirección del cliente',
            'birth_date' => 'Fecha de nacimiento del cliente',
            'gender' => 'Género del cliente',
            'age' => 'Edad del cliente',
            'membership_status' => 'Estado de la membresía',
            'active_membership_end_date' => 'Fecha de vencimiento de la membresía activa',
            'current_date' => 'Fecha actual',
            'current_time' => 'Hora actual',
            'gym_name' => 'Nombre del gimnasio',
            'gym_address' => 'Dirección del gimnasio',
            'gym_phone' => 'Teléfono del gimnasio'
        ];

        return $descriptions[$this->query_method] ?? 'Variable personalizada';
    }
}
