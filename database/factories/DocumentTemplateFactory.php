<?php

namespace Database\Factories;

use App\Models\DocumentTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentTemplate>
 */
class DocumentTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $templates = [
            'Certificado Médico',
            'Receta Médica',
            'Informe de Evaluación',
            'Plan de Tratamiento',
            'Consentimiento Informado',
            'Historia Clínica',
            'Orden de Laboratorio',
            'Referencia Médica'
        ];

        return [
            'name' => fake()->unique()->randomElement($templates),
            'content' => fake()->paragraphs(3, true),
            'is_active' => fake()->boolean(80), // 80% probability of being active
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the template is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the template is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
