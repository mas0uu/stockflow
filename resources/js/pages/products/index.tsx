import { Form, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import {
    EmptyState,
    InventoryPage,
    InventoryTable,
    number,
    Pagination,
    price,
    selectClass,
    Status,
} from '@/components/inventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, Paginated, Product } from '@/types/inventory';

export default function Products({
    products,
    categories,
    filters,
}: {
    products: Paginated<Product>;
    categories: Pick<Category, 'id' | 'name'>[];
    filters: { search: string; status: string; category_id: string };
}) {
    const filtered = !!(
        filters.search ||
        filters.status ||
        filters.category_id
    );
    return (
        <InventoryPage
            title="Products"
            description="Your catalog, current stock, and reorder levels in one place."
            action={
                <Button asChild>
                    <Link href="/products/create">
                        <Plus />
                        Add product
                    </Link>
                </Button>
            }
        >
            <Form
                action="/products"
                method="get"
                className="flex flex-wrap items-center gap-2"
            >
                <Input
                    name="search"
                    aria-label="Search products"
                    defaultValue={filters.search}
                    placeholder="Search name or SKU…"
                    maxLength={150}
                    className="h-10 sm:max-w-xs"
                />
                <select
                    aria-label="Filter by category"
                    name="category_id"
                    defaultValue={filters.category_id}
                    className={`${selectClass} sm:w-48`}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option value={category.id} key={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="Filter by status"
                    name="status"
                    defaultValue={filters.status}
                    className={`${selectClass} sm:w-44`}
                >
                    <option value="">All products</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low">Low stock</option>
                </select>
                <Button variant="outline">
                    <Search />
                    Filter
                </Button>
                {filtered && (
                    <Button variant="ghost" asChild>
                        <Link href="/products">Clear</Link>
                    </Button>
                )}
            </Form>
            {products.data.length ? (
                <InventoryTable
                    headers={[
                        'Product',
                        'Category',
                        'Cost / Selling price',
                        'On hand',
                        'Reorder at',
                        'Status',
                        'Actions',
                    ]}
                >
                    {products.data.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/25">
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
                            <td className="whitespace-nowrap tabular-nums">
                                {price(product.cost_price)} /{' '}
                                {price(product.selling_price)}
                            </td>
                            <td>
                                <span className="font-semibold tabular-nums">
                                    {number(product.quantity)}
                                </span>
                                {product.is_active &&
                                    product.quantity <=
                                        product.reorder_level && (
                                        <Badge
                                            variant="outline"
                                            className="ml-2 border-amber-300 text-amber-700 dark:text-amber-400"
                                        >
                                            {product.quantity === 0
                                                ? 'Out of stock'
                                                : 'Low'}
                                        </Badge>
                                    )}
                            </td>
                            <td className="tabular-nums">
                                {number(product.reorder_level)}
                            </td>
                            <td>
                                <Status active={product.is_active} />
                            </td>
                            <td>
                                <Button size="sm" variant="ghost" asChild>
                                    <Link href={`/products/${product.id}`}>
                                        View
                                    </Link>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </InventoryTable>
            ) : (
                <EmptyState
                    title={
                        filtered
                            ? 'No matching products'
                            : 'Your catalog starts here'
                    }
                    description={
                        filtered
                            ? 'Try another search or clear your filters.'
                            : 'Add your first product, then record its opening stock.'
                    }
                    action={
                        !filtered && (
                            <Button asChild>
                                <Link href="/products/create">Add product</Link>
                            </Button>
                        )
                    }
                />
            )}
            <Pagination page={products} />
        </InventoryPage>
    );
}
Products.layout = { breadcrumbs: [{ title: 'Products', href: '/products' }] };
