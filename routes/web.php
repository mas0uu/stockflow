<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockMovementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('categories', CategoryController::class)->except(['show', 'destroy']);
    Route::resource('products', ProductController::class)->except('destroy');
    Route::resource('movements', StockMovementController::class)->only(['index', 'create', 'store']);
});

require __DIR__.'/settings.php';
