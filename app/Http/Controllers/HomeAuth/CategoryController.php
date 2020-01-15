<?php

namespace App\Http\Controllers\HomeAuth;

use App\Category;
use App\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CategoryController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function showCategory(Request $request): JsonResponse
    {
        $categoryId = $request->all()['params']['categoryId'] ?? 1;

        $category = Category::select('id', 'slug')
            ->where('id', $categoryId)
            ->first();

        if ($category) {
            return Event::categoriesShow($category->id, true, $category->slug);
        }

        return response()->json([
            'success' => false,
            'message' => 'Category not found !!!'
        ], 201);
    }
}
