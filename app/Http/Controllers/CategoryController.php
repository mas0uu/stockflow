<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $search = trim($request->string('search')->toString());

        return Inertia::render('categories/index', [
            'categories' => Category::query()->withCount('products')
                ->when($search !== '', fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
                ->orderBy('name')->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('categories/form', ['category' => null]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created.']);

        return to_route('categories.index');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('categories/form', ['category' => $category]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return to_route('categories.index');
    }
}
