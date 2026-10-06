<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockMovementRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'request_id' => ['required', 'uuid'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'type' => ['required', Rule::in(['received', 'issued', 'adjustment'])],
            'quantity' => ['required', 'integer', 'not_in:0', $this->input('type') === 'adjustment' ? 'min:-2147483647' : 'min:1', 'max:2147483647'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
