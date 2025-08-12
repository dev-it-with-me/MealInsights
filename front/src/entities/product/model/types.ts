/**
 * Product entity types and interfaces
 */
import type { DietTag, Macros } from '@/shared/lib/types';

export interface Product {
    id: string;
    name: string;
    brand?: string | null;
    photo_data?: string | null; // Base64 encoded string from API
    photo_url?: string | null;
    shop?: string | null;
    calories_per_100g_or_ml?: number | null;
    macros_per_100g_or_ml?: Macros | null;
    package_size_g_or_ml?: number | null;
    ingredients?: string[] | null; // Array of ingredient IDs
    tags: DietTag[];
    created_at: string;
    updated_at: string;
}

export interface CreateProductRequest {
    name: string;
    brand?: string | null;
    photo_data?: string | null; // Base64 encoded string for API
    shop?: string | null;
    calories_per_100g_or_ml?: number | null;
    macros_per_100g_or_ml?: Macros | null;
    package_size_g_or_ml?: number | null;
    ingredients?: string[] | null; // Array of ingredient IDs
    tags: DietTag[];
}

export interface UpdateProductRequest {
    name?: string;
    brand?: string | null;
    photo_data?: string | null; // Base64 encoded string for API
    shop?: string | null;
    calories_per_100g_or_ml?: number | null;
    macros_per_100g_or_ml?: Macros | null;
    package_size_g_or_ml?: number | null;
    ingredients?: string[] | null; // Array of ingredient IDs
    tags?: DietTag[];
}

export interface ProductsListResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

export interface ProductFilters {
    name_filter?: string;
    brand_filter?: string;
    shop_filter?: string;
    tag_filter?: DietTag[];
}

export interface ProductSearchParams extends ProductFilters {
    skip?: number;
    limit?: number;
}

// API response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface CreateProductWithPhotoRequest extends Omit<CreateProductRequest, 'photo_data'> {
    photo_data?: File | null;
}
