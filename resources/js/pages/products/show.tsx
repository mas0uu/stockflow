import { Link } from '@inertiajs/react';
import { ArrowLeftRight, Pencil } from 'lucide-react';
import {
    EmptyState,
    InventoryPage,
    MovementTable,
    number,
    Pagination,
    price,
    Status,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import type { Movement, Paginated, Product } from '@/types/inventory';

export default function ProductDetails({
    product,
    movements,
}: {
    product: Product;
    movements: Paginated<Movement>;
}) {
    const low = product.is_active && product.quantity <= product.reorder_level;
    return (
        <InventoryPage
            title={product.name}
            description={`${product.sku} · ${product.category?.name ?? ''}`}
            action={
                <>
                    <Button variant="outline" asChild>
                        <Link href={`/products/${product.id}/edit`}>
                            <Pencil />
                            Edit product
                        </Link>
                    </Button>
                    {product.is_active && (
                        <Button asChild>
                            <Link
                                href={`/movements/create?product_id=${product.id}`}
                            >
                                <ArrowLeftRight />
                                Record stock
                            </Link>
                        </Button>
                    )}
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ['On hand', number(product.quantity)],
                    ['Reorder level', number(product.reorder_level)],
                    ['Cost price', price(product.cost_price)],
                    ['Selling price', price(product.selling_price)],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-3 text-3xl font-semibold tabular-nums">
                            {value}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Status active={product.is_active} />
                {low && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        {product.quantity === 0
                            ? 'Out of stock. Record a receipt when new stock arrives.'
                            : 'Stock is at or below the reorder level.'}
                    </p>
                )}
                {!product.is_active && (
                    <p className="text-sm text-muted-foreground">
                        Reactivate this product to record stock changes.
                    </p>
                )}
            </div>
            {product.description && (
                <p className="max-w-3xl text-sm whitespace-pre-wrap text-muted-foreground">
                    {product.description}
                </p>
            )}
            <div>
                <h2 className="text-xl font-semibold">Stock history</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Every receipt, issue, and correction for this product.
                </p>
            </div>
            {movements.data.length ? (
                <MovementTable movements={movements.data} showProduct={false} />
            ) : (
                <EmptyState
                    title="No stock movements yet"
                    description="Record a receipt to enter the opening balance. Every future change will appear here."
                />
            )}
            <Pagination page={movements} />
        </InventoryPage>
    );
}
ProductDetails.layout = {
    breadcrumbs: [
        { title: 'Products', href: '/products' },
        { title: 'Product overview', href: '#' },
    ],
};
