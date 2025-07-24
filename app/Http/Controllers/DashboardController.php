<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics and recent data.
     */
    public function index()
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'total_clients' => Client::count(),
                'active_memberships' => Membership::active()->count(),
                'expiring_soon' => Membership::expiringSoon()->count(),
                'monthly_revenue' => floatval(Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->sum('amount')),
            ],
            'expiring_memberships' => Membership::with(['client', 'plan'])
                ->expiringSoon()
                ->orderBy('end_date')
                ->limit(10)
                ->get(),
            'recent_payments' => Payment::with(['membership.client'])
                ->orderBy('payment_date', 'desc')
                ->limit(5)
                ->get(),
            'quick_actions' => [
                'register_membership' => route('memberships.quick-register'),
                /* 'renew_membership' => route('memberships.quick-renew'), */
                'new_client' => route('clients.create'),
                'new_plan' => route('plans.create'),
            ]
        ]);
    }
}
