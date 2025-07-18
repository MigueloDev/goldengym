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
        $query = Payment::with(['membership.client', 'membership.plan', 'registeredBy']);

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

        return Inertia::render('Payments/Create', [
            'membership' => $membership,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'membership_id' => 'required|exists:memberships,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:local,usd',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['registered_by'] = auth()->id();

        Payment::create($validated);

        return redirect()->route('payments.index')
            ->with('success', 'Pago registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        $payment->load(['membership.client', 'membership.plan', 'registeredBy']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        $payment->load(['membership.client', 'membership.plan']);

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
        ]);

        $payment->update($validated);

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
}
