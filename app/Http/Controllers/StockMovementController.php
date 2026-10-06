<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockMovementRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'type' => ['nullable', Rule::in(['received', 'issued', 'adjustment'])],
        ]);
        $search = trim($request->string('search')->toString());

        return Inertia::render('movements/index', [
            'movements' => StockMovement::query()->with('product:id,name,sku')
                ->when($search !== '', fn ($query) => $query->whereHas('product', fn ($query) => $query
                    ->where(fn ($query) => $query->where('name', 'like', '%'.$search.'%')->orWhere('sku', 'like', '%'.$search.'%'))))
                ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
                ->orderByDesc('id')->paginate(20)->withQueryString(),
            'filters' => ['search' => $search, 'type' => $request->string('type')->toString()],
        ]);
    }

    public function create(Request $request): Response
    {
        $request->validate(['product_id' => ['nullable', 'integer', 'exists:products,id']]);

        return Inertia::render('movements/form', [
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'quantity']),
            'selectedProductId' => $request->string('product_id')->toString(),
            'requestId' => (string) Str::uuid(),
        ]);
    }

    public function store(StockMovementRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $product = Product::query()->lockForUpdate()->findOrFail($request->integer('product_id'));
            $change = $request->input('type') === 'issued' ? -$request->integer('quantity') : $request->integer('quantity');
            $existing = StockMovement::where('request_id', $request->string('request_id')->toString())->first();

            if ($existing) {
                if ($existing->user_id !== $request->user()->id || $existing->product_id !== $product->id || $existing->type !== $request->input('type') || $existing->quantity_change !== $change || $existing->reason !== $request->input('reason')) {
                    throw ValidationException::withMessages(['quantity' => 'This form was already submitted. Open a new movement form to record another change.']);
                }

                return;
            }

            if (! $product->is_active) {
                throw ValidationException::withMessages(['product_id' => 'Reactivate this product before recording stock.']);
            }

            $balance = $product->quantity + $change;

            if ($balance < 0 || $balance > 2147483647) {
                throw ValidationException::withMessages(['quantity' => $balance < 0 ? 'This change exceeds the available stock ('.$product->quantity.' units).' : 'The resulting stock balance is too large.']);
            }

            // The transaction keeps the balance and history together. The guarded
            // update also protects engines where row locks are unavailable.
            $updated = Product::whereKey($product->id)->where('quantity', $product->quantity)->where('is_active', true)->update(['quantity' => $balance]);

            if ($updated !== 1) {
                throw ValidationException::withMessages(['quantity' => 'Stock changed while you were editing. Reload and try again.']);
            }

            StockMovement::create([
                'request_id' => $request->string('request_id')->toString(),
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'recorded_by' => $request->user()->name,
                'type' => $request->input('type'),
                'quantity_change' => $change,
                'quantity_after' => $balance,
                'reason' => $request->input('reason'),
            ]);
        }, 5);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock movement recorded.']);

        return to_route('products.show', $request->integer('product_id'));
    }
}
