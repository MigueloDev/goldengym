import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, User, Calendar, FileText } from 'lucide-react';
import Heading from '@/components/heading';

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
  return (
    <>
      <Head title="Plantillas de Documentos" />

      <AppShell>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <Heading title="Plantillas de Documentos" description="Gestiona las plantillas de documentos para generar documentos personalizados" />
            <Link href={route('document-templates.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
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
                <CardContent>
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
                    <Link href={route('document-templates.show', template.id)}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={route('document-templates.edit', template.id)}>
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
                <Link href={route('document-templates.create')}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Plantilla
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </>
  );
}
