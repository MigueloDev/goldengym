<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PathologyController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentTemplateController;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas para clientes
    Route::get('clients/search', [ClientController::class, 'search'])->name('clients.search');
    Route::resource('clients', ClientController::class);
    Route::post('clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::post('clients/{id}/restore', [ClientController::class, 'restore'])->name('clients.restore');
    Route::delete('clients/{id}/force-delete', [ClientController::class, 'forceDelete'])->name('clients.force-delete');
    Route::delete('clients/{client}/profile-photo', [ClientController::class, 'removeProfilePhoto'])->name('clients.remove-profile-photo');

    // Rutas para patologías
    Route::resource('pathologies', PathologyController::class);

    // Rutas para planes
    Route::resource('plans', PlanController::class);

    // Rutas para pagos
    Route::resource('payments', PaymentController::class);
    Route::post('payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');
    Route::delete('payments/{payment}/evidences/{evidence}', [PaymentController::class, 'removePaymentEvidence'])
        ->name('payments.remove-evidence');
    Route::post('payments/{payment}/evidences', [PaymentController::class, 'addPaymentEvidences'])
        ->name('payments.add-evidences');

    // Rutas para membresías
    Route::get('memberships/quick-register', [MembershipController::class, 'quickRegister'])
        ->name('memberships.quick-register');
    Route::post('memberships/quick-register', [MembershipController::class, 'storeQuickRegister'])
        ->name('memberships.store-quick-register');
    Route::get('memberships/{membership}/quick-renew', [MembershipController::class, 'quickRenew'])
        ->name('memberships.quick-renew');
    Route::post('memberships/{membership}/quick-renew', [MembershipController::class, 'storeQuickRenew'])
        ->name('memberships.store-quick-renew');
    Route::resource('memberships', MembershipController::class);

    // Rutas para plantillas de documentos
    Route::resource('document-templates', DocumentTemplateController::class);
    Route::post('document-templates/generate', [DocumentTemplateController::class, 'generateDocument'])
        ->name('document-templates.generate');
    Route::get('document-templates/templates-for-client', [DocumentTemplateController::class, 'getTemplatesForClient'])
        ->name('document-templates.templates-for-client');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
