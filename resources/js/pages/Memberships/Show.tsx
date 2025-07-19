import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, Edit, RefreshCw, User, Calendar, CreditCard } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  reference: string;
  registered_by: {
    id: number;
    name: string;
  };
}

interface Renewal {
  id: number;
  previous_end_date: string;
  new_end_date: string;
  amount_paid: number;
  currency: string;
  processed_by: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Membership {
  id: number;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  plan: {
    id: number;
    name: string;
    price: number;
    duration: number;
    duration_type: string;
  };
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  amount_paid: number;
  currency: 'local' | 'usd';
  notes: string;
  registered_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  payments: Payment[];
  renewals: Renewal[];
}

interface Props {
  membership: Membership;
}

export default function MembershipShow({ membership }: Props) {
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'usd' ? '$' : '₡';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
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

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      other: 'Otro',
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <>
      <Head title={`Membresía - ${membership.client.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Heading title={`Membresía de ${membership.client.name}`} />
          </div>
          <div className="flex gap-2">
            <Link href={route('memberships.quick-renew', membership.id)}>
              <Button variant="outline">
                <Icon iconNode={RefreshCw} className="mr-2 h-4 w-4" />
                Renovar
              </Button>
            </Link>
            <Link href={route('memberships.edit', membership.id)}>
              <Button>
                <Icon iconNode={Edit} className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconNode={User} className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nombre</Label>
                    <p className="text-lg font-semibold">{membership.client.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{membership.client.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <p className="text-sm">{membership.client.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(membership.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de la Membresía */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconNode={Calendar} className="h-5 w-5" />
                  Información de la Membresía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <p className="text-lg font-semibold">{membership.plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {membership.plan.duration} {membership.plan.duration_type} - {formatCurrency(membership.plan.price, membership.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Período</Label>
                    <p className="text-sm">
                      {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Monto Pagado</Label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(membership.amount_paid, membership.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Registrado por</Label>
                    <p className="text-sm">{membership.registered_by.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(membership.created_at)}
                    </p>
                  </div>
                </div>
                {membership.notes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Notas</Label>
                    <p className="text-sm mt-1">{membership.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconNode={CreditCard} className="h-5 w-5" />
                  Pagos ({membership.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {membership.payments.length > 0 ? (
                  <div className="space-y-3">
                    {membership.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getPaymentMethodLabel(payment.payment_method)}
                            {payment.reference && ` - ${payment.reference}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{formatDate(payment.payment_date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {payment.registered_by.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>
                )}
              </CardContent>
            </Card>

            {/* Renovaciones */}
            {membership.renewals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon iconNode={RefreshCw} className="h-5 w-5" />
                    Renovaciones ({membership.renewals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {membership.renewals.map((renewal) => (
                      <div key={renewal.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {formatCurrency(renewal.amount_paid, renewal.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(renewal.created_at)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Período anterior: {formatDate(renewal.previous_end_date)}</div>
                          <div>Nuevo período: {formatDate(renewal.new_end_date)}</div>
                          <div>Procesado por: {renewal.processed_by.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={route('memberships.quick-renew', membership.id)} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon iconNode={RefreshCw} className="mr-2 h-4 w-4" />
                    Renovar Membresía
                  </Button>
                </Link>
                <Link href={route('memberships.edit', membership.id)} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon iconNode={Edit} className="mr-2 h-4 w-4" />
                    Editar Membresía
                  </Button>
                </Link>
                <Link href={route('clients.show', membership.client.id)} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon iconNode={User} className="mr-2 h-4 w-4" />
                    Ver Cliente
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total pagado:</span>
                  <span className="font-medium">
                    {formatCurrency(membership.amount_paid, membership.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pagos realizados:</span>
                  <span className="font-medium">{membership.payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Renovaciones:</span>
                  <span className="font-medium">{membership.renewals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Días restantes:</span>
                  <span className="font-medium">
                    {Math.max(0, Math.ceil((new Date(membership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
