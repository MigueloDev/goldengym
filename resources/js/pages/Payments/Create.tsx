import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Save,
    DollarSign,
    Calendar,
    AlertCircle,
    User,
    CheckCircle,
    Plus,
    X,
    Upload,
    FileImage,
    FileText,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { paymentsBreadcrumbs } from '@/lib/breadcrumbs';
import { createFormDataWithFiles } from '@/helpers';

interface Membership {
  id: number;
  client: {
    id: number;
    name: string;
    email: string | null;
  };
  plan: {
    id: number;
    name: string;
    price: number;
    price_usd: number;
    renewal_period_days: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  amount_paid: number;
  currency: 'local' | 'usd';
  total_payments: number;
  remaining_amount: number;
  plan_price_local: number;
  plan_price_usd: number;
}

interface PaymentMethod {
  method: 'cash_usd' | 'cash_local' | 'card_usd' | 'card_local' | 'transfer_usd' | 'transfer_local' | 'crypto' | 'other';
  amount: string;
  reference: string;
  notes: string;
}

interface Props {
  membership?: Membership;
  membershipsWithDebt: Membership[];
}

export default function CreatePayment({ membership, membershipsWithDebt }: Props) {
  const { data, setData, processing, errors } = useForm({
    membership_id: membership?.id?.toString() || '',
    currency: 'local',
    exchange_rate: '',
    selected_price: '',
    selected_currency: 'local',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_methods_json: JSON.stringify([
      { method: 'cash_usd' as const, amount: '', reference: '', notes: '' }
    ]),
  });

  const [selectedMembership, setSelectedMembership] = useState<Membership | undefined>(membership);
  const [willRenew, setWillRenew] = useState(false);
  const [newEndDate, setNewEndDate] = useState<string>('');
      const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { method: 'cash_usd', amount: '', reference: '', notes: '' }
    ]);

    // Estado para evidencias de pago
    const [paymentEvidences, setPaymentEvidences] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcular total de todos los métodos de pago
  const totalAmount = paymentMethods.reduce((sum, method) => {
    return sum + (parseFloat(method.amount) || 0);
  }, 0);

  // Calcular la deuda basada en el precio seleccionado
  const calculateRemainingDebt = () => {
    if (!selectedMembership || !data.selected_price) return 0;

    const selectedPrice = parseFloat(data.selected_price);
    const totalPaid = selectedMembership.total_payments;
    return Math.max(0, selectedPrice - totalPaid);
  };

  const remainingDebt = calculateRemainingDebt();

  // Calcular si el pago renovará la membresía
  useEffect(() => {
    if (selectedMembership && totalAmount > 0 && data.selected_price) {
      const remaining = calculateRemainingDebt();

      if (totalAmount >= remaining) {
        setWillRenew(true);
        // Calcular nueva fecha de fin
        const currentEndDate = new Date(selectedMembership.end_date);
        const newEnd = new Date(currentEndDate);
        newEnd.setDate(newEnd.getDate() + selectedMembership.plan.renewal_period_days);
        setNewEndDate(newEnd.toISOString().split('T')[0]);
      } else {
        setWillRenew(false);
        setNewEndDate('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembership, totalAmount, data.selected_price]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Usar la función helper para crear FormData
      const formData = createFormDataWithFiles(data, paymentEvidences);

      router.post('/payments', formData);
  };

  const formatCurrency = (amount: number, currency: 'local' | 'usd') => {
    const symbol = currency === 'usd' ? '$' : 'Bs';
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

  const handleMembershipChange = (membershipId: string) => {
    const membership = membershipsWithDebt.find(m => m.id.toString() === membershipId);
    setSelectedMembership(membership);
    setData('membership_id', membershipId);
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
    <AppLayout breadcrumbs={paymentsBreadcrumbs.create()}>
      <Head title="Nuevo Pago" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/payments">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Pago</h1>
                <p className="text-muted-foreground">
                  Registra un nuevo pago de membresía
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Membresía */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seleccionar Membresía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membership_id">Cliente con deuda *</Label>
                  <Select value={data.membership_id} onValueChange={handleMembershipChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente con deuda..." />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipsWithDebt.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{membership.client.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Deuda: {formatCurrency(membership.remaining_amount, membership.currency)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.membership_id && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.membership_id}
                    </p>
                  )}
                </div>

                {selectedMembership && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2">Información del Cliente</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Cliente:</strong> {selectedMembership.client.name}</div>
                          <div><strong>Plan:</strong> {selectedMembership.plan.name}</div>
                          <div><strong>Estado:</strong> {getStatusBadge(selectedMembership.status)}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Información de Pago</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Precio del plan (VES):</strong> {formatCurrency(selectedMembership.plan_price_local, 'local')}</div>

                          <div><strong>Precio del plan (USD):</strong> {formatCurrency(selectedMembership.plan_price_usd, 'usd')}</div>

                          <div><strong>Monto pagado:</strong> {formatCurrency(selectedMembership.total_payments, selectedMembership.currency)}</div>
                          <div><strong>Deuda restante (calculada):</strong> {formatCurrency(remainingDebt, data.selected_currency as 'local' | 'usd')}</div>
                          <div><strong>Vence:</strong> {formatDate(selectedMembership.end_date)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda *</Label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value as 'local' | 'usd')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">VES (Bolívares)</SelectItem>
                        <SelectItem value="usd">USD (Dólares)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.currency}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_date">Fecha de pago *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="payment_date"
                        type="date"
                        value={data.payment_date}
                        onChange={(e) => setData('payment_date', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.payment_date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.payment_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selección de Precio y Tasa de Cambio */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Configuración de Precio</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="selected_currency">Moneda del Plan *</Label>
                      <Select value={data.selected_currency} onValueChange={(value) => setData('selected_currency', value as 'local' | 'usd')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">VES (Bolívares)</SelectItem>
                          <SelectItem value="usd">USD (Dólares)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.selected_currency && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.selected_currency}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selected_price">Precio del Plan *</Label>
                      <Input
                        id="selected_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.selected_price}
                        onChange={(e) => setData('selected_price', e.target.value)}
                        placeholder="0.00"
                      />
                      {errors.selected_price && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.selected_price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exchange_rate">Tasa de Cambio</Label>
                      <Input
                        id="exchange_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.exchange_rate}
                        onChange={(e) => setData('exchange_rate', e.target.value)}
                        placeholder="0.00"
                        disabled={data.selected_currency === data.currency}
                      />
                      <p className="text-xs text-muted-foreground">
                        {data.selected_currency === data.currency
                          ? 'No aplica (misma moneda)'
                          : 'Tasa de cambio del día'}
                      </p>
                      {errors.exchange_rate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.exchange_rate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Información del Plan */}
                  {selectedMembership && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h5 className="font-medium mb-2">Precios del Plan</h5>
                      <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div>
                          <strong>Precio en Bolívares:</strong> {formatCurrency(selectedMembership.plan.price, 'local')}
                        </div>
                        <div>
                          <strong>Precio en Dólares:</strong> {formatCurrency(selectedMembership.plan.price_usd, 'usd')}
                        </div>
                      </div>
                    </div>
                  )}
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
                      <Plus className="mr-2 h-4 w-4" />
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
                            <X className="h-4 w-4" />
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
                        {formatCurrency(totalAmount, data.currency as 'local' | 'usd')}
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
                  {errors.notes && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.notes}
                    </p>
                  )}
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
                      <Upload className="mr-2 h-4 w-4" />
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
                              <Trash2 className="h-4 w-4 text-red-500" />
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

            {/* Información de Renovación */}
            {willRenew && selectedMembership && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Renovación Automática
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Este pago renovará la membresía automáticamente</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <strong>Fecha actual de fin:</strong> {formatDate(selectedMembership.end_date)}
                      </div>
                      <div>
                        <strong>Nueva fecha de fin:</strong> {formatDate(newEndDate)}
                      </div>
                      <div>
                        <strong>Período de renovación:</strong> {selectedMembership.plan.renewal_period_days} días
                      </div>
                      <div>
                        <strong>Monto total del pago:</strong> {formatCurrency(totalAmount, data.currency as 'local' | 'usd')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-4">
              <Link href="/payments">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                {processing ? 'Guardando...' : 'Guardar Pago'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
