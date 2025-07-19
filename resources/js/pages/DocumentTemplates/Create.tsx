import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { documentTemplatesBreadcrumbs } from '@/lib/breadcrumbs';

interface TemplateKey {
  id: number;
  name: string;
  query_method: string;
  description: string;
}

interface Props {
  templateKeys: TemplateKey[];
}

export default function DocumentTemplatesCreate({ templateKeys }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    content: '',
    variables: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/document-templates');
  };

  const insertVariable = (variable: string) => {
    const placeholder = `[[${variable}]]`;
    setData('content', data.content + placeholder);
  };

  const removeVariable = (variable: string) => {
    setSelectedVariables(selectedVariables.filter(v => v !== variable));
    setData('variables', data.variables.filter(v => v !== variable));
  };

  const breadcrumbs = documentTemplatesBreadcrumbs.create();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Plantilla de Documento" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Plantilla de Documento</h1>
            <p className="text-muted-foreground">
              Crea una nueva plantilla para generar documentos personalizados
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Plantilla</CardTitle>
                  <CardDescription>
                    Define los detalles básicos de tu plantilla de documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Plantilla</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej: Documento de Responsabilidad"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Describe el propósito de esta plantilla"
                        rows={3}
                      />
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
                      <Textarea
                        id="content"
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Escribe el contenido de tu documento. Usa las variables disponibles para personalizar el contenido."
                        rows={15}
                        className="font-mono"
                      />
                      <p className="text-sm text-muted-foreground">
                        Usa las variables disponibles en el panel derecho para personalizar el contenido.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Creando...' : 'Crear Plantilla'}
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
                    Haz clic en una variable para insertarla en el contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {templateKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                        <div className="flex-1">
                          <div className="font-medium">{key.name}</div>
                          <div className="text-sm text-muted-foreground">{key.description}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => insertVariable(key.name)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
