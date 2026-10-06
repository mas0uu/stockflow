<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = ['request_id', 'product_id', 'user_id', 'recorded_by', 'type', 'quantity_change', 'quantity_after', 'reason'];

    protected function casts(): array
    {
        return ['quantity_change' => 'integer', 'quantity_after' => 'integer'];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
