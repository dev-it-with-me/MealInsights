/**
 * Shared Zod schemas for common validation across the application
 */
import { z } from 'zod';
import { DietTagEnum } from '@/shared/lib/types';

// Create enum values array for Zod validation
const dietTagValues = Object.values(DietTagEnum) as [string, ...string[]];

/**
 * Schema for a diet tag (must be one of the predefined DietTagEnum values)
 */
export const dietTagSchema = z.enum(dietTagValues);

/**
 * Schema for macronutrient values (protein, carbohydrates, sugar, fat, fiber, saturated_fat)
 */
export const macrosSchema = z.object({
    protein: z.number().min(0, 'Protein must be non-negative'),
    carbohydrates: z.number().min(0, 'Carbohydrates must be non-negative'),
    sugar: z.number().min(0, 'Sugar must be non-negative'),
    fat: z.number().min(0, 'Fat must be non-negative'),
    fiber: z.number().min(0, 'Fiber must be non-negative'),
    saturated_fat: z.number().min(0, 'Saturated fat must be non-negative'),
});
