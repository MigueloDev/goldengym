<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\File;
use App\Models\TemplateKeys;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Dompdf\Dompdf;
use Dompdf\Options;

class DocumentTemplateController extends Controller
{
    public function index()
    {
        $templates = DocumentTemplate::with('createdBy')->get();

        return Inertia::render('DocumentTemplates/Index', [
            'templates' => $templates
        ]);
    }

    public function create()
    {
        $templateKeys = TemplateKeys::all();

        return Inertia::render('DocumentTemplates/Create', [
            'templateKeys' => $templateKeys
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        DocumentTemplate::create([
            'name' => $request->name,
            'description' => $request->description,
            'content' => $request->content,
            'variables' => $request->variables,
            'status' => $request->status,
            'created_by' => auth()->id()
        ]);

        return redirect()->route('document-templates.index')
            ->with('success', 'Plantilla creada exitosamente');
    }

    public function show(DocumentTemplate $template)
    {
        $template->load('createdBy');

        return Inertia::render('DocumentTemplates/Show', [
            'template' => $template
        ]);
    }

    public function edit(DocumentTemplate $template)
    {
        $templateKeys = TemplateKeys::all();

        return Inertia::render('DocumentTemplates/Edit', [
            'template' => $template,
            'templateKeys' => $templateKeys
        ]);
    }

    public function update(Request $request, DocumentTemplate $template)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $template->update([
            'name' => $request->name,
            'description' => $request->description,
            'content' => $request->content,
            'variables' => $request->variables,
            'status' => $request->status
        ]);

        return redirect()->route('document-templates.index')
            ->with('success', 'Plantilla actualizada exitosamente');
    }

    public function destroy(DocumentTemplate $template)
    {
        $template->delete();

        return redirect()->route('document-templates.index')
            ->with('success', 'Plantilla eliminada exitosamente');
    }

    public function generateDocument(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'template_id' => 'required|exists:document_templates,id'
        ]);

        $client = Client::findOrFail($request->client_id);
        $template = DocumentTemplate::findOrFail($request->template_id);

        // Generar el contenido del documento con las variables reemplazadas
        $content = $this->replaceTemplateVariables($template->content, $client);

        // Configurar DomPDF
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($content);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Generar nombre único para el archivo
        $fileName = 'documento_' . $client->id . '_' . time() . '.pdf';
        $filePath = 'documents/' . $fileName;

        // Guardar el PDF en storage
        Storage::put('public/' . $filePath, $dompdf->output());

        // Crear registro en la tabla files
        $file = File::create([
            'fileable_id' => $client->id,
            'fileable_type' => Client::class,
            'name' => $template->name . ' - ' . $client->name,
            'path' => $filePath,
            'mime_type' => 'application/pdf',
            'size' => Storage::size('public/' . $filePath),
            'type' => 'generated_document'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Documento generado exitosamente',
            'file' => $file,
            'download_url' => Storage::url($filePath)
        ]);
    }

    private function replaceTemplateVariables($content, $client)
    {
        // Obtener todas las claves de template disponibles
        $templateKeys = TemplateKeys::all();

        foreach ($templateKeys as $key) {
            $placeholder = '[[' . $key->name . ']]';

            if (str_contains($content, $placeholder)) {
                $value = $this->getClientProperty($client, $key->query_method);
                $content = str_replace($placeholder, $value, $content);
            }
        }

        return $content;
    }

    private function getClientProperty($client, $queryMethod)
    {
        // Mapeo de métodos de consulta a propiedades del cliente
        $propertyMap = [
            'name' => $client->name,
            'email' => $client->email,
            'phone' => $client->phone,
            'address' => $client->address,
            'birth_date' => $client->birth_date ? $client->birth_date->format('d/m/Y') : '',
            'gender' => $client->gender,
            'age' => $client->getAge(),
            'membership_status' => $client->getMembershipStatus(),
            'active_membership_end_date' => $client->activeMembership ? $client->activeMembership->end_date->format('d/m/Y') : 'Sin membresía activa',
            'current_date' => now()->format('d/m/Y'),
            'current_time' => now()->format('H:i:s'),
            'gym_name' => 'María Gym',
            'gym_address' => 'Dirección del Gimnasio',
            'gym_phone' => 'Teléfono del Gimnasio'
        ];

        return $propertyMap[$queryMethod] ?? '';
    }

    public function getTemplatesForClient()
    {
        $templates = DocumentTemplate::where('status', 'active')->get();

        return response()->json([
            'templates' => $templates
        ]);
    }
}
