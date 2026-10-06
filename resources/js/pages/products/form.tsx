import { Form, Link } from '@inertiajs/react';
import {
    EmptyState,
    Field,
    InventoryPage,
    selectClass,
    textareaClass,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, Product } from '@/types/inventory';

export default function ProductForm({
    product,
    categories,
}: {
    product: Product | null;
    categories: Category[];
}) {
    return (
        <InventoryPage
            title={product ? 'Edit product' : 'Add product'}
            description="Set up the product details. Stock changes are recorded separately to preserve their history."
        >
            {!categories.length ? (
                <EmptyState
                    title="Create a category first"
                    description="Products need an active category. Add one to start building your catalog."
                    action={
                        <Button asChild>
                            <Link href="/categories/create">Add category</Link>
                        </Button>
                    }
                />
            ) : (
                <Form
                    action={product ? `/products/${product.id}` : '/products'}
                    method={product ? 'put' : 'post'}
                    className="max-w-3xl space-y-6 rounded-xl border bg-card p-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field
                                    id="name"
                                    label="Product name"
                                    error={errors.name}
                                >
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        maxLength={150}
                                        defaultValue={product?.name}
                                        autoFocus
                                        placeholder="e.g. A4 Copy Paper"
                                    />
                                </Field>
                                <Field
                                    id="sku"
                                    label="SKU"
                                    error={errors.sku}
                                    hint="A unique product code, saved in uppercase."
                                >
                                    <Input
                                        id="sku"
                                        name="sku"
                                        required
                                        maxLength={50}
                                        defaultValue={product?.sku}
                                        placeholder="e.g. PAPER-A4-001"
                                    />
                                </Field>
                                <Field
                                    id="category_id"
                                    label="Category"
                                    error={errors.category_id}
                                >
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        required
                                        defaultValue={
                                            product?.category_id ?? ''
                                        }
                                        className={selectClass}
                                    >
                                        <option value="" disabled>
                                            Select a category
                                        </option>
                                        {categories.map((category) => (
                                            <option
                                                value={category.id}
                                                key={category.id}
                                            >
                                                {category.name}
                                                {!category.is_active
                                                    ? ' (inactive)'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field
                                    id="is_active"
                                    label="Status"
                                    error={errors.is_active}
                                >
                                    <select
                                        id="is_active"
                                        name="is_active"
                                        defaultValue={
                                            product?.is_active === false
                                                ? '0'
                                                : '1'
                                        }
                                        className={selectClass}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </Field>
                                <Field
                                    id="cost_price"
                                    label="Cost price"
                                    error={errors.cost_price}
                                >
                                    <Input
                                        id="cost_price"
                                        name="cost_price"
                                        type="number"
                                        required
                                        min="0"
                                        max="9999999999.99"
                                        step="0.01"
                                        defaultValue={
                                            product?.cost_price ?? '0.00'
                                        }
                                    />
                                </Field>
                                <Field
                                    id="selling_price"
                                    label="Selling price"
                                    error={errors.selling_price}
                                >
                                    <Input
                                        id="selling_price"
                                        name="selling_price"
                                        type="number"
                                        required
                                        min="0"
                                        max="9999999999.99"
                                        step="0.01"
                                        defaultValue={
                                            product?.selling_price ?? '0.00'
                                        }
                                    />
                                </Field>
                                <Field
                                    id="reorder_level"
                                    label="Reorder level"
                                    error={errors.reorder_level}
                                    hint="An active product is low on stock when its balance reaches this number or below."
                                >
                                    <Input
                                        id="reorder_level"
                                        name="reorder_level"
                                        type="number"
                                        required
                                        min="0"
                                        max="2147483647"
                                        step="1"
                                        defaultValue={
                                            product?.reorder_level ?? 0
                                        }
                                    />
                                </Field>
                            </div>
                            <Field
                                id="description"
                                label="Description (optional)"
                                error={errors.description}
                            >
                                <textarea
                                    id="description"
                                    name="description"
                                    maxLength={5000}
                                    defaultValue={product?.description ?? ''}
                                    className={textareaClass}
                                />
                            </Field>
                            <p className="text-sm text-muted-foreground">
                                Use a single currency across your catalog.
                                Deactivating a product keeps its stock and
                                movement history, but prevents new stock
                                changes.
                            </p>
                            <div className="flex gap-3 border-t pt-6">
                                <Button disabled={processing}>
                                    {processing ? 'Saving…' : 'Save product'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link
                                        href={
                                            product
                                                ? `/products/${product.id}`
                                                : '/products'
                                        }
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            )}
        </InventoryPage>
    );
}
ProductForm.layout = {
    breadcrumbs: [
        { title: 'Products', href: '/products' },
        { title: 'Product details', href: '#' },
    ],
};
