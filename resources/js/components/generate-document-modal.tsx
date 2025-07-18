import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2 } from 'lucide-react';

interface DocumentTemplate {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
}

interface Props {
  clientId: number;
  clientName: string;
  templates: DocumentTemplate[];
  trigger?: React.ReactNode;
}

export default function GenerateDocumentModal({ clientId, clientName, templates, trigger }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    try {
      const response = await fetch(route('document-templates.generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          client_id: clientId,
          template_id: selectedTemplate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Descargar el archivo
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = result.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cerrar modal
        setIsOpen(false);
        setSelectedTemplate(null);
      } else {
        alert('Error al generar el documento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el documento');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeTemplates = templates.filter(template => template.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generar Documento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generar Documento</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla para generar un documento personalizado para {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plantilla de Documento</label>
            <Select value={selectedTemplate?.toString() || ''} onValueChange={(value) => setSelectedTemplate(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {activeTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{template.name}</span>
                      <Badge variant="secondary" className="ml-2">Activa</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Plantilla Seleccionada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeTemplates
                    .filter(template => template.id === selectedTemplate)
                    .map((template) => (
                      <div key={template.id}>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTemplates.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="text-center py-6">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay plantillas activas disponibles
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedTemplate || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generar y Descargar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
