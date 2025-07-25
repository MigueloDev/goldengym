<?php

namespace App\Helpers;

use App\Models\Payment;
use App\Models\Membership;
use App\Models\MembershipRenewal;

class PaymentHelper
{
    /**
     * Crear un pago para una membresía nueva
     */
    public static function createMembershipPayment(Membership $membership, array $paymentData)
    {
        return Payment::create([
            'payable_id' => $membership->id,
            'payable_type' => Membership::class,
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'],
            'exchange_rate' => $paymentData['exchange_rate'] ?? 1,
            'selected_price' => $paymentData['selected_price'],
            'selected_currency' => $paymentData['selected_currency'],
            'payment_date' => $paymentData['payment_date'],
            'payment_method' => $paymentData['payment_method'],
            'reference' => $paymentData['reference'] ?? null,
            'notes' => $paymentData['notes'] ?? null,
            'registered_by' => auth()->id(),
        ]);
    }

    /**
     * Crear un pago para una renovación de membresía
     */
    public static function createRenewalPayment(MembershipRenewal $renewal, array $paymentData)
    {
        return Payment::create([
            'payable_id' => $renewal->id,
            'payable_type' => MembershipRenewal::class,
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'],
            'exchange_rate' => $paymentData['exchange_rate'] ?? 1,
            'selected_price' => $paymentData['selected_price'],
            'selected_currency' => $paymentData['selected_currency'],
            'payment_date' => $paymentData['payment_date'],
            'payment_method' => $paymentData['payment_method'],
            'reference' => $paymentData['reference'] ?? null,
            'notes' => $paymentData['notes'] ?? null,
            'registered_by' => auth()->id(),
        ]);
    }

    /**
     * Obtener estadísticas de pagos por tipo
     */
    public static function getPaymentStats($startDate = null, $endDate = null)
    {
        $query = Payment::query();

        if ($startDate && $endDate) {
            $query->whereBetween('payment_date', [$startDate, $endDate]);
        }

        $stats = [
            'total_payments' => $query->count(),
            'total_amount_usd' => $query->where('currency', 'usd')->sum('amount'),
            'total_amount_local' => $query->where('currency', 'local')->sum('amount'),
            'membership_payments' => $query->where('payable_type', Membership::class)->count(),
            'renewal_payments' => $query->where('payable_type', MembershipRenewal::class)->count(),
            'membership_amount_usd' => $query->where('payable_type', Membership::class)
                ->where('currency', 'usd')->sum('amount'),
            'membership_amount_local' => $query->where('payable_type', Membership::class)
                ->where('currency', 'local')->sum('amount'),
            'renewal_amount_usd' => $query->where('payable_type', MembershipRenewal::class)
                ->where('currency', 'usd')->sum('amount'),
            'renewal_amount_local' => $query->where('payable_type', MembershipRenewal::class)
                ->where('currency', 'local')->sum('amount'),
        ];

        return $stats;
    }

    /**
     * Obtener pagos por tipo con relaciones
     */
    public static function getPaymentsByType($type = null, $limit = 15)
    {
        $query = Payment::with(['payable', 'registeredBy', 'paymentEvidences']);

        if ($type === 'membership') {
            $query->where('payable_type', Membership::class);
        } elseif ($type === 'renewal') {
            $query->where('payable_type', MembershipRenewal::class);
        }

        return $query->orderBy('payment_date', 'desc')->paginate($limit);
    }
}
