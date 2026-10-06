import { Form, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import {
    EmptyState,
    InventoryPage,
    InventoryTable,
    Pagination,
    Status,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, Paginated } from '@/types/inventory';

export default function Categories({
    categories,
    filters,
}: {
    categories: Paginated<Category>;
    filters: { search: string };
}) {
    return (
        <InventoryPage
            title="Categories"
            description="Keep your product catalog organized."
            action={
                <Button asChild>
                    <Link href="/categories/create">
                        <Plus />
                        Add category
                    </Link>
                </Button>
            }
        >
            <Form
                action="/categories"
                method="get"
                className="flex flex-wrap gap-2"
            >
                <Input
                    aria-label="Search categories"
                    name="search"
                    defaultValue={filters.search}
                    placeholder="Search categories…"
                    className="max-w-sm"
                    maxLength={100}
                />
                <Button variant="outline">
                    <Search />
                    Search
                </Button>
                {filters.search && (
                    <Button variant="ghost" asChild>
                        <Link href="/categories">Clear</Link>
                    </Button>
                )}
            </Form>
            {categories.data.length ? (
                <InventoryTable
                    headers={[
                        'Category',
                        'Description',
                        'Products',
                        'Status',
                        'Actions',
                    ]}
                >
                    {categories.data.map((category) => (
                        <tr key={category.id} className="hover:bg-muted/25">
                            <td className="font-medium">{category.name}</td>
                            <td className="max-w-md break-words text-muted-foreground">
                                {category.description || '—'}
                            </td>
                            <td>
                                <Link
                                    href={`/products?category_id=${category.id}`}
                                    className="hover:underline"
                                >
                                    {category.products_count}
                                </Link>
                            </td>
                            <td>
                                <Status active={category.is_active} />
                            </td>
                            <td>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={`/categories/${category.id}/edit`}
                                        aria-label={`Edit ${category.name}`}
                                    >
                                        Edit
                                    </Link>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </InventoryTable>
            ) : (
                <EmptyState
                    title={
                        filters.search
                            ? 'No matching categories'
                            : 'Start with a category'
                    }
                    description={
                        filters.search
                            ? 'Try another search or clear your filters.'
                            : 'Create a category, then add the products that belong to it.'
                    }
                    action={
                        !filters.search && (
                            <Button asChild>
                                <Link href="/categories/create">
                                    Add category
                                </Link>
                            </Button>
                        )
                    }
                />
            )}
            <Pagination page={categories} />
        </InventoryPage>
    );
}
Categories.layout = {
    breadcrumbs: [{ title: 'Categories', href: '/categories' }],
};
