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
import CreateClientModal from '@/components/clients/CreateClientModal';
import ClientSearch from '@/components/clients/ClientSearch';
import { bodyToFetch } from '@/helpers';
import { useToast } from '@/components/ui/toast';
import Decimal from 'decimal.js';

interface Plan {
  id: number;
  name: string;
  price: number;
  price_usd: number;
  duration: number;
  duration_type: string;
  subscription_price_usd: number;
  subscription_price_local: number;
}

interface Pathology {
  id: number;
  name: string;
  description: string | null;
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
  pathologies: Pathology[];
}

export default function QuickRegister({ plans, pathologies }: Props) {
  const [isNewClient, setIsNewClient] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string; email: string; identification_number: string } | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash_usd', amount: '', type: 'usd', reference: '', notes: '' }
  ]);
  const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);
  const [includeSubscription, setIncludeSubscription] = useState(true);
  const { addToast } = useToast();

  const { data, setData, processing, errors } = useForm({
    client_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_currency: 'local',
    payment_methods_json: JSON.stringify([
      { method: 'cash_usd' as const, amount: '', type: 'usd', reference: '', notes: '' }
    ]),
    exchange_rate: '',
  });

  const formatCurrency = (plan: Plan, currency: string) => {
    const amount = currency === 'usd' ? plan.price_usd : plan.price;
    const symbol = currency === 'usd' ? '$' : '$';
    return `${symbol}${amount?.toFixed(2) || '0.00'}`;
  };

  const formatSubscriptionPrice = (plan: Plan, currency: string) => {
    if (!plan) return '0.00';
    const amount = currency === 'usd' ? plan.subscription_price_usd : plan.subscription_price_local;
    const symbol = currency === 'usd' ? '$' : '$';
    return `${symbol}${amount || '0.00'}`;
  };

  const calculateTotalAmountWithSubscription = (plan: Plan | null, paymentCurrency: 'usd' | 'bs' | 'local', includeSubscription: boolean) => {
    if (!plan) {
      return new Decimal(0);
    }

    try {
      if (paymentCurrency === 'usd') {
        // Para USD: precio del plan + precio de suscripción en USD (si se incluye)
        const planPrice = new Decimal(plan.price_usd || 0);
        const subscriptionPrice = includeSubscription ? new Decimal(plan.subscription_price_usd || 0) : new Decimal(0);
        return planPrice.plus(subscriptionPrice);
      } else {
        // Para Bs: precio del plan + precio de suscripción en Bs (si se incluye)
        const planPrice = new Decimal(plan.price || 0);
        const subscriptionPrice = includeSubscription ? new Decimal(plan.subscription_price_local || 0) : new Decimal(0);
        return planPrice.plus(subscriptionPrice);
      }
    } catch (error) {
      console.error('Error calculating total amount:', error);
      return new Decimal(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = {
      ...data,
      payment_evidences: paymentEvidences,
    }
    const formData = bodyToFetch(form, true, true);
    router.post(route('memberships.store-quick-register'), formData, {
      onError: (errors) => {
        console.log("Se recibieron errores");
        console.log('Errores recibidos:', errors);
      },
      onSuccess: (response) => {
        console.log(response);
        addToast({
          title: 'Membresía registrada exitosamente',
          message: 'La membresía ha sido registrada exitosamente',
          type: 'success'
        });
        console.log('Éxito en el envío');
      }
    });
  };

  const handleClientCreated = (newClient: { id: number; name: string; email: string }) => {
    setData('client_id', newClient.id.toString());
    setSelectedClient({
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      identification_number: ''
    });
    setIsNewClient(false);
    addToast({
      title: 'Cliente creado exitosamente',
      message: `El cliente "${newClient.name}" ha sido creado y seleccionado`,
      type: 'success'
    });
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
                      <ClientSearch
                        value={data.client_id}
                        onValueChange={(value) => setData('client_id', value)}
                        onClientSelect={(client) => {
                          setData('client_id', client.id.toString());
                          setSelectedClient(client);
                        }}
                        selectedClient={selectedClient}
                        label="Seleccionar Cliente"
                        placeholder="Buscar cliente por nombre, email o cédula..."
                        error={errors.client_id}
                      />
                      {/* Botón para crear nuevo cliente */}
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateClientModal(true)}
                        >
                          <Icon iconNode={Plus} className="mr-2 h-4 w-4" />
                          Crear Nuevo Cliente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Usa el botón "Crear Nuevo Cliente" para agregar un cliente desde aquí
                      </p>
                      <Button
                        type="button"
                        onClick={() => setShowCreateClientModal(true)}
                      >
                        <Icon iconNode={Plus} className="mr-2 h-4 w-4" />
                        Crear Nuevo Cliente
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                              {plan.name} - {formatCurrency(plan, data.payment_currency as 'usd' | 'local')}
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
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id="include_subscription"
                          checked={includeSubscription}
                          onChange={(e) => setIncludeSubscription(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <Label htmlFor="include_subscription" className="text-sm font-medium">
                          Incluir costo de inscripción
                        </Label>
                      </div>
                      {includeSubscription && (
                        <p className="w-20 text-center text-sm font-bold text-golden bg-black p-2 rounded-md border-3 border-golden">
                          {formatSubscriptionPrice(selectedPlan as Plan, data.payment_currency as 'usd' | 'local')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              targetAmount={calculateTotalAmountWithSubscription(selectedPlan || null, data.payment_currency as 'usd' | 'bs' | 'local', includeSubscription).toNumber()}
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
                {processing ? 'Registrando...' : 'Registrar Membresía'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para crear cliente */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onClientCreated={handleClientCreated}
        pathologies={pathologies}
        fromMembership={true}
      />
    </AppLayout>
  );
}
