/**
 * Diet planning types and interfaces
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealAssignment {
    id: string;
    meal_id: string;
    plan_date: string; // YYYY-MM-DD format
    meal_type: MealType;
    meal_name: string; // Name of the meal for display purposes
    specific_time?: string | null; // HH:MM format
    notes?: string | null;
    created_at?: string;
    updated_at?: string;

    // Populated meal data
    meal?: {
        id: string;
        name: string;
        description?: string;
        calories?: number;
        protein?: number;
        carbohydrates?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        saturated_fat?: number;
        tags?: string[];
    };
}

export interface CreateMealAssignmentRequest {
    meal_id: string;
    plan_date: string; // YYYY-MM-DD format
    meal_type: MealType;
    specific_time?: string | null; // HH:MM format
    notes?: string | null;
}

export interface UpdateMealAssignmentRequest {
    meal_type?: MealType;
}

export interface DayPlan {
    plan_date: string; // YYYY-MM-DD format
    total_calories: number;
    total_protein: number;
    total_carbohydrates: number;
    total_fat: number;
    total_fiber: number;
    meal_assignments: MealAssignment[];
}

export interface WeekPlan {
    start_date: string; // YYYY-MM-DD format
    end_date: string; // YYYY-MM-DD format
    total_calories: number;
    daily_plans: DayPlan[];
}

export interface DateRange {
    start_date: string; // YYYY-MM-DD format
    end_date: string; // YYYY-MM-DD format
}

export interface DailyCalories {
    [date: string]: number; // date in YYYY-MM-DD format -> calories
}
