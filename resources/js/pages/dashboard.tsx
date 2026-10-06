import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    ArrowUpRight,
    Boxes,
    Layers,
    Package,
    Plus,
} from 'lucide-react';
import {
    EmptyState,
    InventoryPage,
    InventoryTable,
    MovementTable,
    number,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import type { Movement, Product } from '@/types/inventory';

export default function Dashboard({
    stats,
    lowStock,
    recentMovements,
}: {
    stats: {
        products: number;
        categories: number;
        units: number;
        lowStock: number;
    };
    lowStock: Product[];
    recentMovements: Movement[];
}) {
    const cards = [
        {
            label: 'Active products',
            value: stats.products,
            icon: Package,
            href: '/products?status=active',
            caption: 'In your catalog',
        },
        {
            label: 'Units on hand',
            value: stats.units,
            icon: Boxes,
            href: '/products',
            caption: 'Across all products, including inactive',
        },
        {
            label: 'Low-stock products',
            value: stats.lowStock,
            icon: AlertTriangle,
            href: '/products?status=low',
            caption: 'At or below reorder level',
        },
        {
            label: 'Active categories',
            value: stats.categories,
            icon: Layers,
            href: '/categories',
            caption: 'Keeping products organized',
        },
    ];
    return (
        <InventoryPage
            title="Overview"
            description="A clear view of your stock, ready for the day ahead."
            action={
                <>
                    <Button variant="outline" asChild>
                        <Link href="/products/create">
                            <Plus />
                            Add product
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/movements/create">
                            <ArrowLeftRight />
                            Record stock
                        </Link>
                    </Button>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                {card.label}
                            </p>
                            <card.icon
                                className={`size-5 ${card.label === 'Low-stock products' && stats.lowStock ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}
                            />
                        </div>
                        <p className="mt-5 text-4xl font-semibold tracking-tight tabular-nums">
                            {number(card.value)}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>{card.caption}</span>
                            <ArrowUpRight className="size-4 shrink-0" />
                        </div>
                    </Link>
                ))}
            </div>
            {!stats.products && !recentMovements.length && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <h2 className="text-lg font-semibold">
                        Welcome to Stockflow
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Start with a category, add your products, then record
                        the stock you already have. Your inventory overview will
                        update as you go.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href="/categories/create">
                                1. Add a category
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/products/create">
                                2. Add a product
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/movements/create">
                                3. Record opening stock
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Needs attention
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Active products running low on stock.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/products?status=low">
                            View all
                            <ArrowUpRight />
                        </Link>
                    </Button>
                </div>
                {lowStock.length ? (
                    <InventoryTable
                        headers={[
                            'Product',
                            'Category',
                            'On hand',
                            'Reorder level',
                            'Next step',
                        ]}
                    >
                        {lowStock.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {product.name}
                                    </Link>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {product.sku}
                                    </p>
                                </td>
                                <td>{product.category?.name}</td>
                                <td className="font-semibold text-amber-700 tabular-nums dark:text-amber-400">
                                    {number(product.quantity)}
                                </td>
                                <td>{number(product.reorder_level)}</td>
                                <td>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={`/movements/create?product_id=${product.id}`}
                                        >
                                            Record stock
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </InventoryTable>
                ) : (
                    <EmptyState
                        title={
                            stats.products
                                ? 'Stock levels look good'
                                : 'No stock alerts yet'
                        }
                        description={
                            stats.products
                                ? 'All active products are above their reorder levels.'
                                : 'Low-stock products will appear here once you add them.'
                        }
                    />
                )}
            </section>
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Recent activity
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            The latest changes to your inventory.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/movements">
                            View history
                            <ArrowUpRight />
                        </Link>
                    </Button>
                </div>
                {recentMovements.length ? (
                    <MovementTable movements={recentMovements} />
                ) : (
                    <EmptyState
                        title="Your history starts with the first receipt"
                        description="Stock movements will show what changed, why, and who recorded it."
                    />
                )}
            </section>
        </InventoryPage>
    );
}
Dashboard.layout = { breadcrumbs: [{ title: 'Overview', href: '/dashboard' }] };
