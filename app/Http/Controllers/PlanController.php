<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Plan::withCount(['memberships', 'activeMemberships']);

        // Filtros
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $plans = $query->paginate(15)->withQueryString();

        return Inertia::render('Plans/Index', [
            'plans' => $plans,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction']),
            'stats' => [
                'total' => Plan::count(),
                'active' => Plan::where('status', 'active')->count(),
                'total_memberships' => Plan::withCount('memberships')->get()->sum('memberships_count'),
                'active_memberships' => Plan::withCount('activeMemberships')->get()->sum('active_memberships_count'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Plans/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'price_usd' => 'required|numeric|min:0',
            'subscription_price_usd' => 'required|numeric|min:0',
            'subscription_price_local' => 'required|numeric|min:0',
            'renewal_period_days' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
        ]);

        Plan::create($validated);

        return redirect()->route('plans.index')
            ->with('success', 'Plan creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        $plan->load(['memberships.client', 'activeMemberships.client']);

        return Inertia::render('Plans/Show', [
            'plan' => $plan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'price_usd' => 'required|numeric|min:0',
            'subscription_price_usd' => 'required|numeric|min:0',
            'subscription_price_local' => 'required|numeric|min:0',
            'renewal_period_days' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
        ]);

        $plan->update($validated);

        return redirect()->route('plans.index')
            ->with('success', 'Plan actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        // Verificar si el plan está siendo usado por alguna membresía
        if ($plan->memberships()->count() > 0) {
            return redirect()->route('plans.index')
                ->with('error', 'No se puede eliminar el plan porque está siendo utilizado por membresías.');
        }

        $plan->delete();

        return redirect()->route('plans.index')
            ->with('success', 'Plan eliminado exitosamente.');
    }
}
