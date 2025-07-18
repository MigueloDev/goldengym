<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TemplateKeys;

class TemplateKeysSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templateKeys = [
            [
                'name' => 'nombre_cliente',
                'query_method' => 'name',
            ],
            [
                'name' => 'email_cliente',
                'query_method' => 'email',
            ],
            [
                'name' => 'telefono_cliente',
                'query_method' => 'phone',
            ],
            [
                'name' => 'direccion_cliente',
                'query_method' => 'address',
            ],
            [
                'name' => 'fecha_nacimiento',
                'query_method' => 'birth_date',
            ],
            [
                'name' => 'genero_cliente',
                'query_method' => 'gender',
            ],
            [
                'name' => 'edad_cliente',
                'query_method' => 'age',
            ],
            [
                'name' => 'estado_membresia',
                'query_method' => 'membership_status',
            ],
            [
                'name' => 'fecha_vencimiento_membresia',
                'query_method' => 'active_membership_end_date',
            ],
            [
                'name' => 'fecha_actual',
                'query_method' => 'current_date',
            ],
            [
                'name' => 'hora_actual',
                'query_method' => 'current_time',
            ],
            [
                'name' => 'nombre_gimnasio',
                'query_method' => 'gym_name',
            ],
            [
                'name' => 'direccion_gimnasio',
                'query_method' => 'gym_address',
            ],
            [
                'name' => 'telefono_gimnasio',
                'query_method' => 'gym_phone',
            ],
        ];

        foreach ($templateKeys as $key) {
            TemplateKeys::firstOrCreate(
                ['name' => $key['name']],
                $key
            );
        }
    }
}
