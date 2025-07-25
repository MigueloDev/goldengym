<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Client;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\MembershipRenewal;
use App\Models\Pathology;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
        $pathologies = Pathology::orderBy('name')->get();

        return Inertia::render('Memberships/QuickRegister', [
            'plans' => $plans,
            'clients' => $clients,
            'pathologies' => $pathologies,
        ]);
    }

    public function storeQuickRegister(Request $request)
    {
        DB::beginTransaction();
        try {
            $validationRules = [
                'plan_id' => 'required|exists:plans,id',
                'start_date' => 'required|date',
                'notes' => 'nullable|string|max:1000',
                'payment_currency' => 'required|in:local,usd',
                'payment_methods_json' => 'nullable|json',
                'payment_methods' => 'nullable|array',
                'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
                'exchange_rate' => 'nullable|numeric',
                'client_id' => 'required|exists:clients,id',
            ];

            $validated = $request->validate($validationRules);

            if ($request->has('payment_methods_json') && !empty($validated['payment_methods_json'])) {
                $paymentMethods = json_decode($validated['payment_methods_json'], true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw ValidationException::withMessages([
                        'payment_methods' => 'Error al procesar los métodos de pago.',
                    ]);
                }
            } elseif ($request->has('payment_methods')) {
                $paymentMethods = $validated['payment_methods'];
            } else {
                throw ValidationException::withMessages([
                    'payment_methods' => 'Se requieren métodos de pago.',
                ]);
            }

            $totalAmount = 0;
            foreach ($paymentMethods as $method) {
                if (!isset($method['method'])) {
                    throw ValidationException::withMessages([
                        'payment_methods' => 'Todos los métodos de pago deben tener un tipo válido.',
                    ]);
                }
                $amount = null;
                if (isset($method['type']) && $method['type'] === 'usd' && isset($method['amount_usd']) && !empty($method['amount_usd'])) {
                    $amount = floatval($method['amount_usd']);
                } elseif (isset($method['type']) && $method['type'] === 'bs' && isset($method['amount_bs']) && !empty($method['amount_bs'])) {
                    if (!$request->filled('exchange_rate')) {
                        throw ValidationException::withMessages([
                            'exchange_rate' => 'Se requiere la tasa de cambio para el pago en bolívares.',
                        ]);
                    }
                    $amount = floatval($method['amount_bs']) * floatval($validated['exchange_rate']);
                }

                if ($amount === null || $amount <= 0) {
                    throw ValidationException::withMessages([
                        'payment_methods' => 'Todos los métodos de pago deben tener un monto válido.',
                    ]);
                }
                $totalAmount += $amount;
            }

            if ($totalAmount <= 0) {
                throw ValidationException::withMessages([
                    'payment_methods' => 'El monto total debe ser mayor a 0.',
                ]);
            }

            if (isset($validated['client_id'])) {
                $client = Client::find($validated['client_id']);
                if (!$client) {
                    throw ValidationException::withMessages([
                        'client_id' => 'Cliente no encontrado.',
                    ]);
                }
            } else {
                $client = Client::create($validated['new_client']);
            }
            if (Membership::hasActiveMembership($client->id)) {
                throw ValidationException::withMessages([
                    'client_id' => 'Este cliente ya tiene una membresía activa. No se puede registrar una nueva membresía mientras tenga una activa.',
                ]);
            }
            $plan = Plan::find($validated['plan_id']);
            if (!$plan) {
                throw ValidationException::withMessages([
                    'plan_id' => 'Plan no encontrado.',
                ]);
            }
            $membership = Membership::create([
                'client_id' => $client->id,
                'plan_id' => $plan->id,
                'start_date' => $validated['start_date'],
                'end_date' => $plan->calculateEndDate($validated['start_date']),
                'status' => 'active',
                'amount_paid' => $totalAmount,
                'plan_price_paid' => $validated['payment_currency'] === 'usd' ? $plan->price_usd : $plan->price,
                'currency' => $validated['payment_currency'],
                'registered_by' => auth()->id(),
                'notes' => $validated['notes'],
            ]);

            $payments = [];
            foreach ($paymentMethods as $method) {
                $amount = null;
                if (isset($method['type']) && $method['type'] === 'usd' && isset($method['amount_usd']) && !empty($method['amount_usd'])) {
                    $amount = floatval($method['amount_usd']);
                } elseif (isset($method['type']) && $method['type'] === 'bs' && isset($method['amount_bs']) && !empty($method['amount_bs'])) {
                    $amount = floatval($method['amount_bs']);
                }

                $payment = Payment::create([
                    'payable_id' => $membership->id,
                    'payable_type' => \App\Models\Membership::class,
                    'amount' => $amount,
                    'currency' => $method['type'] === 'usd' ? 'usd' : 'local',
                    'payment_date' => now(),
                    'payment_method' => $method['method'],
                    'reference' => $method['reference'] ?? 'Registro rápido',
                    'notes' => $method['notes'] ?? null,
                    'registered_by' => auth()->id(),
                    'exchange_rate' => $validated['exchange_rate'] ?? 1,
                ]);

                $payments[] = $payment;
            }

            if ($request->hasFile('payment_evidences') && !empty($payments)) {
                foreach ($request->file('payment_evidences') as $evidence) {
                    $payments[0]->addPaymentEvidence($evidence);
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        return redirect()->route('memberships.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Membresía registrada exitosamente.');
    }

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

        if (MembershipRenewal::hasRecentRenewal($membership->id)) {
            return back()->withErrors([
                'membership' => 'Esta membresía ya ha sido renovada recientemente. No se puede renovar nuevamente en las próximas 24 horas.'
            ]);
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_currency' => 'required|in:local,usd',
            'payment_methods_json' => 'nullable|json',
            'payment_methods' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
            'exchange_rate' => 'nullable|numeric',
        ]);

        // Procesar métodos de pago
        if ($request->has('payment_methods_json') && !empty($validated['payment_methods_json'])) {
            $paymentMethods = json_decode($validated['payment_methods_json'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return back()->withErrors(['payment_methods' => 'Error al procesar los métodos de pago.']);
            }
        } elseif ($request->has('payment_methods')) {
            $paymentMethods = $validated['payment_methods'];
        } else {
            return back()->withErrors(['payment_methods' => 'Se requieren métodos de pago.']);
        }

        $totalAmount = 0;
        foreach ($paymentMethods as $method) {
            if (!isset($method['method'])) {
                return back()->withErrors(['payment_methods' => 'Todos los métodos de pago deben tener un tipo válido.']);
            }
            $amount = null;
            if (isset($method['type']) && $method['type'] === 'usd' && isset($method['amount_usd']) && !empty($method['amount_usd'])) {
                $amount = floatval($method['amount_usd']);
            } elseif (isset($method['type']) && $method['type'] === 'bs' && isset($method['amount_bs']) && !empty($method['amount_bs'])) {
                if (!$request->filled('exchange_rate')) {
                    return back()->withErrors(['exchange_rate' => 'Se requiere la tasa de cambio para el pago en bolívares.']);
                }
                $amount = floatval($method['amount_bs']) * floatval($validated['exchange_rate']);
            } elseif (isset($method['amount']) && !empty($method['amount'])) {
                // Fallback para el formato anterior
                $amount = floatval($method['amount']);
            }

            if ($amount === null || $amount <= 0) {
                return back()->withErrors(['payment_methods' => 'Todos los métodos de pago deben tener un monto válido.']);
            }
            $totalAmount += $amount;
        }

        if ($totalAmount <= 0) {
            return back()->withErrors(['payment_methods' => 'El monto total debe ser mayor a 0.']);
        }

        $plan = Plan::find($validated['plan_id']);

        $renewal = MembershipRenewal::create([
            'membership_id' => $membership->id,
            'previous_end_date' => $membership->end_date,
            'new_end_date' => $plan->calculateEndDate($membership->end_date),
            'amount_paid' => $totalAmount,
            'plan_price_paid' => $plan->price,
            'currency' => $validated['payment_currency'],
            'processed_by' => auth()->id(),
        ]);

        $payments = [];
        foreach ($paymentMethods as $method) {
            $amount = null;
            if (isset($method['type']) && $method['type'] === 'usd' && isset($method['amount_usd']) && !empty($method['amount_usd'])) {
                $amount = floatval($method['amount_usd']);
            } elseif (isset($method['type']) && $method['type'] === 'bs' && isset($method['amount_bs']) && !empty($method['amount_bs'])) {
                $amount = floatval($method['amount_bs']);
            } elseif (isset($method['amount']) && !empty($method['amount'])) {
                // Fallback para el formato anterior
                $amount = floatval($method['amount']);
            }

            $payment = Payment::create([
                'amount' => $amount,
                'currency' => isset($method['type']) ? ($method['type'] === 'usd' ? 'usd' : 'local') : $validated['payment_currency'],
                'payment_date' => now(),
                'payment_method' => $method['method'],
                'reference' => $method['reference'] ?? 'Renovación rápida',
                'notes' => $method['notes'] ?? null,
                'registered_by' => auth()->id(),
                'exchange_rate' => $validated['exchange_rate'] ?? 1,
                'payable_id' => $membership->id,
                'payable_type' => \App\Models\MembershipRenewal::class,
            ]);

            $payments[] = $payment;
        }

        if ($request->hasFile('payment_evidences') && !empty($payments)) {
            foreach ($request->file('payment_evidences') as $evidence) {
                $payments[0]->addPaymentEvidence($evidence);
            }
        }

        $membership->update([
            'plan_id' => $plan->id,
            'end_date' => $renewal->new_end_date,
            'status' => 'active',
            'amount_paid' => $totalAmount,
            'currency' => $validated['payment_currency'],
            'notes' => $validated['notes'],
        ]);

        $renewal->update(['payment_id' => $payments[0]->id]);

        DB::commit();

        return redirect()->route('memberships.index')
            ->with('success', 'Membresía renovada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al renovar la membresía: ' . $e->getMessage()]);
        }
    }

    public function show(Membership $membership)
    {
        $membership->load(['client', 'plan', 'payments.paymentEvidences', 'renewals']);

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
