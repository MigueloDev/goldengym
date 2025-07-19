<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Pathologies;
use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Client::with(['activeMembership', 'pathologies', 'profilePhoto'])
            ->withCount('memberships');

        // Filtros
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('membership_status') && $request->membership_status !== 'all') {
            switch ($request->membership_status) {
                case 'active':
                    $query->whereHas('activeMembership', function ($q) {
                        $q->where('end_date', '>', now());
                    });
                    break;
                case 'expired':
                    $query->whereHas('activeMembership', function ($q) {
                        $q->where('end_date', '<', now());
                    });
                    break;
                case 'expiring_soon':
                    $query->whereHas('activeMembership', function ($q) {
                        $q->where('end_date', '<=', now()->addDays(3))
                          ->where('end_date', '>=', now());
                    });
                    break;
                case 'no_membership':
                    $query->whereDoesntHave('activeMembership');
                    break;
            }
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $clients = $query->paginate(15)->withQueryString();

        // Preparar filtros para el frontend
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status', 'all'),
            'membership_status' => $request->get('membership_status', 'all'),
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_direction' => $request->get('sort_direction', 'desc'),
        ];

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $filters,
            'stats' => [
                'total' => Client::count(),
                'active' => Client::where('status', 'active')->count(),
                'with_membership' => Client::whereHas('activeMembership')->count(),
                'expiring_soon' => Client::withExpiringSoon()->count(),
            ],
            'documentTemplates' => DocumentTemplate::active()->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $pathologies = Pathologies::orderBy('name')->get();

        return Inertia::render('Clients/Create', [
            'pathologies' => $pathologies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string|max:1000',
            'pathologies' => 'nullable|array',
            'pathologies.*.id' => 'required|exists:pathologies,id',
            'pathologies.*.notes' => 'nullable|string|max:500',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $client = Client::create($validated);

        // Manejar foto de perfil si se proporcionó
        if ($request->hasFile('profile_photo')) {
            $this->handleProfilePhoto($request, $client);
        }

        // Asociar patologías si se proporcionaron
        if (isset($validated['pathologies'])) {
            foreach ($validated['pathologies'] as $pathology) {
                $client->pathologies()->attach($pathology['id'], [
                    'notes' => $pathology['notes'] ?? null
                ]);
            }
        }

        return redirect()->route('clients.index')
            ->with('success', 'Cliente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client->load([
            'activeMembership.plan',
            'memberships.plan',
            'pathologies',
            'files',
            'profilePhoto'
        ]);

        return Inertia::render('Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        $client->load(['pathologies', 'profilePhoto']);
        $pathologies = Pathologies::orderBy('name')->get();

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'pathologies' => $pathologies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string|max:1000',
            'pathologies' => 'nullable|array',
            'pathologies.*.id' => 'required|exists:pathologies,id',
            'pathologies.*.notes' => 'nullable|string|max:500',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $client->update($validated);

        // Manejar foto de perfil si se proporcionó
        if ($request->hasFile('profile_photo')) {
            $this->handleProfilePhoto($request, $client);
        }

        // Sincronizar patologías
        if (isset($validated['pathologies'])) {
            $pathologyData = [];
            foreach ($validated['pathologies'] as $pathology) {
                $pathologyData[$pathology['id']] = [
                    'notes' => $pathology['notes'] ?? null
                ];
            }
            $client->pathologies()->sync($pathologyData);
        } else {
            $client->pathologies()->detach();
        }

        return redirect()->route('clients.index')
            ->with('success', 'Cliente actualizado exitosamente.');
        } catch (\Exception $e) {
            dd($e);
            Log::error('Error al actualizar el cliente: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * Restore a soft deleted client.
     */
    public function restore($id)
    {
        $client = Client::withTrashed()->findOrFail($id);
        $client->restore();

        return redirect()->route('clients.index')
            ->with('success', 'Cliente restaurado exitosamente.');
    }

    /**
     * Force delete a client.
     */
    public function forceDelete($id)
    {
        $client = Client::withTrashed()->findOrFail($id);
        $client->forceDelete();

        return redirect()->route('clients.index')
            ->with('success', 'Cliente eliminado permanentemente.');
    }

        /**
     * Handle profile photo upload for a client.
     */
    private function handleProfilePhoto(Request $request, Client $client)
    {
        try {
        // Eliminar foto de perfil anterior si existe
        $existingPhoto = $client->profilePhoto;
        if ($existingPhoto) {
            $existingPhoto->delete();
        }

        // Subir nueva foto
        $file = $request->file('profile_photo');
        $path = $file->store('clients/profile-photos', 'public');

        // Crear registro en la base de datos
        $client->files()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => 'profile_photo',
            ]);
        } catch (\Exception $e) {
            dd($e);
            Log::error('Error al manejar la foto de perfil: ' . $e->getMessage());
        }
    }

    /**
     * Remove profile photo for a client.
     */
    public function removeProfilePhoto(Client $client)
    {
        $photo = $client->profilePhoto;

        if ($photo) {
            $photo->delete();
            return response()->json(['message' => 'Foto de perfil eliminada exitosamente.']);
        }

        return response()->json(['message' => 'No se encontró foto de perfil.'], 404);
    }
}
