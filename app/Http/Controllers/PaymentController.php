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

        $query = Payment::with(['payable.client', 'payable.plan', 'registeredBy', 'paymentEvidences']);

        // Filtros
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('payable', function ($subQ) use ($request) {
                    $subQ->whereHas('client', function ($clientQ) use ($request) {
                        $clientQ->where('name', 'like', '%' . $request->search . '%');
                    });
                });
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
                'this_month_local' => Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->where('currency', 'local')
                    ->sum('amount'),
                'this_month_usd' => Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->where('currency', 'usd')
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
            'payable_id' => 'required|integer',
            'payable_type' => 'required|in:App\\Models\\Membership,App\\Models\\MembershipRenewal',
            'currency' => 'required|in:local,usd',
            'exchange_rate' => 'nullable|numeric|min:0',
            'selected_price' => 'required|numeric|min:0',
            'selected_currency' => 'required|in:local,usd',
            'payment_date' => 'required|date',
            'payment_methods_json' => 'nullable|json',
            'payment_methods' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            'payment_evidences.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120', // 5MB max
        ]);

        // Procesar métodos de pago como en MembershipController
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

        // Validar métodos de pago usando la lógica de MembershipController
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

        // Obtener el objeto pagable (membership o renewal)
        $payableClass = $validated['payable_type'];
        $payable = $payableClass::find($validated['payable_id']);

        if (!$payable) {
            return back()->withErrors(['payable_id' => 'El objeto especificado no existe.']);
        }

        // Crear múltiples pagos (uno por cada método)
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
                'payable_id' => $validated['payable_id'],
                'payable_type' => $validated['payable_type'],
                'amount' => $amount,
                'currency' => isset($method['type']) ? ($method['type'] === 'usd' ? 'usd' : 'local') : $validated['currency'],
                'exchange_rate' => $validated['exchange_rate'] ?? 1,
                'selected_price' => $validated['selected_price'],
                'selected_currency' => $validated['selected_currency'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $method['method'],
                'reference' => $method['reference'] ?? null,
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

        // Calcular el monto adeudado basado en el precio seleccionado
        $selectedPrice = floatval($validated['selected_price']);
        $totalPaid = $payable->payments()->sum('amount');
        $remainingAmount = $selectedPrice - $totalPaid;

        // Si es una membresía y el pago cubre o excede la deuda restante, renovar la membresía
        if ($payable instanceof \App\Models\Membership && $totalAmount >= $remainingAmount) {
            // Calcular nueva fecha de fin
            $newEndDate = \Carbon\Carbon::now()
                ->addDays($payable->plan->renewal_period_days);

            // Actualizar la membresía
            $payable->update([
                'end_date' => $newEndDate,
                'status' => 'active', // Asegurar que esté activa
            ]);

            // Crear registro de renovación
            $renewal = $payable->renewals()->create([
                'previous_end_date' => $payable->getOriginal('end_date'),
                'new_end_date' => $newEndDate,
                'amount_paid' => $totalAmount,
                'currency' => $validated['currency'],
                'processed_by' => auth()->id(),
            ]);

            // Asignar el primer pago a la renovación
            $payments[0]->update([
                'payable_id' => $renewal->id,
                'payable_type' => \App\Models\MembershipRenewal::class,
            ]);
        }

        return redirect()->route('payments.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Pagos registrados exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->load(['payable.client', 'payable.plan', 'registeredBy', 'paymentEvidences', 'membership']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        $payment->load(['payable', 'paymentEvidences', 'payable.client', 'payable.plan', 'membership']);

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
            ->with('flash_success', true)
            ->with('flash_message', 'Pago actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Pago eliminado exitosamente.');
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
