import { apiClient } from '@/shared/api/client';
import type {
    Meal,
    MealListItem,
    CreateMealRequest,
    UpdateMealRequest
} from '../model/types';

export const mealApi = {
    async getAll(skip = 0, limit = 100): Promise<MealListItem[]> {
        return apiClient.get<MealListItem[]>('/meals/', { skip, limit });
    },

    async getById(id: string): Promise<Meal> {
        return apiClient.get<Meal>(`/meals/${id}`);
    },

    async create(data: CreateMealRequest): Promise<Meal> {
        return apiClient.post<Meal>('/meals/', data);
    },

    async update(id: string, data: UpdateMealRequest): Promise<Meal> {
        return apiClient.put<Meal>(`/meals/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/meals/${id}`);
    },

    async search(query: string, skip = 0, limit = 100): Promise<MealListItem[]> {
        return apiClient.get<MealListItem[]>('/meals/search', { q: query, skip, limit });
    }
};

// Convenience functions
export const getAllMeals = mealApi.getAll;
export const getMealById = mealApi.getById;
export const createMeal = mealApi.create;
export const updateMeal = mealApi.update;
export const deleteMeal = mealApi.delete;
export const searchMeals = mealApi.search;
