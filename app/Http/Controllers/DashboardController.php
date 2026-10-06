<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $active = Product::where('is_active', true);
        $low = Product::where('is_active', true)->whereColumn('quantity', '<=', 'reorder_level');

        return Inertia::render('dashboard', [
            'stats' => [
                'products' => (clone $active)->count(),
                'categories' => Category::where('is_active', true)->count(),
                'units' => (int) Product::sum('quantity'),
                'lowStock' => (clone $low)->count(),
            ],
            'lowStock' => $low->with('category:id,name')->orderBy('quantity')->orderBy('name')->limit(5)->get(),
            'recentMovements' => StockMovement::with('product:id,name,sku')->orderByDesc('id')->limit(5)->get(),
        ]);
    }
}
