/**
 * Utilities for working with unified ingredients and products
 */
import type { Ingredient } from '@/entities/ingredient/model/types';
import type { Product } from '@/entities/product/model/types';
import type { UnifiedItem } from '@/shared/lib/types';

/**
 * Convert ingredient to unified item format
 */
export const ingredientToUnified = (ingredient: Ingredient): UnifiedItem => ({
    id: ingredient.id,
    name: ingredient.name,
    type: 'ingredient' as const,
    photo_url: ingredient.photo_url,
    tags: ingredient.tags,
    calories_per_100g_or_ml: ingredient.calories_per_100g_or_ml,
    created_at: ingredient.created_at,
    updated_at: ingredient.updated_at,
    ingredient,
});

/**
 * Convert product to unified item format
 */
export const productToUnified = (product: Product): UnifiedItem => ({
    id: product.id,
    name: product.name,
    type: 'product' as const,
    photo_url: product.photo_url,
    tags: product.tags,
    calories_per_100g_or_ml: product.calories_per_100g_or_ml,
    created_at: product.created_at,
    updated_at: product.updated_at,
    product,
});

/**
 * Get display name for item type
 */
export const getItemTypeLabel = (type: 'ingredient' | 'product'): string => {
    switch (type) {
        case 'ingredient':
            return 'Ingredient';
        case 'product':
            return 'Product';
        default:
            return 'Item';
    }
};

/**
 * Get additional info string for unified item
 */
export const getItemAdditionalInfo = (item: UnifiedItem): string => {
    if (item.type === 'ingredient' && item.ingredient) {
        const shopCount = item.ingredient.shops?.length || 0;
        return shopCount > 0 ? `${shopCount} shop${shopCount !== 1 ? 's' : ''}` : 'No shops';
    }

    if (item.type === 'product' && item.product) {
        const info = [];
        if (item.product.brand) info.push(item.product.brand);
        if (item.product.shop) info.push(item.product.shop);
        return info.length > 0 ? info.join(' • ') : 'No brand/shop';
    }

    return '';
};
