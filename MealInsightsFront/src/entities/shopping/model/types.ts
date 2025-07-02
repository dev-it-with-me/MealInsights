/**
 * Shopping list entity types and interfaces
 */

export interface ShoppingListItem {
    ingredient_id: number;
    ingredient_name: string;
    total_quantity: string;
    unit: string;
    category?: string;
    estimated_cost?: number;
    notes: string;
    shop_suggestion?: string;
    planned_meals: string[];
    planned_dates: string[]; // ISO date strings
}

export interface ShoppingSummary {
    total_items: number;
    total_estimated_cost?: number;
    categories: string[];
    date_range_start: string; // ISO date string
    date_range_end: string; // ISO date string
}

export interface ShoppingListResponse {
    items: ShoppingListItem[];
    summary: ShoppingSummary;
    generated_at: string; // ISO date string
}

export interface ShoppingListGenerateRequest {
    start_date: string; // ISO date string (YYYY-MM-DD)
    end_date: string; // ISO date string (YYYY-MM-DD)
    exclude_meal_types?: string[];
    sort_by?: ShoppingListSortBy;
}

export const ShoppingListSortBy = {
    INGREDIENT_NAME: "ingredient_name",
    QUANTITY: "quantity",
    SHOP_SUGGESTION: "shop_suggestion",
    MEAL_NAME: "meal_name",
    PLANNED_DATE: "planned_date"
} as const;

export type ShoppingListSortBy = typeof ShoppingListSortBy[keyof typeof ShoppingListSortBy];

export interface ShoppingListPreview {
    date_range: {
        start_date: string;
        end_date: string;
    };
    meal_assignments: Record<string, Record<string, MealAssignmentPreview[]>>;
    total_days: number;
}

export interface MealAssignmentPreview {
    meal_id: number;
    meal_name: string;
    servings: number;
    ingredient_count: number;
}

// Frontend-specific types for components
export interface DateRangeSelection {
    startDate: Date | null;
    endDate: Date | null;
}

export interface ShoppingListFilters {
    excludeMealTypes: string[];
    sortBy: ShoppingListSortBy;
}

export interface ShoppingListState {
    isLoading: boolean;
    isGenerating: boolean;
    data: ShoppingListResponse | null;
    preview: ShoppingListPreview | null;
    error: string | null;
    dateRange: DateRangeSelection;
    filters: ShoppingListFilters;
}
