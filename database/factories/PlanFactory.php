<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'price_usd' => $this->faker->randomFloat(2, 5, 50),
            'renewal_period_days' => $this->faker->randomElement([30, 60, 90, 180, 365]),
            'status' => 'active',
            'features' => [
                'gym_access' => true,
                'personal_trainer' => $this->faker->boolean(),
                'group_classes' => $this->faker->boolean(),
                'pool_access' => $this->faker->boolean(),
            ],
            'subscription_price_usd' => $this->faker->randomFloat(2, 3, 30),
            'subscription_price_local' => $this->faker->randomFloat(2, 30, 300),
        ];
    }

    /**
     * Indicate that the plan is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the plan is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}
