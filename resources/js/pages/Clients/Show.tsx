import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Edit,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    Clock,
    CreditCard,
    FileText,
    Users,
    Activity
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { clientsBreadcrumbs } from '@/lib/breadcrumbs';

interface Membership {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
    plan: {
        id: number;
        name: string;
        price: number;
    };
}

interface Pathology {
    id: number;
    name: string;
    pivot: {
        notes: string | null;
    };
}

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    birth_date: string | null;
    gender: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    active_membership?: Membership;
    memberships: Membership[];
    pathologies: Pathology[];
}

interface Props {
    client: Client;
}

export default function ShowClient({ client }: Props) {
    const getAge = (birthDate: string | null) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

        const getMembershipStatusColor = () => {
        if (!client.active_membership) return 'secondary';
        const endDate = new Date(client.active_membership.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'destructive';
        if (daysUntilExpiry <= 3) return 'default';
        return 'default';
    };

    const getMembershipStatusText = () => {
        if (!client.active_membership) return 'Sin membresía';
        const endDate = new Date(client.active_membership.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'Expirada';
        if (daysUntilExpiry <= 3) return 'Expira pronto';
        return 'Activa';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatGender = (gender: string | null) => {
        switch (gender) {
            case 'male': return 'Masculino';
            case 'female': return 'Femenino';
            case 'other': return 'Otro';
            default: return 'No especificado';
        }
    };

    const breadcrumbs = clientsBreadcrumbs.show(client.id, client.name);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cliente - ${client.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/clients">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                            <p className="text-muted-foreground">
                                Información detallada del cliente
                            </p>
                        </div>
                    </div>
                    <Link href={`/clients/${client.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Cliente
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Información Principal */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Información Personal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="text-lg">
                                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-semibold">{client.name}</h3>
                                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                                {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            {client.email && (
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{client.email}</span>
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            )}
                                            {client.birth_date && (
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(client.birth_date)} ({getAge(client.birth_date)} años)</span>
                                                </div>
                                            )}
                                            {client.address && (
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{client.address}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-4 w-4" />
                                                <span>Género: {formatGender(client.gender)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {client.notes && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Notas</h4>
                                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                            {client.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Membresías */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Membresías
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {client.active_membership ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium">{client.active_membership.plan.name}</h4>
                                                    <Badge variant={getMembershipStatusColor()}>
                                                        {getMembershipStatusText()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(client.active_membership.start_date)} - {formatDate(client.active_membership.end_date)}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    €{client.active_membership.plan.price}/mes
                                                </p>
                                            </div>
                                            <Activity className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No tiene membresía activa</p>
                                    </div>
                                )}

                                {client.memberships.length > 1 && (
                                    <div className="mt-6 space-y-2">
                                        <h4 className="font-medium">Historial de membresías</h4>
                                        <div className="space-y-2">
                                            {client.memberships
                                                .filter(m => m.id !== client.active_membership?.id)
                                                .map((membership) => (
                                                    <div key={membership.id} className="flex items-center justify-between p-3 border rounded-md">
                                                        <div>
                                                            <p className="font-medium">{membership.plan.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {membership.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Patologías */}
                        {client.pathologies.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Patologías
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {client.pathologies.map((pathology) => (
                                            <div key={pathology.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">{pathology.name}</Badge>
                                                </div>
                                                {pathology.pivot.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {pathology.pivot.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Estado de Membresía */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Estado de Membresía</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-2">
                                    <div className="text-2xl font-bold">
                                        {client.active_membership ? getMembershipStatusText() : 'Sin membresía'}
                                    </div>
                                    {client.active_membership && (
                                        <p className="text-sm text-muted-foreground">
                                            Expira: {formatDate(client.active_membership.end_date)}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del Cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Información del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Cliente desde:</span>
                                    <span className="text-sm font-medium">{formatDate(client.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total membresías:</span>
                                    <span className="text-sm font-medium">{client.memberships.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Patologías:</span>
                                    <span className="text-sm font-medium">{client.pathologies.length}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver Documentos
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Renovar Membresía
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Ver Actividad
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
