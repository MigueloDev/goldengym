import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import Heading from '@/components/heading';
import { ArrowLeft, RefreshCw, CreditCard, Calendar, Plus, X, Upload, FileImage, FileText, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { membershipsBreadcrumbs } from '@/lib/breadcrumbs';
import AppLayout from '@/layouts/app-layout';

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
}

interface Props {
  membership: Membership;
  plans: Plan[];
}

export default function QuickRenew({ membership, plans }: Props) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { method: 'cash_usd', amount: '', reference: '', notes: '' }
  ]);

  // Estado para evidencias de pago
  const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, processing, errors } = useForm({
    plan_id: membership.plan.id.toString(),
    payment_currency: membership.currency,
    payment_method: 'cash',
    payment_reference: '',
    notes: '',
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
      formData.append(key, data[key as keyof typeof data]);
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
                      {formatCurrency(totalAmount, data.payment_currency as 'local' | 'usd')}
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
                  placeholder="Notas adicionales sobre la renovación..."
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
                      {formatCurrency(totalAmount, data.payment_currency as 'local' | 'usd')}
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
