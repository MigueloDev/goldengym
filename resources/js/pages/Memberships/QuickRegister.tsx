import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, Plus, User, CreditCard, Calendar, X, Upload, FileImage, FileText, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';

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

interface PaymentMethod {
  method: 'cash_usd' | 'cash_local' | 'card_usd' | 'card_local' | 'transfer_usd' | 'transfer_local' | 'crypto' | 'other';
  amount: string;
  reference: string;
  notes: string;
}

interface Props {
  plans: Plan[];
  clients: Client[];
}

export default function QuickRegister({ plans, clients }: Props) {
  const [isNewClient, setIsNewClient] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash_usd', amount: '', reference: '', notes: '' }
  ]);

  // Estado para evidencias de pago
  const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      { method: 'cash_usd' as const, amount: '', reference: '', notes: '' }
    ]),
  });

  // Calcular total de todos los métodos de pago
  const totalAmount = paymentMethods.reduce((sum, method) => {
    return sum + (parseFloat(method.amount) || 0);
  }, 0);

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
    router.post(route('memberships.store-quick-register'), formData);
  };

  const selectedPlan = plans.find(plan => plan.id.toString() === data.plan_id);

  const addPaymentMethod = () => {
    const newMethods = [...paymentMethods, { method: 'cash_usd' as const, amount: '', reference: '', notes: '' }];
    setPaymentMethods(newMethods);
    setData('payment_methods_json', JSON.stringify(newMethods));
  };

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
      setData('payment_methods_json', JSON.stringify(newMethods));
    }
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string) => {
    const newMethods = [...paymentMethods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setPaymentMethods(newMethods);
    setData('payment_methods_json', JSON.stringify(newMethods));
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      cash_usd: 'Efectivo USD',
      cash_local: 'Efectivo VES',
      card_usd: 'Tarjeta USD',
      card_local: 'Tarjeta VES',
      transfer_usd: 'Transferencia USD',
      transfer_local: 'Transferencia VES',
      crypto: 'Crypto',
      other: 'Otro',
    };
    return labels[method as keyof typeof labels] || method;
  };

  // Funciones para manejar evidencias de pago
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validar tipos de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert('Algunos archivos no son válidos. Solo se permiten imágenes (JPEG, PNG, JPG, GIF) y PDFs.');
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const sizeValidFiles = validFiles.filter(file => file.size <= maxSize);

    if (sizeValidFiles.length !== validFiles.length) {
      alert('Algunos archivos son demasiado grandes. El tamaño máximo es 5MB por archivo.');
    }

    setPaymentEvidences(prev => [...prev, ...sizeValidFiles]);

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeEvidence = (index: number) => {
    setPaymentEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AppLayout breadcrumbs={membershipsBreadcrumbs.create()}>
      <Head title="Registro Rápido - Membresía" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="exchange_rate">Tasa de Cambio</Label>
                  <Input
                    id="exchange_rate"
                    type="number"
                    step="0.01"
                    disabled={data.payment_currency === 'local'}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.payment_currency === 'local'
                      ? 'No aplica (misma moneda)'
                      : 'Tasa de cambio del día'}
                  </p>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Métodos de Pago</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPaymentMethod}
                  >
                    <Icon iconNode={Plus} className="mr-2 h-4 w-4" />
                    Agregar Método
                  </Button>
                </div>

                {paymentMethods.map((method, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Método {index + 1}</h4>
                      {paymentMethods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentMethod(index)}
                        >
                          <Icon iconNode={X} className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Método de pago</Label>
                        <Select
                          value={method.method}
                          onValueChange={(value) => updatePaymentMethod(index, 'method', value as PaymentMethod['method'])}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={getMethodLabel(method.method)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash_usd">Efectivo USD</SelectItem>
                            <SelectItem value="cash_local">Efectivo VES</SelectItem>
                            <SelectItem value="card_usd">Tarjeta USD</SelectItem>
                            <SelectItem value="card_local">Tarjeta VES</SelectItem>
                            <SelectItem value="transfer_usd">Transferencia USD</SelectItem>
                            <SelectItem value="transfer_local">Transferencia VES</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={method.amount}
                          onChange={(e) => updatePaymentMethod(index, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Referencia</Label>
                        <Input
                          value={method.reference}
                          onChange={(e) => updatePaymentMethod(index, 'reference', e.target.value)}
                          placeholder="Número de referencia..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notas</Label>
                        <Input
                          value={method.notes}
                          onChange={(e) => updatePaymentMethod(index, 'notes', e.target.value)}
                          placeholder="Notas específicas..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total del Pago:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {data.payment_currency === 'usd' ? '$' : 'Bs'}{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Generales</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Notas adicionales sobre el pago..."
                  rows={3}
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
              </div>

              {/* Evidencias de Pago */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Evidencias de Pago</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon iconNode={Upload} className="mr-2 h-4 w-4" />
                    Agregar Evidencias
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {paymentEvidences.length > 0 && (
                  <div className="space-y-2">
                    <Label>Archivos seleccionados ({paymentEvidences.length})</Label>
                    <div className="space-y-2">
                      {paymentEvidences.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file)}
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvidence(index)}
                          >
                            <Icon iconNode={Trash2} className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>• Tipos permitidos: JPG, JPEG, PNG, GIF, PDF</p>
                  <p>• Tamaño máximo: 5MB por archivo</p>
                  <p>• Puedes agregar múltiples archivos</p>
                </div>
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
                      {data.payment_currency === 'usd' ? '$' : 'Bs'}{totalAmount.toLocaleString()}
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
