/**
 * Shopping list API client
 */
import type {
    ShoppingListGenerateRequest,
    ShoppingListResponse,
    ShoppingListPreview
} from '../model/types';
import { apiClient } from '@/shared/api/client';

const SHOPPING_API_BASE = '/shopping';

export const shoppingApi = {
    /**
     * Generate shopping list for a date range
     */
    async generateShoppingList(request: ShoppingListGenerateRequest): Promise<ShoppingListResponse> {
        return await apiClient.post<ShoppingListResponse>(
            `${SHOPPING_API_BASE}/generate`,
            request
        );
    },

    /**
     * Generate shopping list using GET request (for direct browser access)
     */
    async generateShoppingListGet(
        startDate: string,
        endDate: string,
        excludeMealTypes?: string[],
        sortBy?: string
    ): Promise<ShoppingListResponse> {
        const params: Record<string, string> = {
            start_date: startDate,
            end_date: endDate,
        };

        if (excludeMealTypes && excludeMealTypes.length > 0) {
            params.exclude_meal_types = excludeMealTypes.join(',');
        }

        if (sortBy) {
            params.sort_by = sortBy;
        }

        return await apiClient.get<ShoppingListResponse>(
            `${SHOPPING_API_BASE}/generate`,
            params
        );
    },

    /**
     * Get preview of what meals would be included in shopping list
     */
    async getShoppingListPreview(startDate: string, endDate: string): Promise<ShoppingListPreview> {
        const params: Record<string, string> = {
            start_date: startDate,
            end_date: endDate,
        };

        return await apiClient.get<ShoppingListPreview>(
            `${SHOPPING_API_BASE}/preview`,
            params
        );
    },

    /**
     * Export shopping list as text
     */
    async exportShoppingListText(request: ShoppingListGenerateRequest): Promise<string> {
        return await apiClient.post<string>(
            `${SHOPPING_API_BASE}/export/text`,
            request
        );
    },

    /**
     * Export shopping list as text using GET request
     */
    async exportShoppingListTextGet(
        startDate: string,
        endDate: string,
        excludeMealTypes?: string[],
        sortBy?: string
    ): Promise<string> {
        const params: Record<string, string> = {
            start_date: startDate,
            end_date: endDate,
        };

        if (excludeMealTypes && excludeMealTypes.length > 0) {
            params.exclude_meal_types = excludeMealTypes.join(',');
        }

        if (sortBy) {
            params.sort_by = sortBy;
        }

        return await apiClient.get<string>(
            `${SHOPPING_API_BASE}/export/text`,
            params
        );
    },

    /**
     * Get shopping list as downloadable text file URL
     */
    getExportUrl(
        startDate: string,
        endDate: string,
        excludeMealTypes?: string[],
        sortBy?: string
    ): string {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });

        if (excludeMealTypes && excludeMealTypes.length > 0) {
            params.append('exclude_meal_types', excludeMealTypes.join(','));
        }

        if (sortBy) {
            params.append('sort_by', sortBy);
        }

        // Note: This assumes the API client has a way to get base URL
        // For now, we'll use the default API base URL
        const baseUrl = 'http://localhost:8000/api/v1';
        return `${baseUrl}${SHOPPING_API_BASE}/export/text?${params.toString()}`;
    },
};
