import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    AlertTriangle,
    Users,
    Calendar,
    FileText
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { pathologiesBreadcrumbs } from '@/lib/breadcrumbs';

interface Client {
    id: number;
    name: string;
    email: string | null;
    pivot: {
        notes: string | null;
    };
}

interface Pathology {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    clients?: Client[];
}

interface Props {
    pathology: Pathology;
}

export default function ShowPathology({ pathology }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const breadcrumbs = pathologiesBreadcrumbs.show(pathology.id, pathology.name);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Patología - ${pathology.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/pathologies">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{pathology.name}</h1>
                                <p className="text-muted-foreground">
                                    Información detallada de la patología
                                </p>
                            </div>
                        </div>
                        <Link href={`/pathologies/${pathology.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Patología
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Información Principal */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Información de la Patología */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Información de la Patología
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">{pathology.name}</h3>
                                        {pathology.description && (
                                            <p className="text-muted-foreground">
                                                {pathology.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Creada: {formatDate(pathology.created_at)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Actualizada: {formatDate(pathology.updated_at)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clientes con esta Patología */}
                            {pathology.clients && pathology.clients.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Clientes con esta Patología ({pathology.clients.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pathology.clients.map((client) => (
                                                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium">{client.name}</h4>
                                                            {client.email && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    ({client.email})
                                                                </span>
                                                            )}
                                                        </div>
                                                        {client.pivot.notes && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Notas: {client.pivot.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Link href={`/clients/${client.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            Ver Cliente
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Estadísticas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Estadísticas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total clientes:</span>
                                        <span className="text-sm font-medium">
                                            {pathology.clients?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Patología desde:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(pathology.created_at).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Acciones Rápidas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Acciones</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={`/pathologies/${pathology.id}/edit`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Patología
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ver Documentos
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="mr-2 h-4 w-4" />
                                        Ver Todos los Clientes
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Estado */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Estado</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center space-y-2">
                                        <Badge variant="default" className="text-sm">
                                            Activa
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                            La patología está disponible para asignar a clientes
                                        </p>
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
