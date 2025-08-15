/**
 * Ingredient API functions
 */
import { apiClient } from '@/shared/api/client';
import type {
    Ingredient,
    CreateIngredientRequest,
    CreateIngredientWithPhotoRequest,
    UpdateIngredientRequest,
    IngredientsListResponse,
    IngredientSearchParams,
    ApiResponse
} from '../model/types';

const INGREDIENTS_API_BASE = '/ingredients-products/ingredients';

// Simplified API functions for use in components
export const getAllIngredients = async (): Promise<ApiResponse<Ingredient[]>> => {
    const response = await ingredientApi.getIngredients();
    return { data: response.ingredients };
};

export const getIngredient = async (id: string): Promise<ApiResponse<Ingredient>> => {
    const ingredient = await ingredientApi.getIngredient(id);
    return { data: ingredient };
};

export const createIngredient = async (data: CreateIngredientRequest): Promise<ApiResponse<Ingredient>> => {
    const ingredient = await ingredientApi.createIngredient(data);
    return { data: ingredient };
};

export const updateIngredient = async (id: string, data: UpdateIngredientRequest): Promise<ApiResponse<Ingredient>> => {
    const ingredient = await ingredientApi.updateIngredient(id, data);
    return { data: ingredient };
};

export const deleteIngredient = async (id: string): Promise<void> => {
    return ingredientApi.deleteIngredient(id);
};

export const searchIngredients = async (namePattern: string, limit: number = 10): Promise<ApiResponse<Ingredient[]>> => {
    const ingredients = await ingredientApi.searchIngredients(namePattern, limit);
    return { data: ingredients };
};

export const ingredientApi = {
    /**
     * Get all ingredients with optional filtering and pagination
     */
    async getIngredients(params?: IngredientSearchParams): Promise<IngredientsListResponse> {
        const queryParams: Record<string, string | number> = {};

        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.name_filter) queryParams.name_filter = params.name_filter;
        if (params?.shops_filter?.length) queryParams.shops_filter = params.shops_filter.join(',');
        if (params?.tag_filter?.length) {
            // Handle array parameters - backend expects multiple query params
            // This will need to be handled differently in the API client
            queryParams.tag_filter = params.tag_filter.join(',');
        }

        return apiClient.get<IngredientsListResponse>(INGREDIENTS_API_BASE, queryParams);
    },

    /**
     * Get ingredient by ID
     */
    async getIngredient(id: string): Promise<Ingredient> {
        return apiClient.get<Ingredient>(`${INGREDIENTS_API_BASE}/${id}`);
    },

    /**
     * Get all ingredients for a product
     */
    async getProductIngredients(productId: string): Promise<Ingredient[]> {
        return apiClient.get<Ingredient[]>(`${INGREDIENTS_API_BASE}/by-product-id/${productId}`);
    },

    /**
     * Create new ingredient
     */
    async createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
        return apiClient.post<Ingredient>(INGREDIENTS_API_BASE, data);
    },

    /**
     * Update existing ingredient
     */
    async updateIngredient(id: string, data: UpdateIngredientRequest): Promise<Ingredient> {
        return apiClient.put<Ingredient>(`${INGREDIENTS_API_BASE}/${id}`, data);
    },

    /**
     * Delete ingredient
     */
    async deleteIngredient(id: string): Promise<void> {
        return apiClient.delete<void>(`${INGREDIENTS_API_BASE}/${id}`);
    },

    /**
     * Search ingredients by name pattern
     */
    async searchIngredients(namePattern: string, limit: number = 10): Promise<Ingredient[]> {
        return apiClient.get<Ingredient[]>(`${INGREDIENTS_API_BASE}/search`, {
            name_pattern: namePattern,
            limit,
        });
    },

    /**
     * Get ingredients by tags
     */
    async getIngredientsByTags(tags: string[]): Promise<Ingredient[]> {
        return apiClient.get<Ingredient[]>(`${INGREDIENTS_API_BASE}/by-tags`, {
            tags: tags.join(','),
        });
    },

    /**
     * Create new ingredient with photo upload
     */
    async createIngredientWithPhoto(data: CreateIngredientWithPhotoRequest): Promise<Ingredient> {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('shops', JSON.stringify(data.shops || []));
        formData.append('calories_per_100g_or_ml', data.calories_per_100g_or_ml.toString());
        formData.append('macros_protein', data.macros_per_100g_or_ml.protein.toString());
        formData.append('macros_carbohydrates', data.macros_per_100g_or_ml.carbohydrates.toString());
        formData.append('macros_fat', data.macros_per_100g_or_ml.fat.toString());
        formData.append('macros_sugar', data.macros_per_100g_or_ml.sugar.toString());
        formData.append('macros_fiber', data.macros_per_100g_or_ml.fiber.toString());
        formData.append('macros_saturated_fat', data.macros_per_100g_or_ml.saturated_fat.toString());
        formData.append('tags', JSON.stringify(data.tags || []));


        if (data.photo_data) {
            formData.append('photo', data.photo_data);

        } else {

        }
        return apiClient.postFormData<Ingredient>(`${INGREDIENTS_API_BASE}/with-photo`, formData);
    },

    /**
     * Update existing ingredient with photo upload
     */
    async updateIngredientWithPhoto(id: string, data: CreateIngredientWithPhotoRequest): Promise<Ingredient> {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('shops', JSON.stringify(data.shops || []));
        formData.append('calories_per_100g_or_ml', data.calories_per_100g_or_ml.toString());
        formData.append('macros_protein', data.macros_per_100g_or_ml.protein.toString());
        formData.append('macros_carbohydrates', data.macros_per_100g_or_ml.carbohydrates.toString());
        formData.append('macros_fat', data.macros_per_100g_or_ml.fat.toString());
        formData.append('macros_sugar', data.macros_per_100g_or_ml.sugar.toString());
        formData.append('macros_fiber', data.macros_per_100g_or_ml.fiber.toString());
        formData.append('macros_saturated_fat', data.macros_per_100g_or_ml.saturated_fat.toString());
        formData.append('tags', JSON.stringify(data.tags || []));

        if (data.photo_data) {
            formData.append('photo', data.photo_data);
        }

        return apiClient.putFormData<Ingredient>(`${INGREDIENTS_API_BASE}/${id}/with-photo`, formData);
    },
};
