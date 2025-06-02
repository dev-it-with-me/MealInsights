/**
 * Unified types for managing both ingredients and products
 */
import type { Ingredient } from '@/entities/ingredient/model/types';
import type { Product } from '@/entities/product/model/types';

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
    // Type-specific data
    ingredient?: Ingredient;
    product?: Product;
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
