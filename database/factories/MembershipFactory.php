<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Membership>
 */
class MembershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 year', 'now');
        $endDate = Carbon::parse($startDate)->addDays($this->faker->numberBetween(30, 365));

        return [
            'client_id' => Client::factory(),
            'plan_id' => Plan::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 'active',
            'amount_paid' => $this->faker->randomFloat(2, 50, 500),
            'currency' => $this->faker->randomElement(['local', 'usd']),
            'registered_by' => User::factory(),
            'notes' => $this->faker->optional()->sentence(),
            'plan_price_paid' => $this->faker->randomFloat(2, 50, 500),
            'subscription_price_paid' => $this->faker->randomFloat(2, 30, 300),
        ];
    }

    /**
     * Indicate that the membership is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'end_date' => Carbon::now()->addDays($this->faker->numberBetween(1, 30)),
        ]);
    }

    /**
     * Indicate that the membership is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'end_date' => Carbon::now()->subDays($this->faker->numberBetween(1, 30)),
        ]);
    }

    /**
     * Indicate that the membership is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
