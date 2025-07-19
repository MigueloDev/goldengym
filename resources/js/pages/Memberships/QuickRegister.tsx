import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, Plus, User, CreditCard, Calendar } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  duration_type: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/* interface FormData {
  client_id: string;
  new_client: {
    name: string;
    email: string;
    phone: string;
  };
  plan_id: string;
  start_date: string;
  notes: string;
  payment_amount: string;
  payment_currency: 'local' | 'usd';
  payment_method: 'cash' | 'card' | 'transfer' | 'other';
  payment_reference: string;
} */

interface Props {
  plans: Plan[];
  clients: Client[];
}

export default function QuickRegister({ plans, clients }: Props) {
  const [isNewClient, setIsNewClient] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    client_id: '',
    new_client: {
      name: '',
      email: '',
      phone: '',
    },
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_amount: '',
    payment_currency: 'local',
    payment_method: 'cash',
    payment_reference: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('memberships.store-quick-register'));
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);

  return (
    <>
      <Head title="Registro Rápido - Membresía" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <Icon iconNode={ArrowLeft} className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Heading title="Registro Rápido de Membresía" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconNode={User} className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <Card>
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
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Notas adicionales..."
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
                      <SelectItem value="local">Colones (₡)</SelectItem>
                      <SelectItem value="usd">Dólares ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_currency && <p className="text-sm text-red-600">{errors.payment_currency}</p>}
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
                <CardTitle>Resumen</CardTitle>
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
              {processing ? 'Registrando...' : 'Registrar Membresía'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
