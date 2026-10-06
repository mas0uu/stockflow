<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('sku'))) {
            $this->merge(['sku' => strtoupper(trim($this->input('sku')))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $product = $this->route('product');
        $categoryRule = Rule::exists('categories', 'id');

        if (! $product instanceof Product || $this->integer('category_id') !== $product->category_id) {
            $categoryRule->where('is_active', true);
        }

        return [
            'category_id' => ['required', 'integer', $categoryRule],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product instanceof Product ? $product->id : null)],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cost_price' => ['required', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
