/**
 * Shared types for the MealInsights application
 */

export interface Macros {
    protein: number;
    carbohydrates: number;
    fat: number;
}

export const DietTagEnum = {
    VEGETARIAN: "vegetarian",
    VEGAN: "vegan",
    GLUTEN_FREE: "gluten_free",
    DAIRY_FREE: "dairy_free",
    NUT_FREE: "nut_free",
    LOW_CARB: "low_carb",
    HIGH_PROTEIN: "high_protein",
    MEAT: "meat",
    FISH: "fish",
    FRUIT: "fruit",
    VEGETABLE: "vegetable",
    DAIRY: "dairy",
    FODMAP_FREE: "fodmap_free",
    LOW_FODMAP: "low_fodmap",
    HIGH_FODMAP: "high_fodmap",
    SUGAR_FREE: "sugar_free",
    LOW_SUGAR: "low_sugar",
    HIGH_SUGAR: "high_sugar",
    HEALTHY_FAT: "healthy_fat",
    LOW_FAT: "low_fat",
    KETO: "keto",
    PALEO: "paleo",
} as const;
export type DietTag = typeof DietTagEnum[keyof typeof DietTagEnum];

export const UnitEnum = {
    GRAM: "g",
    MILLILITER: "ml",
} as const;
export type Unit = typeof UnitEnum[keyof typeof UnitEnum];

export interface PaginationParams {
    skip?: number;
    limit?: number;
}

export interface ApiError {
    detail: string;
    error_type: string;
}

// Unified types for managing both ingredients and products
export type ItemType = 'ingredient' | 'product';

export interface UnifiedItem {
    id: string;
    name: string;
    type: ItemType;
    photo_url?: string | null;
    tags: string[];
    calories_per_100g_or_ml?: number | null;
    created_at: string;
    updated_at: string;
    // Type-specific data - will be populated based on type
    ingredient?: any; // Will contain Ingredient data if type is 'ingredient'
    product?: any; // Will contain Product data if type is 'product'
}

export interface UnifiedItemFilters {
    name_filter?: string;
    type_filter?: ItemType | 'all';
    tag_filter?: string[];
}

export interface UnifiedItemSearchParams extends UnifiedItemFilters {
    skip?: number;
    limit?: number;
}
