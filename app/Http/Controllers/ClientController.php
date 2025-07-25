<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Pathology;
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
        $pathologies = Pathology::orderBy('name')->get();

        return Inertia::render('Clients/Create', [
            'pathologies' => $pathologies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->merge([
            'phone' => $request->phone_prefix . $request->phone_number,
            'identification_number' => $request->identification_prefix . '-' . $request->identification_number
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'phone' => 'nullable|string|max:20',
            'identification_number' => 'required|string|max:20|unique:clients,identification_number',
            'identification_prefix' => 'nullable|in:V,E,J,G',
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

        // Si la petición viene del modal de membresía, devolver los datos del cliente
        if ($request->fromMembership) {
            return back()->with([
                'flash_client' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email
                ],
                'flash_success' => true,
                'flash_message' => 'Cliente creado exitosamente.'
            ]);
        }

        // Si es una petición normal, redirigir
        return redirect()->route('clients.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Cliente creado exitosamente.');
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
        $pathologies = Pathology::orderBy('name')->get();

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
        $request->merge([
            'phone' => $request->phone_prefix . $request->phone_number,
            'identification_number' => $request->identification_prefix . '-' . $request->identification_number
        ]);

        try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'identification_number' => 'nullable|string|max:20|unique:clients,identification_number,' . $client->id,
            'identification_prefix' => 'nullable|in:V,E,J,G',
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
            ->with('flash_success', true)
            ->with('flash_message', 'Cliente actualizado exitosamente.');

        } catch (\Exception $e) {
            Log::error('Error al actualizar el cliente: ' . $e->getMessage());
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'Error al actualizar el cliente',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Cliente eliminado exitosamente.');
    }

    /**
     * Restore a soft deleted client.
     */
    public function restore($id)
    {
        $client = Client::withTrashed()->findOrFail($id);
        $client->restore();

        return redirect()->route('clients.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Cliente restaurado exitosamente.');
    }

    /**
     * Force delete a client.
     */
    public function forceDelete($id)
    {
        $client = Client::withTrashed()->findOrFail($id);
        $client->forceDelete();

        return redirect()->route('clients.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Cliente eliminado permanentemente.');
    }

        /**
     * Handle profile photo upload for a client.
     */
    private function handleProfilePhoto(Request $request, Client $client)
    {
        try {
            if (!$request->hasFile('profile_photo')) {
                return;
            }

            $existingPhoto = $client->profilePhoto;
            if ($existingPhoto) {
                $existingPhoto->delete();
            }

            $file = $request->file('profile_photo');
            $disk = app()->environment('testing') ? 'local' : (env('APP_ENV') === 'production' ? 's3' : 'public');
            $path = $file->store('clients/profile-photos', $disk);
            $client->files()->create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'type' => 'profile_photo',
            ]);
        } catch (\Exception $e) {
            Log::error('Error al manejar la foto de perfil: ' . $e->getMessage());
        }
    }

    /**
     * Search clients for autocomplete.
     */
    public function search(Request $request)
    {
        $search = $request->get('query', '');

        $clients = Client::where(function ($query) use ($search) {
            $query->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('identification_number', 'ilike', "%{$search}%");
        })
        ->where('status', 'active')
        ->limit(10)
        ->get(['id', 'name', 'email', 'identification_number']);

        return response()->json($clients);
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
