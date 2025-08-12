/**
 * Ingredient entity types and interfaces
 */
import type { DietTag, Macros } from '@/shared/lib/types';

export interface Ingredient {
    id: string;
    name: string;
    photo_data?: string | null; // Base64 encoded string from API
    photo_url?: string | null;
    shops: string[];
    calories_per_100g_or_ml: number;
    macros_per_100g_or_ml: Macros;
    tags: DietTag[];
    created_at: string;
    updated_at: string;
}

export interface CreateIngredientRequest {
    name: string;
    photo_data?: string | null; // Base64 encoded string for API
    shops: string[];
    calories_per_100g_or_ml: number;
    macros_per_100g_or_ml: Macros;
    tags: DietTag[];
}

export interface CreateIngredientWithPhotoRequest extends Omit<CreateIngredientRequest, 'photo_data'> {
    photo_data?: File | null;
}

export interface UpdateIngredientRequest {
    name?: string;
    photo_data?: string | null; // Base64 encoded string for API
    shops?: string[];
    calories_per_100g_or_ml?: number;
    macros_per_100g_or_ml?: Macros;
    tags?: DietTag[];
}

export interface IngredientsListResponse {
    ingredients: Ingredient[];
    total: number;
    skip: number;
    limit: number;
}

export interface IngredientFilters {
    name_filter?: string;
    shops_filter?: string[];
    tag_filter?: DietTag[];
}

export interface IngredientSearchParams extends IngredientFilters {
    skip?: number;
    limit?: number;
}

// API response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
