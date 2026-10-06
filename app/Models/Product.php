<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'sku', 'name', 'description', 'cost_price', 'selling_price', 'reorder_level', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'quantity' => 'integer',
            'reorder_level' => 'integer',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<StockMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
