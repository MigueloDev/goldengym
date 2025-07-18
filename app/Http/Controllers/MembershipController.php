<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Client;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\MembershipRenewal;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        if ($request->filled('status')) {
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
        $validated = $request->validate([
            // Datos del cliente (si es nuevo)
            'client_id' => 'nullable|exists:clients,id',
            'new_client' => 'nullable|array',
            'new_client.name' => 'required_without:client_id|string|max:255',
            'new_client.email' => 'nullable|email|max:255',
            'new_client.phone' => 'nullable|string|max:20',

            // Datos de la membresía
            'plan_id' => 'required|exists:plans,id',
            'start_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',

            // Datos del pago
            'payment_amount' => 'required|numeric|min:0',
            'payment_currency' => 'required|in:local,usd',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        // Crear o usar cliente existente
        if ($validated['client_id']) {
            $client = Client::find($validated['client_id']);
        } else {
            $client = Client::create($validated['new_client']);
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
            'amount_paid' => $validated['payment_amount'],
            'currency' => $validated['payment_currency'],
            'registered_by' => auth()->id(),
            'notes' => $validated['notes'],
        ]);

        // Crear pago
        Payment::create([
            'membership_id' => $membership->id,
            'amount' => $validated['payment_amount'],
            'currency' => $validated['payment_currency'],
            'payment_date' => now(),
            'payment_method' => $validated['payment_method'],
            'reference' => $validated['payment_reference'],
            'registered_by' => auth()->id(),
        ]);

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
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_amount' => 'required|numeric|min:0',
            'payment_currency' => 'required|in:local,usd',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $plan = Plan::find($validated['plan_id']);

        // Crear renovación
        $renewal = MembershipRenewal::create([
            'membership_id' => $membership->id,
            'previous_end_date' => $membership->end_date,
            'new_end_date' => $plan->calculateEndDate($membership->end_date),
            'amount_paid' => $validated['payment_amount'],
            'currency' => $validated['payment_currency'],
            'processed_by' => auth()->id(),
        ]);

        // Crear pago
        $payment = Payment::create([
            'membership_id' => $membership->id,
            'amount' => $validated['payment_amount'],
            'currency' => $validated['payment_currency'],
            'payment_date' => now(),
            'payment_method' => $validated['payment_method'],
            'reference' => $validated['payment_reference'],
            'registered_by' => auth()->id(),
        ]);

        // Actualizar membresía
        $membership->update([
            'plan_id' => $plan->id,
            'end_date' => $renewal->new_end_date,
            'status' => 'active',
            'amount_paid' => $validated['payment_amount'],
            'currency' => $validated['payment_currency'],
            'notes' => $validated['notes'],
        ]);

        // Vincular pago con renovación
        $renewal->update(['payment_id' => $payment->id]);

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía renovada exitosamente.');
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
