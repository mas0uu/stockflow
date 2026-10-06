<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'low'])],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);
        $search = trim($request->string('search')->toString());
        $status = $request->string('status')->toString();

        return Inertia::render('products/index', [
            'products' => Product::query()->with('category:id,name')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', '%'.$search.'%')->orWhere('sku', 'like', '%'.$search.'%')))
                ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->integer('category_id')))
                ->when($status === 'active' || $status === 'low', fn ($query) => $query->where('is_active', true))
                ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
                ->when($status === 'low', fn ($query) => $query->whereColumn('quantity', '<=', 'reorder_level'))
                ->orderBy('name')->paginate(15)->withQueryString(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search, 'status' => $status, 'category_id' => $request->string('category_id')->toString()],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/form', [
            'product' => null,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'is_active']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created. Record a stock receipt to add its opening balance.']);

        return to_route('products.show', $product);
    }

    public function show(Product $product): Response
    {
        return Inertia::render('products/show', [
            'product' => $product->load('category:id,name'),
            'movements' => $product->movements()->orderByDesc('id')->paginate(15),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('products/form', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->orWhere('id', $product->category_id)->orderBy('name')->get(['id', 'name', 'is_active']),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return to_route('products.show', $product);
    }
}
