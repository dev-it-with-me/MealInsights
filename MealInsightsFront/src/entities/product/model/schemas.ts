/**
 * Product entity Zod schemas for validation
 */
import { z } from 'zod';
import { dietTagSchema, macrosSchema } from '@/shared/lib/schemas';

export const ingredientQuantitySchema = z.object({
    ingredient_id: z.string().uuid(),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
});

export const productSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Product name is required'),
    brand: z.string().nullable().optional(),
    photo_data: z.instanceof(Uint8Array).nullable().optional(),
    photo_url: z.string().url().nullable().optional(),
    shop: z.string().nullable().optional(),
    calories_per_100g_or_ml: z.number().min(0, 'Calories must be non-negative').nullable().optional(),
    macros_per_100g_or_ml: macrosSchema.nullable().optional(),
    package_size_g_or_ml: z.number().positive('Package size must be positive').nullable().optional(),
    ingredients: z.array(ingredientQuantitySchema).nullable().optional(),
    tags: z.array(dietTagSchema),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const createProductRequestSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    brand: z.string().nullable().optional(),
    photo_data: z.instanceof(Uint8Array).nullable().optional(),
    shop: z.string().nullable().optional(),
    calories_per_100g_or_ml: z.number().min(0, 'Calories must be non-negative').nullable().optional(),
    macros_per_100g_or_ml: macrosSchema.nullable().optional(),
    package_size_g_or_ml: z.number().positive('Package size must be positive').nullable().optional(),
    ingredients: z.array(ingredientQuantitySchema).nullable().optional(),
    tags: z.array(dietTagSchema),
});

export const updateProductRequestSchema = z.object({
    name: z.string().min(1, 'Product name is required').optional(),
    brand: z.string().nullable().optional(),
    photo_data: z.instanceof(Uint8Array).nullable().optional(),
    shop: z.string().nullable().optional(),
    calories_per_100g_or_ml: z.number().min(0, 'Calories must be non-negative').nullable().optional(),
    macros_per_100g_or_ml: macrosSchema.nullable().optional(),
    package_size_g_or_ml: z.number().positive('Package size must be positive').nullable().optional(),
    ingredients: z.array(ingredientQuantitySchema).nullable().optional(),
    tags: z.array(dietTagSchema).optional(),
});

export const productFiltersSchema = z.object({
    name_filter: z.string().optional(),
    brand_filter: z.string().optional(),
    shop_filter: z.string().optional(),
    tag_filter: z.array(dietTagSchema).optional(),
});

export const productSearchParamsSchema = productFiltersSchema.extend({
    skip: z.number().min(0).optional(),
    limit: z.number().min(1).max(100).optional(),
});

export const productsListResponseSchema = z.object({
    products: z.array(productSchema),
    total: z.number().min(0),
    skip: z.number().min(0),
    limit: z.number().min(1),
});
