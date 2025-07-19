import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/icon';
import { Plus, X, Upload, FileImage, FileText, Trash2, CreditCard } from 'lucide-react';

interface PaymentMethod {
  method: 'cash_usd' | 'cash_local' | 'card_usd' | 'card_local' | 'transfer_usd' | 'transfer_local' | 'crypto' | 'other';
  amount: string;
  amount_usd?: string; // Monto en USD
  amount_bs?: string;  // Monto en Bolívares
  reference: string;
  notes: string;
  type: 'usd' | 'bs';
}

interface PaymentMethodsFormProps {
  paymentCurrency: 'local' | 'usd';
  onPaymentCurrencyChange: (currency: 'local' | 'usd') => void;
  paymentMethods: PaymentMethod[];
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void;
  paymentEvidences: File[];
  onPaymentEvidencesChange: (evidences: File[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  errors?: Record<string, string>;
  targetAmount?: number; // Monto objetivo en USD para calcular conversión
  showExchangeRate?: boolean; // Si mostrar campo de tasa de cambio
  showDualAmounts?: boolean; // Si mostrar montos en USD y Bs
}

export default function PaymentMethodsForm({
  paymentCurrency,
  onPaymentCurrencyChange,
  paymentMethods,
  onPaymentMethodsChange,
  paymentEvidences,
  onPaymentEvidencesChange,
  notes,
  onNotesChange,
  errors = {},
  targetAmount = 0,
  showExchangeRate = true,
  showDualAmounts = true,
}: PaymentMethodsFormProps) {
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Calcular total de todos los métodos de pago
  const totalAmount = paymentMethods.reduce((sum, method) => {
    // Usar el monto principal o el monto en la moneda seleccionada
    const amount = paymentCurrency === 'usd'
      ? (parseFloat(method.amount_usd || method.amount) || 0)
      : (parseFloat(method.amount_bs || method.amount) || 0);
    return sum + amount;
  }, 0);

    // Calcular total en ambas monedas
  const totalAmountUSD = paymentMethods.reduce((sum, method) => {
    return sum + (parseFloat(method.amount_usd || method.amount) || 0);
  }, 0);

  const totalAmountBS = paymentMethods.reduce((sum, method) => {
    return sum + (parseFloat(method.amount_bs || '0') || 0);
  }, 0);

  // Calcular conversión cuando se paga en bolívares
  const calculateConversion = () => {
    if (paymentCurrency === 'local' && targetAmount > 0 && exchangeRate) {
      const rate = parseFloat(exchangeRate);
      if (rate > 0) {
        return targetAmount * rate;
      }
    }
    return 0;
  };

  const convertedAmount = calculateConversion();
  const remainingUSD = targetAmount - totalAmountUSD;
  const remainingBS = paymentCurrency === 'local' ? convertedAmount - totalAmountBS : 0;
  const isOverpayingUSD = remainingUSD < 0;
  const isOverpayingBS = remainingBS < 0;
  const overpaymentUSD = Math.abs(Math.min(0, remainingUSD));
  const overpaymentBS = Math.abs(Math.min(0, remainingBS));

  // Determinar el color del restante basado en el porcentaje pagado
  const getRemainingColor = (remaining: number, total: number) => {
    if (remaining < 0) return 'text-red-600'; // Exceso - rojo
    if (remaining === 0) return 'text-green-600'; // Completo - verde
    const percentagePaid = ((total - remaining) / total) * 100;
    if (percentagePaid >= 80) return 'text-orange-600'; // Casi completo - naranja
    return 'text-red-600'; // Pendiente - rojo
  };

  const remainingUSDColor = getRemainingColor(remainingUSD, targetAmount);
  const remainingBSColor = getRemainingColor(remainingBS, convertedAmount);

  // Función para calcular montos duales
  const calculateDualAmounts = (amount: string, fromCurrency: 'usd' | 'bs') => {
    if (!exchangeRate || parseFloat(exchangeRate) <= 0) return { usd: amount, bs: '' };

    const rate = parseFloat(exchangeRate);
    const numAmount = parseFloat(amount) || 0;

    if (fromCurrency === 'usd') {
      return { usd: amount, bs: (numAmount * rate).toFixed(2) };
    } else {
      return { usd: (numAmount / rate).toFixed(2), bs: amount };
    }
  };

  // Función para actualizar montos duales automáticamente
  const updateDualAmounts = (index: number, field: 'amount_usd' | 'amount_bs', value: string) => {
    const newMethods = [...paymentMethods];
    const method = { ...newMethods[index] };

    if (field === 'amount_usd') {
      method.amount_usd = value;
      const dualAmounts = calculateDualAmounts(value, 'usd');
      method.amount_bs = dualAmounts.bs;
      method.amount = value; // Mantener el monto principal
    } else if (field === 'amount_bs') {
      method.amount_bs = value;
      const dualAmounts = calculateDualAmounts(value, 'bs');
      method.amount_usd = dualAmounts.usd;
      method.amount = value; // Mantener el monto principal
    }

    newMethods[index] = method;
    onPaymentMethodsChange(newMethods);
  };

  const addPaymentMethod = () => {
    const newMethods = [...paymentMethods, {
      method: 'cash_usd' as const,
      type: 'usd' as const,
      amount: '',
      amount_usd: '',
      amount_bs: '',
      reference: '',
      notes: ''
    }];
    onPaymentMethodsChange(newMethods);
  };

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      onPaymentMethodsChange(newMethods);
    }
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string) => {
    const newMethods = [...paymentMethods];
    const typeObject: { type?: 'usd' | 'bs' } = {};
    if (field === 'method') {
      typeObject.type = value.includes('usd') ? 'usd' : 'bs';
    }
    newMethods[index] = { ...newMethods[index], [field]: value, ...typeObject };
    onPaymentMethodsChange(newMethods);
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

    onPaymentEvidencesChange([...paymentEvidences, ...sizeValidFiles]);

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeEvidence = (index: number) => {
    onPaymentEvidencesChange(paymentEvidences.filter((_, i) => i !== index));
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

  const formatCurrency = (amount: number, currency: 'local' | 'usd') => {
    const symbol = currency === 'usd' ? '$' : 'Bs';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <Card className="py-4 gap-2">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-0 mb-0 h-5">
          <Icon iconNode={CreditCard} className="h-5 w-5" />
          Información del Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="payment_currency">Moneda *</Label>
            <Select value={paymentCurrency} onValueChange={onPaymentCurrencyChange}>
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

          {showExchangeRate && (
            <div>
              <Label htmlFor="exchange_rate">Tasa de Cambio</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.01"
                min="0"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="0.00"
                disabled={paymentCurrency === 'usd'}
              />
              <p className="text-xs text-muted-foreground">
                {paymentCurrency === 'usd'
                  ? 'No aplica (pago en dólares)'
                  : 'Tasa Bs/USD para conversión automática'}
              </p>
              {showDualAmounts && exchangeRate && parseFloat(exchangeRate) > 0 && (
                <p className="text-xs text-blue-600">
                  💡 Los montos se convertirán automáticamente entre USD y Bs
                </p>
              )}
              {errors.exchange_rate && <p className="text-sm text-red-600">{errors.exchange_rate}</p>}
            </div>
          )}
        </div>

        {/* Información de conversión cuando se paga en bolívares */}
        {paymentCurrency === 'local' && targetAmount > 0 && convertedAmount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monto objetivo en USD:</span>
                <span className="font-medium">{formatCurrency(targetAmount, 'usd')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa de cambio:</span>
                <span className="font-medium">Bs {parseFloat(exchangeRate).toFixed(2)}/USD</span>
              </div>
              <div className="flex justify-between">
                <span>Monto equivalente (A pagar) en Bs:</span>
                <span className="font-bold text-xl text-blue-700">{formatCurrency(convertedAmount, 'local')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Métodos de Pago */}
        <div className="space-y-4 mt-2">
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
            <div key={index} className="py-1 px-4 border rounded-lg space-y-0">

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

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Monto {method.type === 'usd' ? 'USD' : 'Bs'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={method.type === 'usd' ? method.amount_usd || '' : method.amount_bs || ''}
                      onChange={(e) => updateDualAmounts(index, method.type === 'usd' ? 'amount_usd' : 'amount_bs', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                  <Label>Referencia</Label>
                    <Input
                      value={method.reference}
                      onChange={(e) => updatePaymentMethod(index, 'reference', e.target.value)}
                      placeholder="Número de referencia..."
                    />
                  </div>
                  {paymentMethods.length > 1 && (
                    <div className="space-y-2 mt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePaymentMethod(index)}
                      >
                        <Icon iconNode={X} className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Total y Restantes */}
          <div className="p-4 bg-muted/50 rounded-lg">
            {showDualAmounts ? (
              <div className="space-y-3">
                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total USD:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(totalAmountUSD, 'usd')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Bs:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(totalAmountBS, 'local')}
                    </span>
                  </div>
                </div>

                {/* Restantes */}
                {targetAmount > 0 && (
                  <div className="border-t pt-3 space-y-3">
                    {/* Barra de progreso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progreso del pago:</span>
                        <span className="font-medium">
                          {Math.round(((targetAmount - remainingUSD) / targetAmount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((targetAmount - remainingUSD) / targetAmount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Restantes/Exceso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {remainingUSD < 0 ? 'Exceso USD:' : 'Restante USD:'}
                        </span>
                        <span className={`text-xl font-bold ${remainingUSDColor}`}>
                          {remainingUSD < 0 ? '+' : ''}{formatCurrency(Math.abs(remainingUSD), 'usd')}
                        </span>
                      </div>
                      {convertedAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {remainingBS < 0 ? 'Exceso Bs:' : 'Restante Bs:'}
                          </span>
                          <span className={`text-xl font-bold ${remainingBSColor}`}>
                            {remainingBS < 0 ? '+' : ''}{formatCurrency(Math.abs(remainingBS), 'local')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total Principal */}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Principal ({paymentCurrency === 'usd' ? 'USD' : 'Bs'}):</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalAmount, paymentCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total del Pago:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmount, paymentCurrency)}
                </span>
              </div>
            )}
          </div>
        </div>

                {/* Alertas de exceso de pago */}
        {(isOverpayingUSD || isOverpayingBS) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  Exceso de Pago Detectado
                </h4>
                <div className="space-y-2">
                  {isOverpayingUSD && (
                    <div className="text-sm text-red-700">
                      <p>USD: El monto total excede el objetivo por {formatCurrency(overpaymentUSD, 'usd')}.</p>
                      <div className="text-xs text-red-600 mt-1">
                        <p>• Objetivo: {formatCurrency(targetAmount, 'usd')}</p>
                        <p>• Pagado: {formatCurrency(totalAmountUSD, 'usd')}</p>
                        <p>• Exceso: {formatCurrency(overpaymentUSD, 'usd')}</p>
                      </div>
                    </div>
                  )}
                  {isOverpayingBS && convertedAmount > 0 && (
                    <div className="text-sm text-red-700">
                      <p>Bs: El monto total excede el objetivo por {formatCurrency(overpaymentBS, 'local')}.</p>
                      <div className="text-xs text-red-600 mt-1">
                        <p>• Objetivo: {formatCurrency(convertedAmount, 'local')}</p>
                        <p>• Pagado: {formatCurrency(totalAmountBS, 'local')}</p>
                        <p>• Exceso: {formatCurrency(overpaymentBS, 'local')}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-red-700 mt-2 font-medium">
                  Verifica los montos ingresados antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notas Generales</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas adicionales sobre el pago..."
            rows={3}
          />
          {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
        </div>

        {/* Evidencias de Pago */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <Label>Evidencias de Pago</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon iconNode={Upload} className="mr-2 h-4 w-4" />
              Agregar Capturas
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
  );
}
