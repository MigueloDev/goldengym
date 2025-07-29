<?php

namespace Database\Factories;

use App\Models\Membership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MembershipRenewal>
 */
class MembershipRenewalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $previousEndDate = $this->faker->dateTimeBetween('-1 year', 'now');
        $newEndDate = Carbon::parse($previousEndDate)->addDays($this->faker->numberBetween(30, 365));

        return [
            'membership_id' => Membership::factory(),
            'previous_end_date' => $previousEndDate,
            'new_end_date' => $newEndDate,
            'amount_paid' => $this->faker->randomFloat(2, 50, 500),
            'currency' => $this->faker->randomElement(['local', 'usd']),
            'processed_by' => User::factory(),
        ];
    }
}
