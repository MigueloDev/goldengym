import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import { formatCurrency } from '../../helpers/currency-calculator';
import DateInput from '@/components/DateInput';
import Decimal from 'decimal.js';

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
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  amount_paid: number;
  currency: 'local' | 'usd';
  notes: string;
}

interface Props {
  membership: Membership;
  plans: Plan[];
}

const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return '';

  // Si la fecha ya está en formato YYYY-MM-DD, la devolvemos tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Si es una fecha en otro formato, intentamos convertirla
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};


export default function MembershipEdit({ membership, plans }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    plan_id: membership.plan.id.toString(),
    start_date: formatDateForInput(membership.start_date),
    end_date: formatDateForInput(membership.end_date),
    status: membership.status,
    notes: membership.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('memberships.update', membership.id));
  };

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.edit(membership.id, membership.client.name)}>
      <Head title="Editar Membresía - ${membership.client.name}" />
      <div className="flex h-full flex-1 flex-col gap-1 p-6">
        <div className="space-y-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Heading title={`Editar Membresía de ${membership.client.name}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
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
              </div>
            </CardContent>
          </Card>

          {/* Información de la Membresía */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Membresía</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan_id">Plan *</Label>
                  <Select value={data.plan_id} onValueChange={(value) => setData('plan_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.plan_id && <p className="text-sm text-red-600">{errors.plan_id}</p>}
                </div>
                <div>
                  <Label htmlFor="status">Estado *</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'expired' | 'suspended' | 'cancelled')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                      <SelectItem value="suspended">Suspendida</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                </div>
                <DateInput
                  id="start_date"
                  label="Fecha de Inicio"
                  value={data.start_date}
                  onChange={(value) => setData('start_date', value)}
                  error={errors.start_date}
                  required
                  format="dd-mm-yyyy"
                />
                <DateInput
                  id="end_date"
                  label="Fecha de Fin"
                  value={data.end_date}
                  onChange={(value) => setData('end_date', value)}
                  error={errors.end_date}
                  required
                  format="dd-mm-yyyy"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Información de Pago */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Monto Pagado</Label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(new Decimal(membership.amount_paid), membership.currency === 'local' ? 'bs' : 'usd')}
                    </p>
                  </div>
                </div>
              <p className="text-sm text-muted-foreground mt-2">
                Nota: Los montos de pago no se pueden editar desde aquí. Para registrar nuevos pagos, use la función de renovación.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Icon iconNode={Save} className="mr-2 h-4 w-4" />
              {processing ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}
