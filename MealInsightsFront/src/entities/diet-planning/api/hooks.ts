/**
 * React hooks for diet planning data management
 */

import { useState, useEffect, useCallback } from 'react';
import {
    createMealAssignment,
    deleteMealAssignment,
    getDayPlan,
    getDailyCaloriesForRange,
} from '../api/dietPlanningApi';
import { searchMeals } from '../../meal/api/mealApi';
import type {
    MealAssignment,
    CreateMealAssignmentRequest,
    DayPlan,
    DailyCalories,
} from '../model/types';
import type { MealListItem } from '../../meal/model/types';

/**
 * Hook to manage day plan data
 */
export const useDayPlan = (planDate: string) => {
    const [data, setData] = useState<DayPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!planDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getDayPlan(planDate);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch day plan');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [planDate]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
};

/**
 * Hook to manage daily calories data
 */
export const useDailyCaloriesForRange = (startDate: string, endDate: string) => {
    const [data, setData] = useState<DailyCalories | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getDailyCaloriesForRange(startDate, endDate);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch daily calories');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error };
};

/**
 * Hook to create meal assignments
 */
export const useCreateMealAssignment = () => {
    const [isPending, setIsPending] = useState(false);

    const mutateAsync = useCallback(async (data: CreateMealAssignmentRequest): Promise<MealAssignment> => {
        setIsPending(true);
        try {
            const result = await createMealAssignment(data);
            return result;
        } finally {
            setIsPending(false);
        }
    }, []);

    return { mutateAsync, isPending };
};

/**
 * Hook to delete meal assignments
 */
export const useDeleteMealAssignment = () => {
    const [isPending, setIsPending] = useState(false);

    const mutateAsync = useCallback(async (assignmentId: string): Promise<void> => {
        setIsPending(true);
        try {
            await deleteMealAssignment(assignmentId);
        } finally {
            setIsPending(false);
        }
    }, []);

    return { mutateAsync, isPending };
};

/**
 * Hook to search meals
 */
export const useMealSearch = (query: string, options?: { enabled?: boolean }) => {
    const [data, setData] = useState<MealListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!query || query.length < 2 || options?.enabled === false) {
            setData([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await searchMeals(query);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search meals');
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [query, options?.enabled]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error };
};
