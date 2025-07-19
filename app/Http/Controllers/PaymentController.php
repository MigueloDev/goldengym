<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Membership;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['membership.client', 'membership.plan', 'registeredBy', 'paymentMethods', 'paymentEvidences']);

        // Filtros
        if ($request->filled('search')) {
            $query->whereHas('membership.client', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $payments = $query->paginate(15)->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'currency', 'payment_method', 'date_from', 'date_to', 'sort_by', 'sort_direction']),
            'stats' => [
                'total' => Payment::count(),
                'total_amount_local' => Payment::where('currency', 'local')->sum('amount'),
                'total_amount_usd' => Payment::where('currency', 'usd')->sum('amount'),
                'this_month' => Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->sum('amount'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $membershipId = $request->get('membership_id');
        $membership = null;

        if ($membershipId) {
            $membership = Membership::with(['client', 'plan'])->find($membershipId);
        }

        // Obtener membresías con deudas (solo clientes que deben dinero)
        $membershipsWithDebt = Membership::with(['client', 'plan'])
            ->get()
            ->map(function ($membership) {
                $totalPaid = $membership->payments()->sum('amount');

                // Mostrar deuda basada en el precio en bolívares por defecto
                $defaultPrice = $membership->plan->price;
                $remainingAmount = $defaultPrice - $totalPaid;

                return [
                    'id' => $membership->id,
                    'client' => $membership->client,
                    'plan' => $membership->plan,
                    'start_date' => $membership->start_date,
                    'end_date' => $membership->end_date,
                    'status' => $membership->status,
                    'amount_paid' => $membership->amount_paid,
                    'currency' => $membership->currency,
                    'total_payments' => $totalPaid,
                    'remaining_amount' => $remainingAmount,
                    'plan_price_local' => $membership->plan->price,
                    'plan_price_usd' => $membership->plan->price_usd,
                ];
            })
            ->filter(function ($membership) {
                return $membership['remaining_amount'] > 0;
            })
            ->values();

        return Inertia::render('Payments/Create', [
            'membership' => $membership,
            'membershipsWithDebt' => $membershipsWithDebt,
            'maxFileSize' => 5120, // 5MB en KB
            'allowedFileTypes' => ['jpeg', 'png', 'jpg', 'gif', 'pdf'],
        ]);
    }

        /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'membership_id' => 'required|exists:memberships,id',
            'currency' => 'required|in:local,usd',
            'exchange_rate' => 'nullable|numeric|min:0',
            'selected_price' => 'required|numeric|min:0',
            'selected_currency' => 'required|in:local,usd',
            'payment_date' => 'required|date',
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

        $validated['registered_by'] = auth()->id();
        $validated['amount'] = $totalAmount; // Guardar el total en el campo amount original

        // Crear el pago principal
        $payment = Payment::create($validated);

        // Crear los métodos de pago individuales
        foreach ($paymentMethods as $method) {
            $payment->paymentMethods()->create([
                'method' => $method['method'],
                'amount' => $method['amount'],
                'reference' => $method['reference'] ?? null,
                'notes' => $method['notes'] ?? null,
            ]);
        }

        // Manejar evidencias de pago si se proporcionaron
        if ($request->hasFile('payment_evidences')) {
            foreach ($request->file('payment_evidences') as $evidence) {
                $payment->addPaymentEvidence($evidence);
            }
        }

                // Obtener la membresía
        $membership = Membership::find($validated['membership_id']);

        // Calcular el monto adeudado basado en el precio seleccionado
        $selectedPrice = floatval($validated['selected_price']);
        $totalPaid = $membership->payments()->sum('amount');
        $remainingAmount = $selectedPrice - $totalPaid;

        // Si el pago cubre o excede la deuda restante, renovar la membresía
        if ($totalAmount >= $remainingAmount) {
            // Calcular nueva fecha de fin
            $newEndDate = \Carbon\Carbon::parse($membership->end_date)
                ->addDays($membership->plan->renewal_period_days);

            // Actualizar la membresía
            $membership->update([
                'end_date' => $newEndDate,
                'status' => 'active', // Asegurar que esté activa
            ]);

            // Crear registro de renovación
            $membership->renewals()->create([
                'payment_id' => $payment->id,
                'renewal_date' => now(),
                'previous_end_date' => $membership->getOriginal('end_date'),
                'new_end_date' => $newEndDate,
                'renewal_period_days' => $membership->plan->renewal_period_days,
            ]);
        }

        return redirect()->route('payments.index')
            ->with('success', 'Pago registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        $payment->load(['membership.client', 'membership.plan', 'registeredBy', 'paymentEvidences']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        $payment->load(['membership.client', 'membership.plan', 'paymentEvidences']);

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:local,usd',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
        ]);

        $payment->update($validated);

        // Manejar nuevas evidencias de pago si se proporcionaron
        if ($request->hasFile('payment_evidences')) {
            foreach ($request->file('payment_evidences') as $evidence) {
                $payment->addPaymentEvidence($evidence);
            }
        }

        return redirect()->route('payments.index')
            ->with('success', 'Pago actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Pago eliminado exitosamente.');
    }

    /**
     * Remove a payment evidence file.
     */
    public function removePaymentEvidence(Payment $payment, $evidenceId)
    {
        $evidence = $payment->paymentEvidences()->findOrFail($evidenceId);
        $evidence->delete();

        return response()->json(['message' => 'Evidencia de pago eliminada exitosamente.']);
    }

    /**
     * Add payment evidences to an existing payment.
     */
    public function addPaymentEvidences(Request $request, Payment $payment)
    {
        $request->validate([
            'payment_evidences.*' => 'required|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
        ]);

        foreach ($request->file('payment_evidences') as $evidence) {
            $payment->addPaymentEvidence($evidence);
        }

        return response()->json(['message' => 'Evidencias de pago agregadas exitosamente.']);
    }
}
