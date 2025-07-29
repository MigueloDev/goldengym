import Decimal from 'decimal.js';

interface Plan {
  price?: number;
  price_usd?: number;
  subscription_price_local?: number;
  subscription_price_usd?: number;
}



/**
 * Calcula el monto total del plan basado en la moneda de pago
 * @param plan - El plan seleccionado
 * @param paymentCurrency - La moneda de pago ('usd' o 'bs')
 * @returns El monto total como Decimal
 *
 * @example
 * // Para un plan en USD
 * const totalUSD = calculateTotalAmount(plan, 'usd');
 * console.log(totalUSD.toFixed(2)); // "150.00"
 *
 * // Para un plan en Bs
 * const totalBs = calculateTotalAmount(plan, 'bs');
 * console.log(totalBs.toFixed(2)); // "1050.00"
 */
export function calculateTotalAmount(plan: Plan | null, paymentCurrency: 'usd' | 'bs' | 'local'): Decimal {
  if (!plan) {
    return new Decimal(0);
  }

  try {
    if (paymentCurrency === 'usd') {
      // Para USD: precio del plan + precio de suscripción en USD
      const planPrice = new Decimal(plan.price_usd || 0);
      const subscriptionPrice = new Decimal(plan.subscription_price_usd || 0);
      return planPrice.plus(subscriptionPrice);
    } else {
      // Para Bs: precio del plan + precio de suscripción en Bs
      const planPrice = new Decimal(plan.price || 0);
      const subscriptionPrice = new Decimal(plan.subscription_price_local || 0);
      return planPrice.plus(subscriptionPrice);
    }
  } catch (error) {
    console.error('Error calculating total amount:', error);
    return new Decimal(0);
  }
}

/**
 * Formatea un monto como string con el símbolo de moneda
 * @param amount - El monto como Decimal
 * @param currency - La moneda ('usd' o 'bs')
 * @returns String formateado con el símbolo de moneda
 *
 * @example
 * const amount = new Decimal(150.50);
 * formatCurrency(amount, 'usd'); // "$150.50"
 * formatCurrency(amount, 'bs'); // "Bs. 150.50"
 */
export function formatCurrency(amount: Decimal, currency: 'usd' | 'bs'): string {
  try {
    const formattedAmount = amount.toFixed(2);

    if (currency === 'usd') {
      return `$${formattedAmount}`;
    } else {
      return `Bs. ${formattedAmount}`;
    }
  } catch (error) {
    console.error('Error formatting currency:', error);
    return currency === 'usd' ? '$0.00' : 'Bs. 0.00';
  }
}

/**
 * Convierte un monto de una moneda a otra usando una tasa de cambio
 * @param amount - El monto a convertir
 * @param fromCurrency - Moneda origen
 * @param toCurrency - Moneda destino
 * @param exchangeRate - Tasa de cambio (opcional, por defecto 1)
 * @returns El monto convertido como Decimal
 *
 * @example
 * const usdAmount = new Decimal(100);
 * const bsAmount = convertCurrency(usdAmount, 'usd', 'bs', 7.0);
 * console.log(bsAmount.toFixed(2)); // "700.00"
 */
export function convertCurrency(
  amount: Decimal,
  fromCurrency: 'usd' | 'bs',
  toCurrency: 'usd' | 'bs',
  exchangeRate: number = 1
): Decimal {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rate = new Decimal(exchangeRate);

    if (fromCurrency === 'usd' && toCurrency === 'bs') {
      return amount.times(rate);
    } else if (fromCurrency === 'bs' && toCurrency === 'usd') {
      return amount.dividedBy(rate);
    }

    return amount;
  } catch (error) {
    console.error('Error converting currency:', error);
    return new Decimal(0);
  }
}

/**
 * Calcula el monto total y lo devuelve formateado
 * @param plan - El plan seleccionado
 * @param paymentCurrency - La moneda de pago
 * @returns String formateado con el monto total
 *
 * @example
 * const formattedTotal = getFormattedTotalAmount(plan, 'usd');
 * console.log(formattedTotal); // "$150.00"
 */
export function getFormattedTotalAmount(plan: Plan | null, paymentCurrency: 'usd' | 'bs'): string {
  const totalAmount = calculateTotalAmount(plan, paymentCurrency);
  return formatCurrency(totalAmount, paymentCurrency);
}

/**
 * Valida si un monto es válido (mayor que 0)
 * @param amount - El monto a validar
 * @returns true si el monto es válido, false en caso contrario
 */
export function isValidAmount(amount: Decimal): boolean {
  return amount.greaterThan(0);
}

/**
 * Calcula el porcentaje de descuento entre dos montos
 * @param originalAmount - El monto original
 * @param discountedAmount - El monto con descuento
 * @returns El porcentaje de descuento como Decimal
 *
 * @example
 * const original = new Decimal(100);
 * const discounted = new Decimal(80);
 * const discount = calculateDiscountPercentage(original, discounted);
 * console.log(discount.toFixed(2)); // "20.00"
 */
export function calculateDiscountPercentage(originalAmount: Decimal, discountedAmount: Decimal): Decimal {
  if (originalAmount.equals(0)) {
    return new Decimal(0);
  }

  try {
    const difference = originalAmount.minus(discountedAmount);
    return difference.dividedBy(originalAmount).times(100);
  } catch (error) {
    console.error('Error calculating discount percentage:', error);
    return new Decimal(0);
  }
}
