<?php

namespace Database\Factories;

use App\Models\Pathology;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pathology>
 */
class PathologyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pathologies = [
            'Hipertensión',
            'Diabetes',
            'Asma',
            'Artritis',
            'Osteoporosis',
            'Problemas cardíacos',
            'Alergias',
            'Problemas de tiroides',
            'Ansiedad',
            'Depresión',
            'Insomnio',
            'Migraña',
            'Problemas digestivos',
            'Problemas respiratorios',
            'Problemas de espalda'
        ];

        return [
            'name' => fake()->unique()->randomElement($pathologies),
            'description' => fake()->optional()->paragraph(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
