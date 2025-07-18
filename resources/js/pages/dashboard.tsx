

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    CreditCard,
    Calendar,
    Activity,
    Plus,
    BarChart3,
    Settings,
    AlertTriangle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_clients: number;
        active_memberships: number;
        expiring_soon: number;
        monthly_revenue: number;
    };
    expiring_memberships: Array<{
        id: number;
        client: {
            name: string;
        };
        end_date: string;
    }>;
    recent_payments: Array<{
        id: number;
        membership: {
            client: {
                name: string;
            };
        };
        amount: number;
        currency: string;
        payment_date: string;
    }>;
    quick_actions: {
        register_membership: string;
        renew_membership: string;
        new_client: string;
        new_plan: string;
    };
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'usd') {
        return `$${amount.toFixed(2)}`;
    }
    return `Bs. ${amount.toFixed(2)}`;
};

export default function Dashboard({ stats, expiring_memberships, recent_payments, quick_actions }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Bienvenido al panel de control del gimnasio
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clients}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de clientes registrados
                            </p>
                            <div className="mt-4 space-y-2">
                                <Link href="/clients">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Users className="mr-2 h-4 w-4" />
                                        Ver Clientes
                                    </Button>
                                </Link>
                                <Link href="/clients/create">
                                    <Button size="sm" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nuevo Cliente
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_memberships}</div>
                            <p className="text-xs text-muted-foreground">
                                Membresías activas
                            </p>
                            <div className="mt-4 space-y-2">
                                <Link href="/memberships">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Ver Membresías
                                    </Button>
                                </Link>
                                <Link href={quick_actions.register_membership}>
                                    <Button size="sm" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nueva Membresía
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.expiring_soon}</div>
                            <p className="text-xs text-muted-foreground">
                                Membresías por vencer
                            </p>
                            <div className="mt-4 space-y-2">
                                <Link href="/memberships">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Ver Todas
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue, 'usd')}</div>
                            <p className="text-xs text-muted-foreground">
                                Ingresos del mes actual
                            </p>
                            <div className="mt-4">
                                <Link href="/payments">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Ver Pagos
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Pagos Recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recent_payments.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">{payment.membership.client.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(payment.amount, payment.currency)}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(payment.payment_date)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay pagos recientes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Membresías por Vencer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expiring_memberships.length > 0 ? (
                                <div className="space-y-3">
                                    {expiring_memberships.map((membership) => (
                                        <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">{membership.client.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Vence: {formatDate(membership.end_date)}
                                                </p>
                                            </div>
                                            <Link href={`/memberships/${membership.id}/quick-renew`}>
                                                <Button size="sm">Renovar</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No hay membresías por vencer</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Acciones Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Link href="/clients">
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="mr-2 h-4 w-4" />
                                    Gestionar Clientes
                                </Button>
                            </Link>
                            <Link href="/memberships">
                                <Button variant="outline" className="w-full justify-start">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Gestionar Membresías
                                </Button>
                            </Link>
                            <Link href="/payments">
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Gestionar Pagos
                                </Button>
                            </Link>
                            <Link href="/plans">
                                <Button variant="outline" className="w-full justify-start">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Gestionar Planes
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
