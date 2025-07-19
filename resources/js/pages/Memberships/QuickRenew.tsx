import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, RefreshCw, Calendar } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import AppLayout from '@/layouts/app-layout';
import PaymentMethodsForm from '@/components/payment-methods-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

interface PaymentMethod {
  method: 'cash_usd' | 'cash_local' | 'card_usd' | 'card_local' | 'transfer_usd' | 'transfer_local' | 'crypto' | 'other';
  amount: string;
  reference: string;
  notes: string;
  type: 'usd' | 'bs';
}

interface Props {
  membership: Membership;
  plans: Plan[];
}

export default function QuickRenew({ membership, plans }: Props) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash_usd', amount: '', type: 'usd', reference: '', notes: '' }
  ]);
  const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);

  const { data, setData, processing, errors } = useForm({
    plan_id: membership.plan.id.toString(),
    payment_currency: membership.currency,
    notes: '',
    payment_methods_json: JSON.stringify([
      { method: 'cash_usd' as const, amount: '', type: 'usd', reference: '', notes: '' }
    ]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear FormData para enviar archivos
    const formData = new FormData();

    // Agregar datos del formulario
    Object.keys(data).forEach(key => {
      const value = data[key as keyof typeof data];
      if (typeof value === 'string') {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      }
    });

    // Agregar archivos de evidencia
    paymentEvidences.forEach((file, index) => {
      formData.append(`payment_evidences[${index}]`, file);
    });

    // Enviar con FormData usando router.post
    router.post(route('memberships.store-quick-renew', membership.id), formData);
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'usd' ? '$' : 'Bs';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Actualizar payment_methods_json cuando cambien los métodos
  React.useEffect(() => {
    setData('payment_methods_json', JSON.stringify(paymentMethods));
  }, [paymentMethods, setData]);

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.create()}>
      <Head title="Renovación Rápida - Membresía" />

      <div className="flex h-full flex-1 flex-col gap-6 p-6">
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
          <PaymentMethodsForm
            paymentCurrency={data.payment_currency as 'local' | 'usd'}
            onPaymentCurrencyChange={(currency) => setData('payment_currency', currency)}
            paymentMethods={paymentMethods}
            onPaymentMethodsChange={setPaymentMethods}
            paymentEvidences={paymentEvidences}
            onPaymentEvidencesChange={setPaymentEvidences}
            notes={data.notes}
            onNotesChange={(notes) => setData('notes', notes)}
            errors={errors}
            targetAmount={selectedPlan?.price || 0}
            showExchangeRate={true}
            showDualAmounts={true}
          />

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
                      {formatCurrency(paymentMethods.reduce((sum, method) => sum + (parseFloat(method.amount) || 0), 0), data.payment_currency as 'local' | 'usd')}
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
      </div>
    </AppLayout>
  );
}
