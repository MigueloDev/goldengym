<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Client;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\MembershipRenewal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Membership::with(['client', 'plan', 'payments'])
            ->withCount('payments');

        // Filtros
        if ($request->filled('search')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $memberships = $query->paginate(15)->withQueryString();

        return Inertia::render('Memberships/Index', [
            'memberships' => $memberships,
            'filters' => $request->only(['search', 'status', 'plan_id', 'sort_by', 'sort_direction']),
            'stats' => [
                'total' => Membership::count(),
                'active' => Membership::where('status', 'active')->count(),
                'expired' => Membership::where('status', 'expired')->count(),
                'expiring_soon' => Membership::expiringSoon()->count(),
            ]
        ]);
    }

    // FLUJO ESPECIAL: Registro rápido (Cliente + Membresía + Pago)
    public function quickRegister()
    {
        $plans = Plan::active()->get();
        $clients = Client::orderBy('name')->get();

        return Inertia::render('Memberships/QuickRegister', [
            'plans' => $plans,
            'clients' => $clients,
        ]);
    }

    public function storeQuickRegister(Request $request)
    {
        DB::beginTransaction();
        try {
        // Validación condicional basada en si se está creando un nuevo cliente o usando uno existente
        $validationRules = [
            'plan_id' => 'required|exists:plans,id',
            'start_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'payment_currency' => 'required|in:local,usd',
            'payment_methods_json' => 'required|json',
            'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120', // 5MB max
        ];

        // Si se proporciona client_id, validar que existe
        if ($request->filled('client_id')) {
            $validationRules['client_id'] = 'required|exists:clients,id';
        } else {
            // Si no hay client_id, validar los campos del nuevo cliente
            $validationRules['new_client'] = 'required|array';
            $validationRules['new_client.name'] = 'required|string|max:255';
            $validationRules['new_client.email'] = 'nullable|email|max:255';
            $validationRules['new_client.phone'] = 'nullable|string|max:20';
        }

        $validated = $request->validate($validationRules);

        $paymentMethods = json_decode($validated['payment_methods_json'], true);

        // Validar métodos de pago
        $totalAmount = 0;
        foreach ($paymentMethods as $method) {
            if (!isset($method['method']) || !isset($method['amount']) || empty($method['amount'])) {
                return back()->withErrors(['payment_methods' => 'Todos los métodos de pago deben tener un monto válido.']);
            }
            $totalAmount += floatval($method['amount']);
        }

        if ($totalAmount <= 0) {
            return back()->withErrors(['payment_methods' => 'El monto total debe ser mayor a 0.']);
        }

        // Crear o usar cliente existente
        if ($validated['client_id']) {
            $client = Client::find($validated['client_id']);
        } else {
            $client = Client::create($validated['new_client']);
        }

        // Validar que el cliente no tenga una membresía activa
        if (Membership::hasActiveMembership($client->id)) {
            return back()->withErrors([
                'client_id' => 'Este cliente ya tiene una membresía activa. No se puede registrar una nueva membresía mientras tenga una activa.'
            ]);
        }

        // Obtener plan
        $plan = Plan::find($validated['plan_id']);

        // Crear membresía
        $membership = Membership::create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'start_date' => $validated['start_date'],
            'end_date' => $plan->calculateEndDate($validated['start_date']),
            'status' => 'active',
            'amount_paid' => $totalAmount,
            'currency' => $validated['payment_currency'],
            'registered_by' => auth()->id(),
            'notes' => $validated['notes'],
        ]);

        // Crear múltiples pagos (uno por cada método)
        $payments = [];
        foreach ($paymentMethods as $method) {
            $payment = Payment::create([
                'membership_id' => $membership->id,
                'amount' => floatval($method['amount']),
                'currency' => $validated['payment_currency'],
                'payment_date' => now(),
                'payment_method' => $method['method'],
                'reference' => $method['reference'] ?? 'Registro rápido',
                'notes' => $method['notes'] ?? null,
                'registered_by' => auth()->id(),
            ]);

            $payments[] = $payment;
        }

        // Manejar evidencias de pago (asignar al primer pago)
        if ($request->hasFile('payment_evidences') && !empty($payments)) {
            foreach ($request->file('payment_evidences') as $evidence) {
                $payments[0]->addPaymentEvidence($evidence);
            }
        }

        DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar la membresía: ' . $e->getMessage()]);
        }

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía registrada exitosamente.');
    }

    // FLUJO ESPECIAL: Renovación rápida
    public function quickRenew(Membership $membership)
    {
        $membership->load(['client', 'plan']);
        $plans = Plan::active()->get();

        return Inertia::render('Memberships/QuickRenew', [
            'membership' => $membership,
            'plans' => $plans,
        ]);
    }

        public function storeQuickRenew(Request $request, Membership $membership)
    {
        DB::beginTransaction();
        try {

        // Validar que la membresía no haya sido renovada recientemente (últimas 24 horas)
        if (MembershipRenewal::hasRecentRenewal($membership->id)) {
            return back()->withErrors([
                'membership' => 'Esta membresía ya ha sido renovada recientemente. No se puede renovar nuevamente en las próximas 24 horas.'
            ]);
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_currency' => 'required|in:local,usd',
            'payment_methods_json' => 'required|json',
            'notes' => 'nullable|string|max:1000',
            'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120', // 5MB max
        ]);

        $paymentMethods = json_decode($validated['payment_methods_json'], true);

        // Validar métodos de pago
        $totalAmount = 0;
        foreach ($paymentMethods as $method) {
            if (!isset($method['method']) || !isset($method['amount']) || empty($method['amount'])) {
                return back()->withErrors(['payment_methods' => 'Todos los métodos de pago deben tener un monto válido.']);
            }
            $totalAmount += floatval($method['amount']);
        }

        if ($totalAmount <= 0) {
            return back()->withErrors(['payment_methods' => 'El monto total debe ser mayor a 0.']);
        }

        $plan = Plan::find($validated['plan_id']);

        // Crear renovación
        $renewal = MembershipRenewal::create([
            'membership_id' => $membership->id,
            'previous_end_date' => $membership->end_date,
            'new_end_date' => $plan->calculateEndDate($membership->end_date),
            'amount_paid' => $totalAmount,
            'currency' => $validated['payment_currency'],
            'processed_by' => auth()->id(),
        ]);

        // Crear múltiples pagos (uno por cada método)
        $payments = [];
        foreach ($paymentMethods as $method) {
            $payment = Payment::create([
                'membership_id' => $membership->id,
                'amount' => floatval($method['amount']),
                'currency' => $validated['payment_currency'],
                'payment_date' => now(),
                'payment_method' => $method['method'],
                'reference' => $method['reference'] ?? 'Renovación rápida',
                'notes' => $method['notes'] ?? null,
                'registered_by' => auth()->id(),
            ]);

            $payments[] = $payment;
        }

        // Manejar evidencias de pago (asignar al primer pago)
        if ($request->hasFile('payment_evidences') && !empty($payments)) {
            foreach ($request->file('payment_evidences') as $evidence) {
                $payments[0]->addPaymentEvidence($evidence);
            }
        }

        // Actualizar membresía
        $membership->update([
            'plan_id' => $plan->id,
            'end_date' => $renewal->new_end_date,
            'status' => 'active',
            'amount_paid' => $totalAmount,
            'currency' => $validated['payment_currency'],
            'notes' => $validated['notes'],
        ]);

        // Vincular pago con renovación (usar el primer pago como referencia)
        $renewal->update(['payment_id' => $payments[0]->id]);

        DB::commit();

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía renovada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al renovar la membresía: ' . $e->getMessage()]);
        }
    }

    // Métodos CRUD estándar
    public function show(Membership $membership)
    {
        $membership->load(['client', 'plan', 'payments', 'renewals']);

        return Inertia::render('Memberships/Show', [
            'membership' => $membership,
        ]);
    }

    public function edit(Membership $membership)
    {
        $membership->load(['client', 'plan']);
        $plans = Plan::active()->get();

        return Inertia::render('Memberships/Edit', [
            'membership' => $membership,
            'plans' => $plans,
        ]);
    }

    public function update(Request $request, Membership $membership)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,expired,suspended,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        $membership->update($validated);

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía actualizada exitosamente.');
    }

    public function destroy(Membership $membership)
    {
        $membership->delete();

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía eliminada exitosamente.');
    }
}
