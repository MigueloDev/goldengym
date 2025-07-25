import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ArrowLeft, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { documentTemplatesBreadcrumbs } from '@/lib/breadcrumbs';
import RichTextEditor from '@/components/rich-text-editor';

interface TemplateKey {
  id: number;
  name: string;
  query_method: string;
}

interface DocumentTemplate {
  id: number;
  name: string;
  content: string;
  variables: string[];
  status: 'active' | 'inactive';
  created_by: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  template: DocumentTemplate;
  templateKeys: TemplateKey[];
}

// Extender la interfaz Window para incluir la función de inserción
declare global {
  interface Window {
    insertVariableAtCursor?: (variable: string) => void;
  }
}

export default function DocumentTemplatesEdit({ template, templateKeys }: Props) {
  const [filterText, setFilterText] = useState('');
  const [selectedVariables, setSelectedVariables] = useState<string[]>(template.variables || []);

  const { data, setData, put, processing, errors } = useForm({
    name: template.name,
    content: template.content,
    variables: template.variables || [],
    status: template.status
  });

  // Filtrar variables basado en el texto de búsqueda
  const filteredVariables = useMemo(() => {
    if (!filterText.trim()) {
      return templateKeys;
    }

    return templateKeys.filter(key =>
      key.name.toLowerCase().includes(filterText.toLowerCase()) ||
      key.query_method.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [templateKeys, filterText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/document-templates/${template.id}`);
  };

  const insertVariable = (variable: string) => {
    // Usar la función global para insertar en el cursor actual
    if (window.insertVariableAtCursor) {
      window.insertVariableAtCursor(variable);
    } else {
      // Fallback: agregar al final del contenido
      const placeholder = `[[${variable}]]`;
      setData('content', data.content + placeholder);
    }
  };

  const removeVariable = (variable: string) => {
    setSelectedVariables(selectedVariables.filter(v => v !== variable));
    setData('variables', data.variables.filter(v => v !== variable));
  };

  const breadcrumbs = documentTemplatesBreadcrumbs.edit(template.id, template.name);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Plantilla - ${template.name}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/document-templates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Plantilla de Documento</h1>
              <p className="text-muted-foreground">
                Modifica la plantilla "{template.name}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Plantilla</CardTitle>
                  <CardDescription>
                    Modifica los detalles de tu plantilla de documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Plantilla</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                        placeholder="Ej: Documento de Responsabilidad"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activa</SelectItem>
                          <SelectItem value="inactive">Inactiva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Contenido del Documento</Label>
                      <RichTextEditor
                        value={data.content}
                        onChange={(value) => setData('content', value)}
                        placeholder="Escribe el contenido de tu documento. Usa las variables disponibles para personalizar el contenido."
                      />
                      <p className="text-sm text-muted-foreground">
                        Usa las variables disponibles en el panel derecho para personalizar el contenido.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Actualizando...' : 'Actualizar Plantilla'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Variables Disponibles</CardTitle>
                  <CardDescription>
                    Busca y selecciona variables para insertar en el documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filtro de búsqueda */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar variables..."
                        value={filterText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Lista de variables filtradas */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredVariables.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No se encontraron variables
                        </p>
                      ) : (
                        filteredVariables.map((key) => (
                          <div key={key.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{key.name}</div>
                              <div className="text-xs text-muted-foreground">{key.query_method}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => insertVariable(key.name)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variables Seleccionadas</CardTitle>
                  <CardDescription>
                    Variables que se usarán en esta plantilla
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedVariables.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay variables seleccionadas
                      </p>
                    ) : (
                      selectedVariables.map((variable) => (
                        <div key={variable} className="flex items-center justify-between p-2 border rounded">
                          <Badge variant="secondary">{variable}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVariable(variable)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información de la plantilla */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Plantilla</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Creada por:</span>
                    <span className="text-sm font-medium">{template.created_by?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Creada:</span>
                    <span className="text-sm font-medium">
                      {new Date(template.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última actualización:</span>
                    <span className="text-sm font-medium">
                      {new Date(template.updated_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
