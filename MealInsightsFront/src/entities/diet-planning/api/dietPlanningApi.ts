/**
 * Diet planning API functions
 */

import { apiClient } from '../../../shared/api/client';
import type {
    MealAssignment,
    CreateMealAssignmentRequest,
    UpdateMealAssignmentRequest,
    DayPlan,
    WeekPlan,
    DailyCalories,
} from '../model/types';

const DIET_PLANNING_BASE_URL = '/diet-planning';

/**
 * Create a new meal assignment
 */
export const createMealAssignment = async (
    data: CreateMealAssignmentRequest
): Promise<MealAssignment> => {
    return apiClient.post<MealAssignment>(`${DIET_PLANNING_BASE_URL}/assignments`, data);
};

/**
 * Get a specific meal assignment by ID
 */
export const getMealAssignment = async (assignmentId: string): Promise<MealAssignment> => {
    return apiClient.get<MealAssignment>(`${DIET_PLANNING_BASE_URL}/assignments/${assignmentId}`);
};

/**
 * Update a meal assignment
 */
export const updateMealAssignment = async (
    assignmentId: string,
    data: UpdateMealAssignmentRequest
): Promise<MealAssignment> => {
    return apiClient.put<MealAssignment>(`${DIET_PLANNING_BASE_URL}/assignments/${assignmentId}`, data);
};

/**
 * Delete a meal assignment
 */
export const deleteMealAssignment = async (assignmentId: string): Promise<void> => {
    return apiClient.delete<void>(`${DIET_PLANNING_BASE_URL}/assignments/${assignmentId}`);
};

/**
 * Get meal assignments for a date range
 */
export const getMealAssignments = async (
    startDate: string,
    endDate: string
): Promise<MealAssignment[]> => {
    return apiClient.get<MealAssignment[]>(
        `${DIET_PLANNING_BASE_URL}/assignments?start_date=${startDate}&end_date=${endDate}`
    );
};

/**
 * Get day plan for a specific date
 */
export const getDayPlan = async (planDate: string): Promise<DayPlan> => {
    return apiClient.get<DayPlan>(`${DIET_PLANNING_BASE_URL}/plans/day/${planDate}`);
};

/**
 * Get week plan starting from a specific date
 */
export const getWeekPlan = async (startDate: string): Promise<WeekPlan> => {
    return apiClient.get<WeekPlan>(`${DIET_PLANNING_BASE_URL}/plans/week?start_date=${startDate}`);
};

/**
 * Get assignments for a specific day
 */
export const getAssignmentsForDay = async (planDate: string): Promise<MealAssignment[]> => {
    return apiClient.get<MealAssignment[]>(`${DIET_PLANNING_BASE_URL}/assignments/day/${planDate}`);
};

/**
 * Get daily calories for a date range
 */
export const getDailyCaloriesForRange = async (
    startDate: string,
    endDate: string
): Promise<DailyCalories> => {
    return apiClient.get<DailyCalories>(
        `${DIET_PLANNING_BASE_URL}/calories/range?start_date=${startDate}&end_date=${endDate}`
    );
};
