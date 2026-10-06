export type Category = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count?: number;
};
export type Product = {
    id: number;
    category_id: number;
    category?: Pick<Category, 'id' | 'name'>;
    sku: string;
    name: string;
    description: string | null;
    cost_price: string;
    selling_price: string;
    reorder_level: number;
    quantity: number;
    is_active: boolean;
};
export type Movement = {
    id: number;
    product_id: number;
    product?: Pick<Product, 'id' | 'name' | 'sku'>;
    type: 'received' | 'issued' | 'adjustment';
    quantity_change: number;
    quantity_after: number;
    recorded_by: string;
    reason: string;
    created_at: string;
};
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};
