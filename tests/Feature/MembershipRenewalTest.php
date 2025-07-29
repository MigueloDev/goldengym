<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Client;
use App\Models\Plan;
use App\Models\Membership;
use App\Models\MembershipRenewal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class MembershipRenewalTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuario autenticado
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_renew_expired_membership_from_today()
    {
        // Crear plan de 30 días
        $plan = Plan::factory()->create([
            'renewal_period_days' => 30,
            'price' => 100,
            'price_usd' => 10,
        ]);

        // Crear cliente
        $client = Client::factory()->create();

        // Crear membresía vencida (hace 5 días)
        $membership = Membership::factory()->create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now()->subDays(35),
            'end_date' => Carbon::now()->subDays(5), // Vencida hace 5 días
            'status' => 'active',
        ]);

        // Verificar que la membresía está vencida
        $this->assertTrue($membership->isExpired());

        // Obtener información de renovación
        $renewalInfo = $plan->getRenewalInfo($membership);

        // Verificar que la renovación se calcula desde hoy
        $this->assertTrue($renewalInfo['is_expired']);
        $this->assertEquals('Desde hoy', $renewalInfo['calculation_basis']);
        $this->assertEquals(30, $renewalInfo['days_added']);

        // Verificar que la nueva fecha es hoy + 30 días
        $expectedNewDate = Carbon::now()->addDays(30);
        $this->assertEquals($expectedNewDate->format('Y-m-d'), $renewalInfo['new_end_date']);
    }

    public function test_can_renew_active_membership_from_current_end_date()
    {
        // Crear plan de 30 días
        $plan = Plan::factory()->create([
            'renewal_period_days' => 30,
            'price' => 100,
            'price_usd' => 10,
        ]);

        // Crear cliente
        $client = Client::factory()->create();

        // Crear membresía activa que vence en 10 días
        $membership = Membership::factory()->create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now()->subDays(20),
            'end_date' => Carbon::now()->addDays(10), // Activa, vence en 10 días
            'status' => 'active',
        ]);

        // Verificar que la membresía está activa
        $this->assertFalse($membership->isExpired());

        // Obtener información de renovación
        $renewalInfo = $plan->getRenewalInfo($membership);

        // Verificar que la renovación se calcula desde la fecha de vencimiento actual
        $this->assertFalse($renewalInfo['is_expired']);
        $this->assertEquals('Desde fecha de vencimiento actual', $renewalInfo['calculation_basis']);
        $this->assertEquals(30, $renewalInfo['days_added']);

        // Verificar que la nueva fecha es la fecha de vencimiento actual + 30 días
        $expectedNewDate = Carbon::parse($membership->end_date)->addDays(30);
        $this->assertEquals($expectedNewDate->format('Y-m-d'), $renewalInfo['new_end_date']);
    }

    public function test_can_renew_multiple_times_with_smart_calculation()
    {
        // Crear plan de 30 días
        $plan = Plan::factory()->create([
            'renewal_period_days' => 30,
            'price' => 100,
            'price_usd' => 10,
        ]);

        // Crear cliente
        $client = Client::factory()->create();

        // Crear membresía original
        $membership = Membership::factory()->create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now()->subDays(60),
            'end_date' => Carbon::now()->subDays(30), // Vencida hace 30 días
            'status' => 'active',
        ]);

        // Crear primera renovación (hace 15 días)
        $firstRenewal = MembershipRenewal::factory()->create([
            'membership_id' => $membership->id,
            'previous_end_date' => $membership->end_date,
            'new_end_date' => Carbon::now()->addDays(15), // Vence en 15 días
            'amount_paid' => 100,
            'currency' => 'local',
            'processed_by' => $this->user->id,
        ]);

        // Verificar que la fecha efectiva de vencimiento es la de la renovación
        $this->assertEquals($firstRenewal->new_end_date, $membership->getEffectiveEndDate());

        // Obtener información de renovación para una segunda renovación
        $renewalInfo = $plan->getRenewalInfo($membership);

        // Verificar que la renovación se calcula desde la fecha de la última renovación
        $this->assertFalse($renewalInfo['is_expired']);
        $this->assertEquals('Desde fecha de vencimiento actual', $renewalInfo['calculation_basis']);

        // Verificar que la nueva fecha es la fecha de la renovación + 30 días
        $expectedNewDate = Carbon::parse($firstRenewal->new_end_date)->addDays(30);
        $this->assertEquals($expectedNewDate->format('Y-m-d'), $renewalInfo['new_end_date']);
    }

    public function test_renewal_info_shows_correct_days_until_expiration()
    {
        // Crear plan de 30 días
        $plan = Plan::factory()->create([
            'renewal_period_days' => 30,
            'price' => 100,
            'price_usd' => 10,
        ]);

        // Crear cliente
        $client = Client::factory()->create();

        // Crear membresía que vence en 5 días
        $membership = Membership::factory()->create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now()->subDays(25),
            'end_date' => Carbon::now()->addDays(5), // Vence en 5 días
            'status' => 'active',
        ]);

        // Obtener información de renovación
        $renewalInfo = $plan->getRenewalInfo($membership);

        // Verificar que muestra los días correctos hasta el vencimiento (con tolerancia de ±1 día)
        $this->assertGreaterThanOrEqual(4, $renewalInfo['days_until_expiration']);
        $this->assertLessThanOrEqual(6, $renewalInfo['days_until_expiration']);
    }

    public function test_membership_effective_end_date_considers_renewals()
    {
        // Crear plan de 30 días
        $plan = Plan::factory()->create([
            'renewal_period_days' => 30,
            'price' => 100,
            'price_usd' => 10,
        ]);

        // Crear cliente
        $client = Client::factory()->create();

        // Crear membresía original vencida
        $membership = Membership::factory()->create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now()->subDays(60),
            'end_date' => Carbon::now()->subDays(30), // Vencida hace 30 días
            'status' => 'active',
        ]);

        // Verificar que la fecha efectiva es la fecha original
        $this->assertEquals($membership->end_date, $membership->getEffectiveEndDate());

        // Crear renovación
        $renewal = MembershipRenewal::factory()->create([
            'membership_id' => $membership->id,
            'previous_end_date' => $membership->end_date,
            'new_end_date' => Carbon::now()->addDays(15), // Vence en 15 días
            'amount_paid' => 100,
            'currency' => 'local',
            'processed_by' => $this->user->id,
        ]);

        // Verificar que la fecha efectiva ahora es la de la renovación
        $this->assertEquals($renewal->new_end_date, $membership->getEffectiveEndDate());
    }
}
