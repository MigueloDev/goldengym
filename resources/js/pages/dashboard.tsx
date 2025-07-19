

import AppLayout from '@/layouts/app-layout';
import { dashboardBreadcrumb } from '@/lib/breadcrumbs';
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

const breadcrumbs = [dashboardBreadcrumb];

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
            <Head title="Principal" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}

                {/* Quick Actions */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-4 border-golden/20 bg-golden/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-golden-foreground">Clientes</p>
                                <p className="text-2xl font-bold text-golden">{stats.total_clients}</p>
                            </div>
                            <Users className="h-8 w-8 text-golden" />
                        </div>
                        <div className="space-y-1">
                            <Link href="/clients">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    <Users className="mr-2 h-3 w-3" />
                                    Ver Clientes
                                </Button>
                            </Link>
                            <Link href="/clients/create">
                                <Button size="sm" className="w-full text-xs bg-golden hover:bg-golden/90 text-golden-foreground">
                                    <Plus className="mr-2 h-3 w-3" />
                                    Nuevo Cliente
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-4 border-golden/20 bg-golden/5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-golden-foreground">Membresías Activas</p>
                                <p className="text-2xl font-bold text-golden">{stats.active_memberships}</p>
                            </div>
                            <CreditCard className="h-8 w-8 text-golden" />
                        </div>
                        <div className="space-y-2">
                            <Link href="/memberships">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    <CreditCard className="mr-2 h-3 w-3" />
                                    Ver Membresías
                                </Button>
                            </Link>
                            <Link href={quick_actions.register_membership}>
                                <Button size="sm" className="w-full text-xs bg-golden hover:bg-golden/90 text-golden-foreground">
                                    <Plus className="mr-2 h-3 w-3" />
                                    Nueva Membresía
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-4 border-golden/20 bg-golden/5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-golden-foreground">Por Vencer</p>
                                <p className="text-2xl font-bold text-golden">{stats.expiring_soon}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-golden" />
                        </div>
                        <div className="space-y-2">
                            <Link href="/memberships">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    <AlertTriangle className="mr-2 h-3 w-3" />
                                    Ver Todas
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-4 border-golden/20 bg-golden/5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-golden-foreground">Ingresos del Mes</p>
                                <p className="text-2xl font-bold text-golden">{formatCurrency(stats.monthly_revenue, 'usd')}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-golden" />
                        </div>
                        <div className="space-y-2">
                            <Link href="/payments">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    <BarChart3 className="mr-2 h-3 w-3" />
                                    Ver Pagos
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-golden/20 bg-golden/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Pagos Recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {recent_payments.length > 0 ? (
                                <div className="space-y-2">
                                    {recent_payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-2 border rounded-lg bg-white/50">
                                            <div>
                                                <h4 className="font-medium text-sm">{payment.membership.client.name}</h4>
                                                <p className="text-xs text-muted-foreground">
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
                                <div className="text-center py-6 text-muted-foreground">
                                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay pagos recientes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-golden/20 bg-golden/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Membresías por Vencer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {expiring_memberships.length > 0 ? (
                                <div className="space-y-2">
                                    {expiring_memberships.map((membership) => (
                                        <div key={membership.id} className="flex items-center justify-between p-2 border rounded-lg bg-white/50">
                                            <div>
                                                <h4 className="font-medium text-sm">{membership.client.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Vence: {formatDate(membership.end_date)}
                                                </p>
                                            </div>
                                            <Link href={`/memberships/${membership.id}/quick-renew`}>
                                                <Button size="sm" className="text-xs bg-golden hover:bg-golden/90 text-golden-foreground">
                                                    Renovar
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay membresías por vencer</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Settings */}
                <Card className="border-golden/20 bg-golden/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Acciones Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid gap-3 md:grid-cols-4">
                            <Link href="/clients">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <Users className="mr-2 h-3 w-3" />
                                    Gestionar Clientes
                                </Button>
                            </Link>
                            <Link href="/memberships">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <CreditCard className="mr-2 h-3 w-3" />
                                    Gestionar Membresías
                                </Button>
                            </Link>
                            <Link href="/payments">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <BarChart3 className="mr-2 h-3 w-3" />
                                    Gestionar Pagos
                                </Button>
                            </Link>
                            <Link href="/plans">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <CreditCard className="mr-2 h-3 w-3" />
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
