<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $templateKeys = [
            // Datos básicos del cliente
            [
                'name' => 'CLIENTE_NOMBRE',
                'query_method' => 'name',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_EMAIL',
                'query_method' => 'email',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_TELEFONO',
                'query_method' => 'phone',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_DIRECCION',
                'query_method' => 'address',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_FECHA_NACIMIENTO',
                'query_method' => 'birth_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_GENERO',
                'query_method' => 'gender',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_EDAD',
                'query_method' => 'age',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CLIENTE_NOTAS',
                'query_method' => 'notes',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Estado de membresía
            [
                'name' => 'ESTADO_MEMBRESIA',
                'query_method' => 'membership_status',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FECHA_FIN_MEMBRESIA',
                'query_method' => 'active_membership_end_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Datos de la membresía activa
            [
                'name' => 'PLAN_MEMBRESIA',
                'query_method' => 'active_membership_plan_name',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PRECIO_PLAN',
                'query_method' => 'active_membership_plan_price',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FECHA_INICIO_MEMBRESIA',
                'query_method' => 'active_membership_start_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Patologías del cliente
            [
                'name' => 'PATOLOGIAS_LISTA',
                'query_method' => 'pathologies_list',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PATOLOGIAS_COUNT',
                'query_method' => 'pathologies_count',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Información del gimnasio
            [
                'name' => 'NOMBRE_GIMNASIO',
                'query_method' => 'gym_name',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'DIRECCION_GIMNASIO',
                'query_method' => 'gym_address',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TELEFONO_GIMNASIO',
                'query_method' => 'gym_phone',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'EMAIL_GIMNASIO',
                'query_method' => 'gym_email',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Fechas y tiempo
            [
                'name' => 'FECHA_ACTUAL',
                'query_method' => 'current_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'HORA_ACTUAL',
                'query_method' => 'current_time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FECHA_HORA_ACTUAL',
                'query_method' => 'current_datetime',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('template_keys')->insert($templateKeys);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('template_keys')->truncate();
    }
};
