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
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        DocumentTemplate::create([
            'name' => $request->name,
            'content' => $request->content,
            'variables' => $request->variables,
            'status' => $request->status,
            'created_by' => auth()->id()
        ]);

        return redirect()->route('document-templates.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Plantilla creada exitosamente');
    }

    public function show(DocumentTemplate $template)
    {


        return Inertia::render('DocumentTemplates/Show', [
            'template' => $template
        ]);
    }

    public function edit(int $id)
    {
        $templateKeys = TemplateKeys::all();

        $documentTemplate = DocumentTemplate::with('createdBy')->find($id);

        return Inertia::render('DocumentTemplates/Edit', [
            'template' => $documentTemplate,
            'templateKeys' => $templateKeys
        ]);
    }

    public function update(Request $request, int $id)
    {
        $template = DocumentTemplate::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);
        $template->update([
            'name' => $request->name,
            'content' => $request->content,
            'variables' => $request->variables,
            'status' => $request->status
        ]);

        return redirect()->route('document-templates.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Plantilla actualizada exitosamente');
    }

    public function destroy(DocumentTemplate $template)
    {
        $template->delete();

        return redirect()->route('document-templates.index')
            ->with('flash_success', true)
            ->with('flash_message', 'Plantilla eliminada exitosamente');
    }

    public function generateDocument(Request $request)
    {
        try {
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

            $fileName = 'documento_' . $client->id . '_' . time() . '.pdf';
            $filePath = 'documents/' . $fileName;

            Storage::put($filePath, $dompdf->output());

            $file = File::create([
                'fileable_id' => $client->id,
                'fileable_type' => Client::class,
                'name' => $template->name . ' - ' . $client->name,
                'path' => $filePath,
                'mime_type' => 'application/pdf',
                'size' => Storage::size($filePath),
                'type' => 'generated_document'
            ]);

            if (env('APP_ENV') === 'production') {
                $url = Storage::url($filePath);
            } else {
                $url = str_replace('localhost', 'localhost:8070', Storage::url($filePath));
            }

            // Retornar respuesta de Inertia con los datos para la descarga
            return back()->with([
                'flash_success' => true,
                'flash_message' => 'Documento generado exitosamente',
                'flash_title' => 'Documento generado exitosamente',
                'flash_download_url' => $url,
            ]);

        } catch (\Exception $e) {
            return back()->withErrors([
                'flash_success' => false,
                'flash_message' => 'Error al generar el documento',
            ]);
        }
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
            // Datos básicos del cliente
            'name' => $client->name,
            'email' => $client->email,
            'phone' => $client->phone,
            'address' => $client->address,
            'birth_date' => $client->birth_date ? $client->birth_date->format('d/m/Y') : '',
            'gender' => $client->gender,
            'age' => $client->getAge(),
            'notes' => $client->notes,
            'client_identification' => $client->identification_number,

            // Estado de membresía
            'membership_status' => $client->getMembershipStatus(),
            'active_membership_end_date' => $client->activeMembership ? $client->activeMembership->end_date->format('d/m/Y') : 'Sin membresía activa',

            // Datos de la membresía activa
            'active_membership_plan_name' => $client->activeMembership ? $client->activeMembership->plan->name : 'Sin plan activo',
            'active_membership_plan_price' => $client->activeMembership ? number_format($client->activeMembership->plan->price, 2) . ' Bs' : 'N/A',
            'active_membership_start_date' => $client->activeMembership ? $client->activeMembership->start_date->format('d/m/Y') : 'N/A',

            // Patologías del cliente
            'pathologies_list' => $this->getPathologiesList($client),
            'pathologies_count' => $client->pathologies()->count(),

            // Información del gimnasio
            'gym_name' => 'Golden Gym',
            'gym_address' => 'Dirección del Gimnasio',
            'gym_phone' => 'Teléfono del Gimnasio',
            'gym_email' => 'info@mariagym.com',

            // Fechas y tiempo
            'current_date' => now()->format('d/m/Y'),
            'current_time' => now()->format('H:i:s'),
            'current_datetime' => now()->format('d/m/Y H:i:s'),
        ];

        return $propertyMap[$queryMethod] ?? '';
    }

    private function getPathologiesList($client)
    {
        $pathologies = $client->pathologies;

        if (!$pathologies) {
            return 'Sin patologías registradas';
        }

        if ($pathologies->isEmpty()) {
            return 'Sin patologías registradas';
        }

        $pathologiesList = $pathologies->map(function ($pathology) {
            $notes = $pathology->pivot->notes ? " ({$pathology->pivot->notes})" : '';
            return $pathology->name . $notes;
        })->join(', ');

        return $pathologiesList;
    }

    public function getTemplatesForClient()
    {
        $templates = DocumentTemplate::where('status', 'active')->get();

        return response()->json([
            'templates' => $templates
        ]);
    }
}
