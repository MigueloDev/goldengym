import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    CreditCard,
    DollarSign,
    Users,
    Calendar,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { plansBreadcrumbs } from '@/lib/breadcrumbs';

interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    price_usd: number;
    renewal_period_days: number;
    status: string;
    features: string[] | null;
    created_at: string;
    memberships_count: number;
    active_memberships_count: number;
}

interface Props {
    plans: {
        data: Plan[];
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
        status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total: number;
        active: number;
        total_memberships: number;
        active_memberships: number;
    };
}

export default function PlansIndex({ plans, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const handleSearch = () => {
        router.get('/plans', {
            search,
            status,
            sort_by: sortBy,
            sort_direction: sortDirection,
        }, { preserveState: true });
    };

    const handleDelete = (planId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
            router.delete(`/plans/${planId}`);
        }
    };

    const formatPrice = (price: number, currency: 'USD' | 'VES' = 'VES') => {
        const formatter = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-VE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(price);
    };

    const getDiscountPercentage = (price: number, priceUsd: number) => {
        if (price <= 0) return 0;
        return Math.round(((price - priceUsd) / price) * 100);
    };

    return (
        <AppLayout breadcrumbs={plansBreadcrumbs.index()}>
            <Head title="Planes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Planes</h1>
                        <p className="text-muted-foreground">
                            Gestiona los planes de membresía del gimnasio
                        </p>
                    </div>
                    <Link href="/plans/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Plan
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Total Planes</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Total Membresías</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_memberships}</div>
                        </CardContent>
                    </Card>
                    <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_memberships}</div>
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
                                        placeholder="Nombre o descripción..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
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
                                        <SelectItem value="created_at">Fecha de creación</SelectItem>
                                        <SelectItem value="name">Nombre</SelectItem>
                                        <SelectItem value="price">Precio</SelectItem>
                                        <SelectItem value="status">Estado</SelectItem>
                                    </SelectContent>
                                </Select>
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

                {/* Plans List */}
                <div className="grid gap-4">
                    {plans.data.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                                            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                                {plan.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>

                                        {plan.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{formatPrice(plan.price_usd, 'USD')}</span>
                                                <span className="text-muted-foreground">USD</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{formatPrice(plan.price)}</span>
                                                <span className="text-muted-foreground">VES</span>
                                            </div>
                                            {plan.price > plan.price_usd && (
                                                <Badge variant="outline" className="text-xs">
                                                    {getDiscountPercentage(plan.price, plan.price_usd)}% descuento
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{plan.renewal_period_days} días</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-3 w-3" />
                                                <span>{plan.memberships_count} membresías</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <CheckCircle className="h-3 w-3" />
                                                <span>{plan.active_memberships_count} activas</span>
                                            </div>
                                        </div>

                                        {plan.features && plan.features.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {plan.features.slice(0, 3).map((feature, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                                {plan.features.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{plan.features.length - 3} más
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/plans/${plan.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/plans/${plan.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(plan.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {plans.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={plans.current_page}
                            totalPages={plans.last_page}
                            onPageChange={(page: number) => {
                                router.get('/plans', {
                                    ...filters,
                                    page,
                                }, { preserveState: true });
                            }}
                        />
                    </div>
                )}
                </div>
            </div>
        </AppLayout>
    );
}
