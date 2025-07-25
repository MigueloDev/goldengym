<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClientDocumentController extends Controller
{
    /**
     * Display a listing of the client's documents.
     */
    public function index(Client $client)
    {
        $client->load(['files' => function ($query) {
            $query->whereIn('type', ['document', 'generated_document', 'custom_document'])
                  ->orderBy('created_at', 'desc');
        }]);

        // Contar documentos por tipo
        $documentCounts = [
            'total' => $client->files->count(),
            'generated' => $client->files->where('type', 'generated_document')->count(),
            'custom' => $client->files->where('type', 'custom_document')->count(),
            'documents' => $client->files->where('type', 'document')->count(),
        ];

        return Inertia::render('Clients/Documents/Index', [
            'client' => $client,
            'documents' => $client->files,
            'documentCounts' => $documentCounts,
        ]);
    }

    /**
     * Store a newly uploaded document.
     */
    public function store(Request $request, Client $client)
    {
        // Verificar límite de documentos
        $currentDocumentCount = $client->files()
            ->whereIn('type', ['document', 'generated_document', 'custom_document'])
            ->count();

        if ($currentDocumentCount >= 10) {
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'El cliente ya tiene el máximo de 10 documentos permitidos.',
            ]);
        }

        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif|max:10240', // 10MB max
            'name' => 'required|string|max:255',
        ]);

        try {
            $file = $request->file('document');
            $disk = app()->environment('testing') ? 'local' : (env('APP_ENV') === 'production' ? 's3' : 'public');
            $path = $file->store('clients/documents', $disk);

            $client->files()->create([
                'name' => $request->name,
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'type' => 'custom_document',
            ]);

            return back()->with([
                'flash_success' => true,
                'flash_message' => 'Documento subido exitosamente.',
            ]);

        } catch (\Exception $e) {
            Log::error('Error al subir documento: ' . $e->getMessage());
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'Error al subir el documento.',
            ]);
        }
    }

    /**
     * Remove the specified document.
     */
    public function destroy(Client $client, File $document)
    {
        // Verificar que el documento pertenece al cliente
        if ($document->fileable_id !== $client->id || $document->fileable_type !== Client::class) {
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'Documento no encontrado.',
            ]);
        }

        try {
            $document->delete();

            return back()->with([
                'flash_success' => true,
                'flash_message' => 'Documento eliminado exitosamente.',
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar documento: ' . $e->getMessage());
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'Error al eliminar el documento.',
            ]);
        }
    }

    /**
     * Download the specified document.
     */
    public function download(Client $client, File $document)
    {
        // Verificar que el documento pertenece al cliente
        if ($document->fileable_id !== $client->id || $document->fileable_type !== Client::class) {
            abort(404);
        }

        if (!Storage::exists($document->path)) {
            abort(404);
        }

        return Storage::download($document->path, $document->name);
    }

    /**
     * Get document statistics for a client.
     */
    public function stats(Client $client)
    {
        $stats = [
            'total_documents' => $client->files()
                ->whereIn('type', ['document', 'generated_document', 'custom_document'])
                ->count(),
            'generated_documents' => $client->files()
                ->where('type', 'generated_document')
                ->count(),
            'custom_documents' => $client->files()
                ->where('type', 'custom_document')
                ->count(),
            'can_upload' => $client->files()
                ->whereIn('type', ['document', 'generated_document', 'custom_document'])
                ->count() < 10,
        ];

        return response()->json($stats);
    }
}
