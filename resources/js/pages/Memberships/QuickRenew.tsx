import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, RefreshCw, CreditCard, Calendar } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  duration_type: string;
}

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
  status: string;
  amount_paid: number;
  currency: string;
}

interface Props {
  membership: Membership;
  plans: Plan[];
}

export default function QuickRenew({ membership, plans }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    plan_id: membership.plan.id.toString(),
    payment_amount: '',
    payment_currency: membership.currency,
    payment_method: 'cash',
    payment_reference: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('memberships.store-quick-renew', membership.id));
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'usd' ? '$' : '₡';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <>
      <Head title="Renovación Rápida - Membresía" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Heading title="Renovación Rápida de Membresía" />
        </div>

        {/* Información Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Membresía Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Cliente</Label>
                <p className="text-lg font-semibold">{membership.client.name}</p>
                <p className="text-sm text-muted-foreground">{membership.client.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                    {membership.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Plan Actual</Label>
                <p className="text-lg font-semibold">{membership.plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(membership.plan.price, membership.currency)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Período Actual</Label>
                <p className="text-sm">
                  {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nueva Membresía */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconNode={Calendar} className="h-5 w-5" />
                Nueva Membresía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan_id">Plan *</Label>
                <Select value={data.plan_id} onValueChange={(value) => setData('plan_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - {formatCurrency(plan.price, data.payment_currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.plan_id && <p className="text-sm text-red-600">{errors.plan_id}</p>}
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Notas sobre la renovación..."
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconNode={CreditCard} className="h-5 w-5" />
                Información del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payment_amount">Monto *</Label>
                  <Input
                    id="payment_amount"
                    type="number"
                    step="0.01"
                    value={data.payment_amount}
                    onChange={(e) => setData('payment_amount', e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.payment_amount && <p className="text-sm text-red-600">{errors.payment_amount}</p>}
                </div>
                <div>
                  <Label htmlFor="payment_currency">Moneda *</Label>
                  <Select value={data.payment_currency} onValueChange={(value) => setData('payment_currency', value as 'local' | 'usd')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Bolívares (Bs)</SelectItem>
                      <SelectItem value="usd">Dólares ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_currency && <p className="text-sm text-red-600">{errors.payment_currency}</p>}
                </div>
                <div>
                  <Label htmlFor="exchange_rate">Tasa de Cambio *</Label>
                  <Input
                    id="exchange_rate"
                    type="number"
                    step="0.01"
                    disabled={data.payment_currency === 'local'}
                    value={data.payment_amount}
                    onChange={(e) => setData('payment_amount', e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.payment_amount && <p className="text-sm text-red-600">{errors.payment_amount}</p>}
                </div>
                <div>
                  <Label htmlFor="payment_method">Método de Pago *</Label>
                  <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value as 'cash' | 'card' | 'transfer' | 'other')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="payment_reference">Referencia</Label>
                <Input
                  id="payment_reference"
                  value={data.payment_reference}
                  onChange={(e) => setData('payment_reference', e.target.value)}
                  placeholder="Número de referencia o comprobante..."
                />
                {errors.payment_reference && <p className="text-sm text-red-600">{errors.payment_reference}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Renovación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{membership.client.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan anterior:</span>
                    <span>{membership.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nuevo plan:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha de fin actual:</span>
                    <span>{formatDate(membership.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto a pagar:</span>
                    <span className="font-bold">
                      {data.payment_currency === 'usd' ? '$' : '₡'}{data.payment_amount || '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Icon iconNode={RefreshCw} className="mr-2 h-4 w-4" />
              {processing ? 'Renovando...' : 'Renovar Membresía'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
