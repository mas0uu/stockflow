import { Form, Link } from '@inertiajs/react';
import {
    Field,
    InventoryPage,
    selectClass,
    textareaClass,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/inventory';

export default function CategoryForm({
    category,
}: {
    category: Category | null;
}) {
    return (
        <InventoryPage
            title={category ? 'Edit category' : 'Add category'}
            description="Group similar products so they are easy to find."
        >
            <Form
                action={category ? `/categories/${category.id}` : '/categories'}
                method={category ? 'put' : 'post'}
                className="max-w-2xl space-y-6 rounded-xl border bg-card p-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field
                            id="name"
                            label="Category name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                defaultValue={category?.name}
                                autoFocus
                                placeholder="e.g. Office supplies"
                            />
                        </Field>
                        <Field
                            id="description"
                            label="Description (optional)"
                            error={errors.description}
                        >
                            <textarea
                                id="description"
                                name="description"
                                maxLength={2000}
                                defaultValue={category?.description ?? ''}
                                className={textareaClass}
                            />
                        </Field>
                        <Field
                            id="is_active"
                            label="Status"
                            error={errors.is_active}
                            hint="Inactive categories cannot be assigned to new products. Existing products and their stock remain available."
                        >
                            <select
                                id="is_active"
                                name="is_active"
                                defaultValue={
                                    category?.is_active === false ? '0' : '1'
                                }
                                className={selectClass}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </Field>
                        <div className="flex gap-3 border-t pt-6">
                            <Button disabled={processing}>
                                {processing ? 'Saving…' : 'Save category'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/categories">Cancel</Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </InventoryPage>
    );
}
CategoryForm.layout = {
    breadcrumbs: [
        { title: 'Categories', href: '/categories' },
        { title: 'Category details', href: '#' },
    ],
};
