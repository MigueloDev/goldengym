import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, User, Calendar, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { documentTemplatesBreadcrumbs } from '@/lib/breadcrumbs';

interface DocumentTemplate {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_by: {
    name: string;
  };
  created_at: string;
}

interface Props {
  templates: DocumentTemplate[];
}

export default function DocumentTemplatesIndex({ templates }: Props) {
  const breadcrumbs = documentTemplatesBreadcrumbs.index();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Plantillas de Documentos" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Plantillas de Documentos</h1>
              <p className="text-muted-foreground">
                Gestiona las plantillas de documentos para generar documentos personalizados
              </p>
            </div>
            <Link href="/document-templates/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </Link>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status === 'active' ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.description || 'Sin descripción'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Creado por: {template.created_by.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/document-templates/${template.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera plantilla de documento para empezar a generar documentos personalizados.
                </p>
                <Link href="/document-templates/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Plantilla
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
