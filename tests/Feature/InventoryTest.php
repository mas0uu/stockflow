<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $overrides = []): Product
    {
        $category = Category::firstOrCreate(['name' => 'Office supplies'], ['is_active' => true]);

        return Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Copy paper',
            'sku' => 'PAPER-'.Str::upper(Str::random(8)),
            'cost_price' => '120.50',
            'selling_price' => '150.00',
            'reorder_level' => 5,
            'is_active' => true,
        ], $overrides))->refresh();
    }

    private function movement(Product $product, string $type, int $quantity, array $overrides = []): array
    {
        return array_merge([
            'request_id' => (string) Str::uuid(),
            'product_id' => $product->id,
            'type' => $type,
            'quantity' => $quantity,
            'reason' => 'Inventory test reference',
        ], $overrides);
    }

    public function test_inventory_pages_and_writes_require_verified_login(): void
    {
        $product = $this->product();
        $paths = ['/dashboard', '/categories', '/categories/create', '/categories/'.$product->category_id.'/edit', '/products', '/products/create', '/products/'.$product->id, '/products/'.$product->id.'/edit', '/movements', '/movements/create'];
        foreach ($paths as $path) {
            $this->get($path)->assertRedirect('/login');
        }
        foreach (['/categories', '/products', '/movements'] as $path) {
            $this->post($path, [])->assertRedirect('/login');
        }
        $this->put('/products/'.$product->id, [])->assertRedirect('/login');
        $this->put('/categories/'.$product->category_id, [])->assertRedirect('/login');

        $this->actingAs(User::factory()->unverified()->create());
        foreach ($paths as $path) {
            $this->get($path)->assertRedirect(route('verification.notice'));
        }
        $this->post('/movements', $this->movement($product, 'received', 10))->assertRedirect(route('verification.notice'));
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_verified_users_can_open_every_inventory_screen(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        foreach (['/categories', '/categories/create', '/categories/'.$product->category_id.'/edit', '/products', '/products/create', '/products/'.$product->id, '/products/'.$product->id.'/edit', '/movements', '/movements/create?product_id='.$product->id] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_categories_can_be_created_edited_and_deactivated(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/categories', ['name' => 'Paper', 'description' => 'Paper goods', 'is_active' => true])->assertSessionHasNoErrors()->assertRedirect('/categories');
        $category = Category::firstOrFail();
        $this->put('/categories/'.$category->id, ['name' => 'Paper', 'description' => null, 'is_active' => false])->assertSessionHasNoErrors();
        $this->assertFalse($category->refresh()->is_active);
        $this->post('/categories', ['name' => 'Paper', 'is_active' => true])->assertSessionHasErrors('name');
    }

    public function test_products_are_validated_and_stock_cannot_be_set_through_catalog_forms(): void
    {
        $this->actingAs(User::factory()->create());
        $category = Category::create(['name' => 'Paper', 'is_active' => true]);
        $data = ['category_id' => $category->id, 'sku' => ' paper-01 ', 'name' => 'Copy paper', 'cost_price' => '120.50', 'selling_price' => '150.00', 'reorder_level' => 5, 'is_active' => true, 'quantity' => 999];
        $this->post('/products', $data)->assertSessionHasNoErrors();
        $product = Product::firstOrFail();
        $this->assertSame('PAPER-01', $product->sku);
        $this->assertSame(0, $product->quantity);
        $this->post('/products', $data)->assertSessionHasErrors('sku');
        $this->put('/products/'.$product->id, array_merge($data, ['name' => 'Updated paper']))->assertSessionHasNoErrors();
        $this->assertSame('Updated paper', $product->refresh()->name);
        $this->assertSame(0, $product->quantity);
        $this->put('/products/'.$product->id, array_merge($data, ['cost_price' => '-1', 'selling_price' => '1.234', 'reorder_level' => -1]))->assertSessionHasErrors(['cost_price', 'selling_price', 'reorder_level']);
    }

    public function test_inactive_categories_cannot_be_assigned_to_new_products_but_existing_products_can_be_edited(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        $product->category->update(['is_active' => false]);
        $data = $product->only(['category_id', 'sku', 'name', 'cost_price', 'selling_price', 'reorder_level', 'is_active']);
        $this->post('/products', array_merge($data, ['sku' => 'NEW-SKU']))->assertSessionHasErrors('category_id');
        $this->put('/products/'.$product->id, $data)->assertSessionHasNoErrors();
    }

    public function test_receipts_issues_and_adjustments_preserve_balances_and_history(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $product = $this->product();
        foreach ([['received', 20, 20], ['issued', 5, 15], ['adjustment', -2, 13], ['adjustment', 3, 16]] as [$type, $quantity, $balance]) {
            $this->post('/movements', $this->movement($product, $type, $quantity))->assertSessionHasNoErrors()->assertRedirect('/products/'.$product->id);
            $this->assertSame($balance, $product->refresh()->quantity);
            $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'type' => $type, 'quantity_change' => $type === 'issued' ? -$quantity : $quantity, 'quantity_after' => $balance, 'user_id' => $user->id, 'recorded_by' => $user->name]);
        }
        $this->assertDatabaseCount('stock_movements', 4);
        $this->assertSame(16, (int) $product->movements()->sum('quantity_change'));
    }

    public function test_insufficient_stock_is_rejected_without_creating_history(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        $this->post('/movements', $this->movement($product, 'received', 4))->assertSessionHasNoErrors();
        foreach ([['issued', 5], ['adjustment', -5]] as [$type, $quantity]) {
            $this->post('/movements', $this->movement($product, $type, $quantity))->assertSessionHasErrors('quantity');
        }
        $this->assertSame(4, $product->refresh()->quantity);
        $this->assertDatabaseCount('stock_movements', 1);
        $this->post('/movements', $this->movement($product, 'issued', 4))->assertSessionHasNoErrors();
        $this->assertSame(0, $product->refresh()->quantity);
    }

    public function test_stock_validation_rejects_zero_fractional_negative_receipts_missing_reasons_and_overflow(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        foreach ([0, -1, '1.5', 2147483648] as $quantity) {
            $this->post('/movements', $this->movement($product, 'received', 1, ['quantity' => $quantity]))->assertSessionHasErrors('quantity');
        }
        $this->post('/movements', $this->movement($product, 'received', 1, ['reason' => '  ']))->assertSessionHasErrors('reason');
        $this->assertDatabaseCount('stock_movements', 0);
        $this->post('/movements', $this->movement($product, 'received', 2147483647))->assertSessionHasNoErrors();
        $this->post('/movements', $this->movement($product, 'received', 1))->assertSessionHasErrors('quantity');
        $this->assertSame(2147483647, $product->refresh()->quantity);
        $this->assertDatabaseCount('stock_movements', 1);
    }

    public function test_duplicate_submission_does_not_change_stock_twice(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        $data = $this->movement($product, 'received', 10);
        $this->post('/movements', $data)->assertSessionHasNoErrors();
        $this->post('/movements', $data)->assertSessionHasNoErrors();
        $this->post('/movements', array_merge($data, ['quantity' => 3]))->assertSessionHasErrors('quantity');
        $this->assertSame(10, $product->refresh()->quantity);
        $this->assertDatabaseCount('stock_movements', 1);
    }

    public function test_inactive_products_keep_history_but_cannot_record_new_movements(): void
    {
        $this->actingAs(User::factory()->create());
        $product = $this->product();
        $this->post('/movements', $this->movement($product, 'received', 10))->assertSessionHasNoErrors();
        $product->update(['is_active' => false]);
        $this->post('/movements', $this->movement($product, 'issued', 1))->assertSessionHasErrors('product_id');
        $this->assertSame(10, $product->refresh()->quantity);
        $this->get('/products/'.$product->id)->assertInertia(fn (Assert $page) => $page->component('products/show')->has('movements.data', 1));
    }

    public function test_user_deletion_preserves_the_recorded_name_and_stock_history(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $product = $this->product();
        $this->post('/movements', $this->movement($product, 'received', 10))->assertSessionHasNoErrors();
        $user->delete();
        $this->assertDatabaseHas('stock_movements', ['user_id' => null, 'recorded_by' => $user->name, 'quantity_after' => 10]);
        $this->assertSame(10, $product->refresh()->quantity);
    }

    public function test_low_stock_dashboard_and_filters_use_actual_balances(): void
    {
        $this->actingAs(User::factory()->create());
        $low = $this->product(['name' => 'Low paper', 'sku' => 'LOW']);
        $healthy = $this->product(['name' => 'Healthy paper', 'sku' => 'HEALTHY']);
        $inactive = $this->product(['name' => 'Inactive paper', 'is_active' => false]);
        $this->post('/movements', $this->movement($low, 'received', 5))->assertSessionHasNoErrors();
        $this->post('/movements', $this->movement($healthy, 'received', 20))->assertSessionHasNoErrors();
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page->component('dashboard')->where('stats.products', 2)->where('stats.units', 25)->where('stats.lowStock', 1)->has('lowStock', 1)->where('lowStock.0.id', $low->id)->has('recentMovements', 2));
        $this->get('/products?status=low')->assertInertia(fn (Assert $page) => $page->has('products.data', 1)->where('products.data.0.id', $low->id));
        $this->get('/products?status=inactive')->assertInertia(fn (Assert $page) => $page->has('products.data', 1)->where('products.data.0.id', $inactive->id));
        $this->get('/products?search=HEALTHY&category_id='.$healthy->category_id)->assertInertia(fn (Assert $page) => $page->has('products.data', 1)->where('products.data.0.id', $healthy->id));
        $this->get('/movements?search=LOW&type=received')->assertInertia(fn (Assert $page) => $page->has('movements.data', 1)->where('movements.data.0.product_id', $low->id));
    }

    public function test_catalog_lists_are_paginated_and_history_is_not_editable(): void
    {
        $this->actingAs(User::factory()->create());
        for ($i = 0; $i < 17; $i++) {
            $this->product(['name' => sprintf('Product %02d', $i)]);
        }
        $this->get('/products?search=Product')->assertInertia(fn (Assert $page) => $page->has('products.data', 15)->where('products.total', 17));
        $this->get('/products?search=Product&page=2')->assertInertia(fn (Assert $page) => $page->has('products.data', 2)->where('filters.search', 'Product'));
        $product = Product::firstOrFail();
        $this->post('/movements', $this->movement($product, 'received', 2))->assertSessionHasNoErrors();
        $movement = StockMovement::firstOrFail();
        $this->put('/movements/'.$movement->id, ['quantity' => 99])->assertNotFound();
        $this->delete('/movements/'.$movement->id)->assertNotFound();
        $this->delete('/products/'.$product->id)->assertStatus(405);
        $this->assertDatabaseCount('stock_movements', 1);
    }
}
