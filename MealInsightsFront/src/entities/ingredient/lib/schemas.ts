/**
 * Zod schemas for ingredient validation
 */
import { z } from 'zod';
import { DietTagEnum } from '@/shared/lib/types';

const macrosSchema = z.object({
    protein: z.number().min(0, 'Protein must be non-negative'),
    carbohydrates: z.number().min(0, 'Carbohydrates must be non-negative'),
    sugar: z.number().min(0, 'Sugar must be non-negative'),
    fat: z.number().min(0, 'Fat must be non-negative'),
    fiber: z.number().min(0, 'Fiber must be non-negative'),
    saturated_fat: z.number().min(0, 'Saturated fat must be non-negative'),
});

// Create enum values array for Zod validation
const dietTagValues = Object.values(DietTagEnum) as [string, ...string[]];

export const ingredientCreateSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    shops: z.array(z.string())
        .default([]),
    calories_per_100g_or_ml: z.number()
        .min(0, 'Calories must be non-negative'),
    macros_per_100g_or_ml: macrosSchema,
    tags: z.array(z.enum(dietTagValues)).default([]),
});

export const ingredientUpdateSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    shops: z.array(z.string())
        .optional(),
    calories_per_100g_or_ml: z.number()
        .min(0, 'Calories must be non-negative')
        .optional(),
    macros_per_100g_or_ml: macrosSchema.optional(),
    tags: z.array(z.enum(dietTagValues)).optional(),
});

export const ingredientFilterSchema = z.object({
    name_filter: z.string().optional(),
    shops_filter: z.array(z.string()).optional(),
    tag_filter: z.array(z.enum(dietTagValues)).optional(),
    skip: z.number().min(0).optional(),
    limit: z.number().min(1).max(1000).optional(),
});

export type IngredientCreateInput = z.infer<typeof ingredientCreateSchema>;
export type IngredientUpdateInput = z.infer<typeof ingredientUpdateSchema>;
export type IngredientFilterInput = z.infer<typeof ingredientFilterSchema>;
