<?php

namespace App\Http\Controllers;

use App\Models\Pathologies;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PathologyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Pathologies::query();

        // Filtros
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        $pathologies = $query->paginate(15)->withQueryString();

        return Inertia::render('Pathologies/Index', [
            'pathologies' => $pathologies,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
            'stats' => [
                'total' => Pathologies::count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pathologies/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pathologies,name',
            'description' => 'nullable|string|max:500',
        ]);

        Pathologies::create($validated);

        return redirect()->route('pathologies.index')
            ->with('success', 'Patología creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pathologies $pathology)
    {
        $pathology->load('clients');

        return Inertia::render('Pathologies/Show', [
            'pathology' => $pathology,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pathologies $pathology)
    {
        return Inertia::render('Pathologies/Edit', [
            'pathology' => $pathology,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pathologies $pathology)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pathologies,name,' . $pathology->id,
            'description' => 'nullable|string|max:500',
        ]);

        $pathology->update($validated);

        return redirect()->route('pathologies.index')
            ->with('success', 'Patología actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pathologies $pathology)
    {
        // Verificar si la patología está siendo usada por algún cliente
        if ($pathology->clients()->count() > 0) {
            return redirect()->route('pathologies.index')
                ->with('error', 'No se puede eliminar la patología porque está siendo utilizada por clientes.');
        }

        $pathology->delete();

        return redirect()->route('pathologies.index')
            ->with('success', 'Patología eliminada exitosamente.');
    }
}
