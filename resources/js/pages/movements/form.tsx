import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    EmptyState,
    Field,
    InventoryPage,
    number,
    selectClass,
    textareaClass,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Movement, Product } from '@/types/inventory';

type StockProduct = Pick<Product, 'id' | 'name' | 'sku' | 'quantity'>;

export default function MovementForm({
    products,
    selectedProductId,
    requestId,
}: {
    products: StockProduct[];
    selectedProductId: string;
    requestId: string;
}) {
    const form = useForm({
        request_id: requestId,
        product_id: products.some(
            (product) => String(product.id) === selectedProductId,
        )
            ? selectedProductId
            : '',
        type: 'received' as Movement['type'],
        quantity: '',
        reason: '',
    });
    const product = products.find(
        (item) => String(item.id) === form.data.product_id,
    );
    const quantity = Number(form.data.quantity);
    const change = form.data.type === 'issued' ? -quantity : quantity;
    const balance = product ? product.quantity + change : 0;
    const validQuantity =
        form.data.quantity !== '' &&
        Number.isInteger(quantity) &&
        quantity !== 0 &&
        (form.data.type === 'adjustment' || quantity > 0);

    return (
        <InventoryPage
            title="Record stock"
            description="Keep quantities accurate with a recorded reason for every change."
        >
            {!products.length ? (
                <EmptyState
                    title="Add an active product first"
                    description="Create a product, or reactivate an existing one, to record a stock movement."
                    action={
                        <Button asChild>
                            <Link href="/products">Go to products</Link>
                        </Button>
                    }
                />
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/movements');
                        }}
                        className="space-y-6 rounded-xl border bg-card p-6"
                    >
                        <Field
                            id="product_id"
                            label="Product"
                            error={form.errors.product_id}
                        >
                            <select
                                id="product_id"
                                required
                                className={selectClass}
                                value={form.data.product_id}
                                onChange={(event) =>
                                    form.setData(
                                        'product_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="" disabled>
                                    Select a product
                                </option>
                                {products.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} — {item.sku}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            id="type"
                            label="Movement type"
                            error={form.errors.type}
                        >
                            <select
                                id="type"
                                className={selectClass}
                                value={form.data.type}
                                onChange={(event) => {
                                    form.setData(
                                        'type',
                                        event.target.value as Movement['type'],
                                    );
                                    form.setData('quantity', '');
                                }}
                            >
                                <option value="received">
                                    Received — add incoming stock
                                </option>
                                <option value="issued">
                                    Issued — remove outgoing stock
                                </option>
                                <option value="adjustment">
                                    Adjustment — correct the balance
                                </option>
                            </select>
                        </Field>
                        <Field
                            id="quantity"
                            label={
                                form.data.type === 'adjustment'
                                    ? 'Quantity change (+ or −)'
                                    : 'Quantity'
                            }
                            error={form.errors.quantity}
                            hint={
                                form.data.type === 'adjustment'
                                    ? 'Enter the difference, not the final balance. For example, −2 removes two units; 3 adds three.'
                                    : 'Enter a positive whole number of units.'
                            }
                        >
                            <Input
                                id="quantity"
                                type="number"
                                required
                                step="1"
                                min={
                                    form.data.type === 'adjustment'
                                        ? -2147483647
                                        : 1
                                }
                                max="2147483647"
                                value={form.data.quantity}
                                onChange={(event) =>
                                    form.setData('quantity', event.target.value)
                                }
                            />
                        </Field>
                        <Field
                            id="reason"
                            label="Reason / reference"
                            error={form.errors.reason}
                        >
                            <textarea
                                id="reason"
                                required
                                maxLength={500}
                                className={textareaClass}
                                value={form.data.reason}
                                onChange={(event) =>
                                    form.setData('reason', event.target.value)
                                }
                                placeholder="e.g. Opening balance, delivery #104, or damaged during handling"
                            />
                        </Field>
                        <InputError message={form.errors.request_id} />
                        <div className="flex gap-3 border-t pt-6">
                            <Button disabled={form.processing}>
                                {form.processing
                                    ? 'Recording…'
                                    : 'Record movement'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link
                                    href={
                                        product
                                            ? `/products/${product.id}`
                                            : '/movements'
                                    }
                                >
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                    <aside className="space-y-5 rounded-xl border bg-muted/30 p-6">
                        <h2 className="font-semibold">Balance preview</h2>
                        {product ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {product.name}
                                </p>
                                <div
                                    className="flex items-center justify-between gap-3"
                                    aria-live="polite"
                                >
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            On hand
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                                            {number(product.quantity)}
                                        </p>
                                    </div>
                                    <ArrowRight className="size-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            After change
                                        </p>
                                        <p
                                            className={`mt-1 text-2xl font-semibold tabular-nums ${balance < 0 ? 'text-destructive' : ''}`}
                                        >
                                            {validQuantity
                                                ? number(balance)
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                {validQuantity && balance < 0 && (
                                    <p className="text-sm text-destructive">
                                        There is not enough stock for this
                                        change.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose a product to preview its balance.
                            </p>
                        )}
                        <p className="border-t pt-4 text-sm text-muted-foreground">
                            Movements become part of the stock history. To
                            correct a mistake, record an adjustment with a
                            reason. Available stock is checked again when you
                            save.
                        </p>
                    </aside>
                </div>
            )}
        </InventoryPage>
    );
}
MovementForm.layout = {
    breadcrumbs: [
        { title: 'Stock movements', href: '/movements' },
        { title: 'Record stock', href: '/movements/create' },
    ],
};
