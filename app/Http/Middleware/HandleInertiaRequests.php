<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Str;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $flash = collect($request->session()->all())
        ->filter(fn ($_, $key) => Str::startsWith($key, 'flash_'))
        ->mapWithKeys(fn ($value, $key) => [Str::after($key, 'flash_') => $value]);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => fn () => $flash->all(),
            'locale' => fn () => app()->getLocale(),
            'translations' => fn () => [
                'Dashboard' => __('Dashboard'),
                'Clients' => __('Clients'),
                'Memberships' => __('Memberships'),
                'Payments' => __('Payments'),
                'Plans' => __('Plans'),
                'Settings' => __('Settings'),
                'Profile' => __('Profile'),
                'Logout' => __('Logout'),
                'Create' => __('Create'),
                'Edit' => __('Edit'),
                'Delete' => __('Delete'),
                'Save' => __('Save'),
                'Cancel' => __('Cancel'),
                'Back' => __('Back'),
                'Search' => __('Search'),
                'Name' => __('Name'),
                'Email' => __('Email'),
                'Phone' => __('Phone'),
                'Status' => __('Status'),
                'Active' => __('Active'),
                'Inactive' => __('Inactive'),
                'Date' => __('Date'),
                'Amount' => __('Amount'),
                'Type' => __('Type'),
                'Description' => __('Description'),
                'Price' => __('Price'),
                'Duration' => __('Duration'),
                'Start Date' => __('Start Date'),
                'End Date' => __('End Date'),
                'Total' => __('Total'),
                'Actions' => __('Actions'),
                'No records found' => __('No records found'),
                'Loading...' => __('Loading...'),
                'Success' => __('Success'),
                'Error' => __('Error'),
                'Warning' => __('Warning'),
                'Info' => __('Info'),
                'Are you sure?' => __('Are you sure?'),
                'This action cannot be undone.' => __('This action cannot be undone.'),
                'View' => __('View'),
                'New' => __('New'),
                'Client' => __('Client'),
                'Membership' => __('Membership'),
                'Payment' => __('Payment'),
                'Plan' => __('Plan'),
                'Recent' => __('Recent'),
                'Expiring' => __('Expiring'),
                'Revenue' => __('Revenue'),
                'Monthly' => __('Monthly'),
                'Quick Actions' => __('Quick Actions'),
                'Register Membership' => __('Register Membership'),
                'Renew Membership' => __('Renew Membership'),
                'New Plan' => __('New Plan'),
                'Statistics' => __('Statistics'),
                'Total Clients' => __('Total Clients'),
                'Active Memberships' => __('Active Memberships'),
                'Expiring Soon' => __('Expiring Soon'),
                'Monthly Revenue' => __('Monthly Revenue'),
            ]
        ];
    }
}
