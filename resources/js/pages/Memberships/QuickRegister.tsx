import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, Plus, User, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import PaymentMethodsForm from '@/components/payment-methods-form';
import { bodyToFetch } from '@/helpers';

interface Plan {
  id: number;
  name: string;
  price: number;
  price_usd: number;
  duration: number;
  duration_type: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface PaymentMethod {
  method: 'cash_usd' | 'cash_local' | 'card_usd' | 'card_local' | 'transfer_usd' | 'transfer_local' | 'crypto' | 'other';
  amount: string;
  reference: string;
  notes: string;
  type: 'usd' | 'bs';
}

interface Props {
  plans: Plan[];
  clients: Client[];
}

export default function QuickRegister({ plans, clients }: Props) {
  const [isNewClient, setIsNewClient] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash_usd', amount: '', type: 'usd', reference: '', notes: '' }
  ]);
  const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);

  const { data, setData, processing, errors } = useForm({
    client_id: '',
    new_client: {
      name: '',
      email: '',
      phone: '',
    },
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_currency: 'local',
    payment_methods_json: JSON.stringify([
      { method: 'cash_usd' as const, amount: '', type: 'usd', reference: '', notes: '' }
    ]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentMethods = JSON.parse(data.payment_methods_json);
    const form = {
      ...data,
      payment_methods: paymentMethods,
      payment_evidences: paymentEvidences,
    }
    const formData = bodyToFetch(form, true, true);
    router.post(route('memberships.store-quick-register'), formData);
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);
  React.useEffect(() => {
    setData('payment_methods_json', JSON.stringify(paymentMethods));
  }, [paymentMethods, setData]);

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.create()}>
      <Head title="Registro Rápido - Membresía" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-0">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Heading title="Registro Rápido de Membresía" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col md:flex-row gap-4">
          {/* Cliente */}
          <Card className="md:w-1/2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconNode={User} className="h-5 w-5" />
                Información del Cliente

                <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!isNewClient ? "default" : "outline"}
                  onClick={() => setIsNewClient(false)}
                >
                  Cliente Existente
                </Button>
                <Button
                  type="button"
                  variant={isNewClient ? "default" : "outline"}
                  onClick={() => setIsNewClient(true)}
                >
                  <Icon iconNode={Plus} className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">

              {!isNewClient ? (
                <div>
                  <Label htmlFor="client_id">Seleccionar Cliente</Label>
                  <Select value={data.client_id} onValueChange={(value) => setData('client_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p className="text-sm text-red-600">{errors.client_id}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="new_client.name">Nombre *</Label>
                    <Input
                      id="new_client.name"
                      value={data.new_client.name}
                      onChange={(e) => setData('new_client', { ...data.new_client, name: e.target.value })}
                    />
                    {/* @ts-expect-error - non nested errors */}
                    {errors['new_client.name'] && <p className="text-sm text-red-600">{errors['new_client.name']}</p>}
                  </div>
                  <div>
                    <Label htmlFor="new_client.email">Email</Label>
                    <Input
                      id="new_client.email"
                      type="email"
                      value={data.new_client.email}
                      onChange={(e) => setData('new_client', { ...data.new_client, email: e.target.value })}
                    />
                    {/* @ts-expect-error - non nested errors */}
                    {errors['new_client.email'] && <p className="text-sm text-red-600">{errors['new_client.email']}</p>}
                  </div>
                  <div>
                    <Label htmlFor="new_client.phone">Teléfono</Label>
                    <Input
                      id="new_client.phone"
                      value={data.new_client.phone}
                      onChange={(e) => setData('new_client', { ...data.new_client, phone: e.target.value })}
                    />
                    {/* @ts-expect-error - non nested errors */}
                    {errors['new_client.phone'] && <p className="text-sm text-red-600">{errors['new_client.phone']}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membresía */}
          <Card className="md:w-1/2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconNode={Calendar} className="h-5 w-5" />
                Información de la Membresía
              </CardTitle>
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
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                  />
                  {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

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
            targetAmount={data.payment_currency === 'usd' ? selectedPlan?.price_usd || 0 : selectedPlan?.price || 0}
            showExchangeRate={true}
            showDualAmounts={true}
          />

          {/* Resumen */}
          {selectedPlan && (
            <Card className="gap-0 py-2">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-bold mb-0 py-0">Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duración:</span>
                    <span>{selectedPlan.duration} {selectedPlan.duration_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio del plan:</span>
                    <span>${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto a pagar:</span>
                    <span className="font-bold">
                      {data.payment_currency === 'usd' ? '$' : 'Bs'}{paymentMethods.reduce((sum, method) => sum + (parseFloat(method.amount) || 0), 0).toLocaleString()}
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
              {processing ? 'Registrando...' : 'Registrar Membresía'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
