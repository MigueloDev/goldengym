import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus,
    Search,
    Filter,
    DollarSign,
    CreditCard,
    Calendar,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { paymentsBreadcrumbs } from '@/lib/breadcrumbs';

  interface Payment {
    id: number;
    membership: {
        id: number;
        client: {
            id: number;
            name: string;
        };
        plan: {
            id: number;
            name: string;
            price: number;
        };
    };
    amount: number;
    currency: 'local' | 'usd';
    payment_date: string;
    payment_method: string;
    notes: string | null;
    registered_by: {
        id: number;
        name: string;
    };
    created_at: string;
    method_color: string;
    method_label: string;
}

interface Props {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        currency?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total: number;
        total_amount_local: number;
        total_amount_usd: number;
        this_month: number;
    };
}

export default function PaymentsIndex({ payments, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [currency, setCurrency] = useState(filters.currency || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'payment_date');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const handleSearch = () => {
        router.get('/payments', {
            search,
            currency,
            payment_method: paymentMethod,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: sortBy,
            sort_direction: sortDirection,
        }, { preserveState: true });
    };

    const handleDelete = (paymentId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
            router.delete(`/payments/${paymentId}`);
        }
    };

    const formatCurrency = (amount: number, currency: 'local' | 'usd') => {
        const symbol = currency === 'usd' ? '$' : 'Bs';
        return `${symbol}${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getPaymentMethodBadge = (payment: Payment) => {
        console.log(payment);
        return <Badge className={payment.method_color}>{payment.method_label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={paymentsBreadcrumbs.index()}>
            <Head title="Pagos" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los pagos de membresías del gimnasio
                        </p>
                    </div>
                    <Link href="/payments/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Pago
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Total VES</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.total_amount_local, 'local')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Total USD</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.total_amount_usd, 'usd')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                            <Calendar className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(stats.this_month, 'local')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="gap-1">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cliente..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Moneda</label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las monedas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="local">VES</SelectItem>
                                        <SelectItem value="usd">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Método de pago</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los métodos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="cash">Efectivo</SelectItem>
                                        <SelectItem value="card">Tarjeta</SelectItem>
                                        <SelectItem value="transfer">Transferencia</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ordenar por</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="payment_date">Fecha de pago</SelectItem>
                                        <SelectItem value="amount">Monto</SelectItem>
                                        <SelectItem value="created_at">Fecha de registro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha desde</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha hasta</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Dirección</label>
                                <Select value={sortDirection} onValueChange={setSortDirection}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Descendente</SelectItem>
                                        <SelectItem value="asc">Ascendente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Aplicar Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos ({payments.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Registrado por</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.membership.client.name}
                                        </TableCell>
                                        <TableCell>{payment.membership.plan.name}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payment.currency.toUpperCase()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {getPaymentMethodBadge(payment)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDate(payment.payment_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {payment.registered_by.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(payment.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/payments/${payment.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/payments/${payment.id}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(payment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {payments.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    currentPage={payments.current_page}
                                    totalPages={payments.last_page}
                                    onPageChange={(page: number) => {
                                        router.get('/payments', {
                                            ...filters,
                                            page,
                                        }, { preserveState: true });
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
}
