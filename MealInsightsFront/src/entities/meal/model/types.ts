/**
 * Types for meal entities
 */

import { DietTag, Macros, Unit } from '@/shared/lib/types';

export interface MealIngredient {
    item_id: string;
    item_type: 'ingredient' | 'product';
    item_name: string;
    quantity: number;
    unit: Unit;
}

export interface IngredientEquivalent {
    original_item_id: string;
    equivalent_item_id: string;
    equivalent_item_type: 'ingredient' | 'product';
    equivalent_item_name: string;
    conversion_ratio: number;
}

export interface Meal {
    id: string;
    name: string;
    photo_data?: string | null;
    recipe?: string | null;
    ingredients: MealIngredient[];
    equivalents: IngredientEquivalent[];
    calories_total?: number | null;
    macros_total?: Macros | null;
    is_nutrition_calculated: boolean;
    tags: DietTag[];
}

export interface MealListItem {
    id: string;
    name: string;
    photo_data?: string | null;
    calories_total?: number | null;
    tags: DietTag[];
    ingredient_count: number;
}

export interface CreateMealRequest {
    name: string;
    photo_data?: string | null;
    recipe?: string | null;
    ingredients: MealIngredient[];
    equivalents: IngredientEquivalent[];
    calories_total?: number | null;
    macros_total?: Macros | null;
    is_nutrition_calculated: boolean;
    tags: DietTag[];
}

export interface UpdateMealRequest {
    name?: string;
    photo_data?: string | null;
    recipe?: string | null;
    ingredients?: MealIngredient[];
    equivalents?: IngredientEquivalent[];
    calories_total?: number | null;
    macros_total?: Macros | null;
    is_nutrition_calculated?: boolean;
    tags?: DietTag[];
}
