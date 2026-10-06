import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Movement, Paginated } from '@/types/inventory';

export const selectClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const textareaClass =
    'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const number = (value: number) =>
    new Intl.NumberFormat('en-US').format(value);
export const price = (value: string) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));

export function InventoryPage({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-4 md:p-8">
            <Head title={title} />
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-400">
                        Stockflow / Inventory
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                {action && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {action}
                    </div>
                )}
            </header>
            {children}
        </div>
    );
}
export function Field({
    id,
    label,
    error,
    children,
    hint,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}
export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <div className="rounded-full bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <PackageOpen className="size-7" />
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="max-w-md text-sm text-muted-foreground">
                {description}
            </p>
            {action}
        </div>
    );
}
export function InventoryTable({
    headers,
    children,
}: {
    headers: string[];
    children: ReactNode;
}) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                scope="col"
                                className="px-5 py-3 font-medium whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y [&_td]:px-5 [&_td]:py-4">
                    {children}
                </tbody>
            </table>
        </div>
    );
}
export function Pagination({
    page,
}: {
    page: Omit<Paginated<unknown>, 'data'>;
}) {
    return (
        <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
        >
            <p>
                {page.total
                    ? `${page.from}–${page.to} of ${number(page.total)}`
                    : '0 results'}
            </p>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    asChild={!!page.prev_page_url}
                    disabled={!page.prev_page_url}
                >
                    {page.prev_page_url ? (
                        <Link href={page.prev_page_url}>
                            <ArrowLeft />
                            Previous
                        </Link>
                    ) : (
                        <span>Previous</span>
                    )}
                </Button>
                <span>
                    Page {page.current_page} of {page.last_page}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    asChild={!!page.next_page_url}
                    disabled={!page.next_page_url}
                >
                    {page.next_page_url ? (
                        <Link href={page.next_page_url}>
                            Next
                            <ArrowRight />
                        </Link>
                    ) : (
                        <span>Next</span>
                    )}
                </Button>
            </div>
        </nav>
    );
}
export function Status({ active }: { active: boolean }) {
    return (
        <Badge
            variant="outline"
            className={
                active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-muted-foreground'
            }
        >
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
export function MovementTable({
    movements,
    showProduct = true,
}: {
    movements: Movement[];
    showProduct?: boolean;
}) {
    return (
        <InventoryTable
            headers={[
                'Recorded',
                ...(showProduct ? ['Product'] : []),
                'Type',
                'Change',
                'Balance after',
                'Reason',
                'Recorded by',
            ]}
        >
            {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-muted/25">
                    <td className="whitespace-nowrap">
                        <time dateTime={movement.created_at}>
                            {new Date(movement.created_at).toLocaleString(
                                undefined,
                                { dateStyle: 'medium', timeStyle: 'short' },
                            )}
                        </time>
                    </td>
                    {showProduct && (
                        <td>
                            <Link
                                href={`/products/${movement.product_id}`}
                                className="font-medium hover:underline"
                            >
                                {movement.product?.name}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {movement.product?.sku}
                            </p>
                        </td>
                    )}
                    <td>
                        <Badge variant="secondary" className="capitalize">
                            {movement.type}
                        </Badge>
                    </td>
                    <td
                        className={`font-semibold tabular-nums ${movement.quantity_change > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}
                    >
                        {movement.quantity_change > 0 ? '+' : ''}
                        {number(movement.quantity_change)}
                    </td>
                    <td className="tabular-nums">
                        {number(movement.quantity_after)}
                    </td>
                    <td className="max-w-xs min-w-48 break-words">
                        {movement.reason}
                    </td>
                    <td>{movement.recorded_by}</td>
                </tr>
            ))}
        </InventoryTable>
    );
}
