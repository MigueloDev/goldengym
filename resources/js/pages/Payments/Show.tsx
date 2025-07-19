import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    DollarSign,
    CreditCard,
    Calendar,
    User,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { paymentsBreadcrumbs } from '@/lib/breadcrumbs';

interface Payment {
    id: number;
    membership: {
        id: number;
        client: {
            id: number;
            name: string;
            email: string | null;
        };
        plan: {
            id: number;
            name: string;
            price: number;
            price_usd: number;
        };
        start_date: string;
        end_date: string;
        status: string;
        amount_paid: number;
        currency: 'local' | 'usd';
    };
    amount: number;
    currency: 'local' | 'usd';
    payment_date: string;
    payment_method: 'cash' | 'card' | 'transfer' | 'other';
    reference: string | null;
    notes: string | null;
    registered_by: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    payment: Payment;
}

export default function ShowPayment({ payment }: Props) {
    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
            // Implementar eliminación
        }
    };

    const formatCurrency = (amount: number, currency: 'local' | 'usd') => {
        const symbol = currency === 'usd' ? '$' : '₡';
        return `${symbol}${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getPaymentMethodBadge = (method: string) => {
        const variants = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            transfer: 'bg-purple-100 text-purple-800',
            other: 'bg-gray-100 text-gray-800',
        };
        const labels = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            transfer: 'Transferencia',
            other: 'Otro',
        };
        return <Badge className={variants[method as keyof typeof variants]}>{labels[method as keyof typeof labels]}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={paymentsBreadcrumbs.show(payment.id)}>
            <Head title={`Pago - ${payment.membership.client.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/payments">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Detalle del Pago</h1>
                            <p className="text-muted-foreground">
                                Información completa del pago registrado
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/payments/${payment.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Información Principal */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Información del Pago */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Información del Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Monto</h4>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.currency.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Método de Pago</h4>
                                        <div className="flex items-center gap-2">
                                            {getPaymentMethodBadge(payment.payment_method)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Pago</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDate(payment.payment_date)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Referencia</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.reference || 'Sin referencia'}
                                        </p>
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Notas</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Información de la Membresía */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Información de la Membresía
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Cliente</h4>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{payment.membership.client.name}</span>
                                        </div>
                                        {payment.membership.client.email && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {payment.membership.client.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Plan</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.membership.plan.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Precio: {formatCurrency(payment.membership.plan.price, payment.membership.currency)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <h4 className="font-semibold mb-2">Estado</h4>
                                        {getStatusBadge(payment.membership.status)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Inicio</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(payment.membership.start_date)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Fin</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(payment.membership.end_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Monto Pagado</h4>
                                        <p className="text-lg font-medium">
                                            {formatCurrency(payment.membership.amount_paid, payment.membership.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Moneda</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.membership.currency.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Información del Registro */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Información del Registro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Registrado por:</span>
                                    <span className="text-sm font-medium">{payment.registered_by.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Fecha de registro:</span>
                                    <span className="text-sm font-medium">{formatDate(payment.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Última actualización:</span>
                                    <span className="text-sm font-medium">{formatDate(payment.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/payments/${payment.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Pago
                                    </Button>
                                </Link>
                                <Link href={`/memberships/${payment.membership.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Ver Membresía
                                    </Button>
                                </Link>
                                <Link href={`/clients/${payment.membership.client.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        Ver Cliente
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}