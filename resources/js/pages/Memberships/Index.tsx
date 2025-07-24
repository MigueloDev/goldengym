import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { Users, CheckCircle, XCircle, Clock, Plus, Search, X, RefreshCw, Eye, Edit, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Membership {
  id: number;
  client: {
    id: number;
    name: string;
    email: string;
  };
  plan: {
    id: number;
    name: string;
    price: number;
  };
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  amount_paid: number;
  currency: 'local' | 'usd';
  payments_count: number;
  created_at: string;
  payments: {
    id: number;
    amount: number;
    currency: 'local' | 'usd';
    method_color: string
  }[];
}

interface Filters {
  search?: string;
  status?: string;
  plan_id?: string;
  sort_by?: string;
  sort_direction?: string;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  expiring_soon: number;
}

interface Props {
  memberships: {
    data: Membership[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Filters;
  stats: Stats;
}

export default function MembershipsIndex({ memberships, filters, stats }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [planId, setPlanId] = useState(filters.plan_id || '');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

  const handleFilter = () => {
    router.get(route('memberships.index'), {
      search,
      status,
      plan_id: planId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPlanId('');
    setSortBy('created_at');
    setSortDirection('desc');
    router.get(route('memberships.index'), {}, {
      preserveState: true,
      preserveScroll: true,
    });
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

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'usd' ? '$' : 'Bs';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.index()}>
      <Head title="Membresías" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Heading title="Membresías" />
          <div className="flex gap-2">
            <Link href={route('memberships.quick-register')}>
              <Button>
                <Icon iconNode={Plus} className="mr-2 h-4 w-4" />
                Registro Rápido
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Icon iconNode={Users} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Icon iconNode={CheckCircle} className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
              <Icon iconNode={XCircle} className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </CardContent>
          </Card>
          <Card className='gap-1 h-18 py-2 border-golden/20 bg-golden/5'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Expiran Pronto</CardTitle>
              <Icon iconNode={Clock} className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiring_soon}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium">Buscar</label>
                <Input
                  placeholder="Buscar por cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                    <SelectItem value="suspended">Suspendida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Fecha de creación</SelectItem>
                    <SelectItem value="start_date">Fecha de inicio</SelectItem>
                    <SelectItem value="end_date">Fecha de fin</SelectItem>
                    <SelectItem value="amount_paid">Monto pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
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
              <div className="flex items-end gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  <Icon iconNode={Search} className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  <Icon iconNode={X} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memberships Table */}
        <Card>
          <CardHeader>
            <CardTitle>Membresías ({memberships.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Pagos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.data.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell className="font-medium">
                      {membership.client.name}
                    </TableCell>
                    <TableCell>{membership.plan.name}</TableCell>
                    <TableCell>
                      {getStatusBadge(membership.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Inicio: {formatDate(membership.start_date)}</div>
                        <div>Fin: {formatDate(membership.end_date)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {
                        membership?.payments?.map((payment) => {
                          return (
                            <Badge key={payment.id} className={payment.method_color}>
                              {formatCurrency(payment.amount, payment.currency)}
                            </Badge>
                          )
                        })
                      }
                    </TableCell>
                    <TableCell>{membership.payments_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={route('memberships.quick-renew', membership.id)}>
                          <Button size="sm" variant="outline">
                            <Icon iconNode={RefreshCw} className="mr-2 h-4 w-4" />
                            Renovar
                          </Button>
                        </Link>
                        <Link href={route('memberships.show', membership.id)}>
                          <Button size="sm" variant="outline">
                            <Icon iconNode={Eye} className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                        <Link href={route('memberships.edit', membership.id)}>
                          <Button size="sm" variant="outline">
                            <Icon iconNode={Edit} className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {memberships.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((memberships.current_page - 1) * memberships.per_page) + 1} a {Math.min(memberships.current_page * memberships.per_page, memberships.total)} de {memberships.total} resultados
                </div>
                <div className="flex gap-2">
                  {memberships.current_page > 1 && (
                    <Link href={route('memberships.index', { page: memberships.current_page - 1, ...filters })}>
                      <Button variant="outline" size="sm">
                        <Icon iconNode={ChevronLeft} className="h-4 w-4" />
                        Anterior
                      </Button>
                    </Link>
                  )}
                  {memberships.current_page < memberships.last_page && (
                    <Link href={route('memberships.index', { page: memberships.current_page + 1, ...filters })}>
                      <Button variant="outline" size="sm">
                        Siguiente
                        <Icon iconNode={ChevronRight} className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AppLayout>
  );
}
