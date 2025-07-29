import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import PaymentMethodsForm from '@/components/payment-methods-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bodyToFetch } from '@/helpers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';

interface Plan {
  id: number;
  name: string;
  price: number;
  price_usd: number;
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
  const { addToast } = useToast();

  const { data, setData, processing, errors } = useForm({
    plan_id: membership.plan.id.toString(),
    payment_currency: membership.currency,
    notes: '',
    payment_methods_json: JSON.stringify([
      { method: 'cash_usd' as const, amount: '', type: 'usd', reference: '', notes: '' }
    ]),
    exchange_rate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = {
      ...data,
      payment_evidences: paymentEvidences,
    }
    const formData = bodyToFetch(form, true, true);

    router.post(route('memberships.store-quick-renew', membership.id), formData, {
      onError: (errors) => {
        console.log("Se recibieron errores");
        console.log('Errores recibidos:', errors);
      },
      onSuccess: (response) => {
        console.log(response);
        addToast({
          title: 'Membresía renovada exitosamente',
          message: 'La membresía ha sido renovada exitosamente',
          type: 'success'
        });
        console.log('Éxito en el envío');
      }
    });
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);
  React.useEffect(() => {
    setData('payment_methods_json', JSON.stringify(paymentMethods));
  }, [paymentMethods, setData]);

  const formatCurrency = (plan: Plan, currency: string) => {
    const symbol = currency === 'usd' ? '$' : '$';
    return `${symbol}${currency === 'usd' ? plan.price_usd : plan.price}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.create()}>
      <Head title="Renovación Rápida - Membresía" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-0">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Heading title="Renovación Rápida de Membresía" />
          <div className="flex items-center gap-4">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Errores de Validación</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {Object.entries(errors).map(([key, error]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {Array.isArray(error) ? error[0] : error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-4">

          <div className="grid grid-cols-1 gap-4">
            <Card className='gap-1'>
              <CardHeader>
                <CardTitle>Membresía Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p className="text-lg font-semibold">{membership.client.name}</p>
                    <p className="text-sm text-muted-foreground">{membership.client.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={membership.status === 'active' ? 'golden' : 'secondary'}>
                        {membership.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan Actual</Label>
                    <p className="text-lg font-semibold">{membership.plan.name}</p>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Badge variant="golden" className='text-sm'>
                        {formatCurrency(membership.plan.price, 'usd')}
                      </Badge>
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
          </div>
          <div className="grid grid-cols-1 gap-4">
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
                          {plan.name} - {formatCurrency(plan, data.payment_currency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.plan_id && <p className="text-sm text-red-600">{errors.plan_id}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
            targetAmount={data.payment_currency === 'usd' ? selectedPlan?.price_usd || 0 : selectedPlan?.price || 0}
            showExchangeRate={true}
            exchangeRate={data.exchange_rate}
            onExchangeRateChange={(rate) => setData('exchange_rate', rate)}
          />

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
