import React from 'react';
import { calculateTotalAmount, formatCurrency, getFormattedTotalAmount } from '@/helpers/currency-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: number;
  name: string;
  price?: number;
  price_usd?: number;
  subscription_price_local?: number;
  subscription_price_usd?: number;
}

interface CurrencyDisplayProps {
  plan: Plan;
  paymentCurrency: 'usd' | 'bs';
  exchangeRate?: number;
}

export function CurrencyDisplay({ plan, paymentCurrency, exchangeRate }: CurrencyDisplayProps) {
  // Calcular el monto total usando Decimal.js
  const totalAmount = calculateTotalAmount(plan, paymentCurrency);

  // Obtener el monto formateado directamente
  const formattedTotal = getFormattedTotalAmount(plan, paymentCurrency);

  // Calcular el monto en la otra moneda si hay tasa de cambio
  const otherCurrency = paymentCurrency === 'usd' ? 'bs' : 'usd';
  const convertedAmount = exchangeRate ?
    formatCurrency(totalAmount.times(exchangeRate), otherCurrency) :
    null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          <Badge variant={paymentCurrency === 'usd' ? 'default' : 'secondary'}>
            {paymentCurrency.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Precio del Plan</p>
            <p className="text-lg font-semibold">
              {paymentCurrency === 'usd'
                ? `$${plan.price_usd?.toFixed(2) || '0.00'}`
                : `Bs. ${plan.price?.toFixed(2) || '0.00'}`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Suscripción</p>
            <p className="text-lg font-semibold">
              {paymentCurrency === 'usd'
                ? `$${plan.subscription_price_usd?.toFixed(2) || '0.00'}`
                : `Bs. ${plan.subscription_price_local?.toFixed(2) || '0.00'}`
              }
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Total</p>
            <p className="text-2xl font-bold text-primary">
              {formattedTotal}
            </p>
          </div>

          {convertedAmount && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">Equivalente en {otherCurrency.toUpperCase()}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {convertedAmount}
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Cálculo preciso usando Decimal.js</p>
          <p>• Sin errores de precisión flotante</p>
          <p>• Formato automático de moneda</p>
        </div>
      </CardContent>
    </Card>
  );
}
