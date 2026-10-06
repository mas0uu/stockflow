import { Form, Link } from '@inertiajs/react';
import { ArrowLeftRight, Search } from 'lucide-react';
import {
    EmptyState,
    InventoryPage,
    MovementTable,
    Pagination,
    selectClass,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Movement, Paginated } from '@/types/inventory';

export default function Movements({
    movements,
    filters,
}: {
    movements: Paginated<Movement>;
    filters: { search: string; type: string };
}) {
    return (
        <InventoryPage
            title="Stock movements"
            description="A complete record of what came in, what went out, and why."
            action={
                <Button asChild>
                    <Link href="/movements/create">
                        <ArrowLeftRight />
                        Record stock
                    </Link>
                </Button>
            }
        >
            <Form
                action="/movements"
                method="get"
                className="flex flex-wrap items-center gap-2"
            >
                <Input
                    aria-label="Search by product name or SKU"
                    name="search"
                    defaultValue={filters.search}
                    placeholder="Search product name or SKU…"
                    maxLength={150}
                    className="h-10 sm:max-w-xs"
                />
                <select
                    name="type"
                    aria-label="Filter movement type"
                    defaultValue={filters.type}
                    className={`${selectClass} sm:w-48`}
                >
                    <option value="">All movements</option>
                    <option value="received">Received</option>
                    <option value="issued">Issued</option>
                    <option value="adjustment">Adjustments</option>
                </select>
                <Button variant="outline">
                    <Search />
                    Filter
                </Button>
                {(filters.search || filters.type) && (
                    <Button variant="ghost" asChild>
                        <Link href="/movements">Clear</Link>
                    </Button>
                )}
            </Form>
            {movements.data.length ? (
                <MovementTable movements={movements.data} />
            ) : (
                <EmptyState
                    title="No movements found"
                    description={
                        filters.search || filters.type
                            ? 'Try another search or clear your filters.'
                            : 'Record your first stock receipt to start your inventory history.'
                    }
                />
            )}
            <Pagination page={movements} />
        </InventoryPage>
    );
}
Movements.layout = {
    breadcrumbs: [{ title: 'Stock movements', href: '/movements' }],
};
