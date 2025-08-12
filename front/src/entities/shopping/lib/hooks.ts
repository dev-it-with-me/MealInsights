/**
 * React hooks for shopping list functionality
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@/shared/ui-kit';
import type {
    ShoppingListGenerateRequest,
    ShoppingListResponse,
    DateRangeSelection,
    ShoppingListFilters
} from '../model/types';
import { ShoppingListSortBy } from '../model/types';
import { shoppingApi } from '../api/shoppingApi';

/**
 * Hook for generating shopping lists
 */
export const useShoppingListGeneration = () => {
    return useMutation({
        mutationFn: (request: ShoppingListGenerateRequest) =>
            shoppingApi.generateShoppingList(request),
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Shopping list generated successfully!',
                color: 'green',
            });
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error?.response?.data?.detail || 'Failed to generate shopping list',
                color: 'red',
            });
        },
    });
};

/**
 * Hook for getting shopping list preview
 */
export const useShoppingListPreview = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['shopping-preview', startDate, endDate],
        queryFn: () => shoppingApi.getShoppingListPreview(startDate!, endDate!),
        enabled: !!(startDate && endDate),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook for exporting shopping list as text
 */
export const useShoppingListExport = () => {
    return useMutation({
        mutationFn: (request: ShoppingListGenerateRequest) =>
            shoppingApi.exportShoppingListText(request),
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Shopping list exported successfully!',
                color: 'green',
            });
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error?.response?.data?.detail || 'Failed to export shopping list',
                color: 'red',
            });
        },
    });
};

/**
 * Hook for managing shopping list state
 */
export const useShoppingListState = () => {
    const [dateRange, setDateRange] = useState<DateRangeSelection>({
        startDate: null,
        endDate: null,
    });

    const [filters, setFilters] = useState<ShoppingListFilters>({
        excludeMealTypes: [],
        sortBy: ShoppingListSortBy.INGREDIENT_NAME,
    });

    const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(null);

    const generateMutation = useShoppingListGeneration();
    const exportMutation = useShoppingListExport();

    const previewQuery = useShoppingListPreview(
        dateRange.startDate && dateRange.startDate instanceof Date ?
            dateRange.startDate.toISOString().split('T')[0] : undefined,
        dateRange.endDate && dateRange.endDate instanceof Date ?
            dateRange.endDate.toISOString().split('T')[0] : undefined
    );

    const generateShoppingList = useCallback(async () => {
        if (!dateRange.startDate || !dateRange.endDate ||
            !(dateRange.startDate instanceof Date) || !(dateRange.endDate instanceof Date)) {
            notifications.show({
                title: 'Error',
                message: 'Please select valid start and end dates',
                color: 'red',
            });
            return;
        }

        const request: ShoppingListGenerateRequest = {
            start_date: dateRange.startDate.toISOString().split('T')[0],
            end_date: dateRange.endDate.toISOString().split('T')[0],
            exclude_meal_types: filters.excludeMealTypes.length > 0 ? filters.excludeMealTypes : undefined,
            sort_by: filters.sortBy,
        };

        try {
            const result = await generateMutation.mutateAsync(request);
            setShoppingList(result);
        } catch (error) {
            // Error handled by mutation
        }
    }, [dateRange, filters, generateMutation]);

    const exportShoppingList = useCallback(async () => {
        if (!dateRange.startDate || !dateRange.endDate ||
            !(dateRange.startDate instanceof Date) || !(dateRange.endDate instanceof Date)) {
            notifications.show({
                title: 'Error',
                message: 'Please select valid start and end dates',
                color: 'red',
            });
            return;
        }

        const request: ShoppingListGenerateRequest = {
            start_date: dateRange.startDate.toISOString().split('T')[0],
            end_date: dateRange.endDate.toISOString().split('T')[0],
            exclude_meal_types: filters.excludeMealTypes.length > 0 ? filters.excludeMealTypes : undefined,
            sort_by: filters.sortBy,
        };

        try {
            const textContent = await exportMutation.mutateAsync(request);

            // Create and download file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shopping-list-${request.start_date}-to-${request.end_date}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            // Error handled by mutation
        }
    }, [dateRange, filters, exportMutation]);

    const printShoppingList = useCallback(() => {
        if (!shoppingList) {
            notifications.show({
                title: 'Error',
                message: 'No shopping list to print',
                color: 'red',
            });
            return;
        }

        // Create printable content
        const printContent = createPrintableShoppingList(shoppingList);

        // Open print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    }, [shoppingList]);

    return {
        // State
        dateRange,
        filters,
        shoppingList,

        // Actions
        setDateRange,
        setFilters,
        generateShoppingList,
        exportShoppingList,
        printShoppingList,

        // Query states
        isGenerating: generateMutation.isPending,
        isExporting: exportMutation.isPending,
        isLoadingPreview: previewQuery.isLoading,
        preview: previewQuery.data,
        previewError: previewQuery.error,

        // Reset
        reset: () => {
            setShoppingList(null);
            setDateRange({ startDate: null, endDate: null });
            setFilters({
                excludeMealTypes: [],
                sortBy: ShoppingListSortBy.INGREDIENT_NAME,
            });
        },
    };
};

/**
 * Helper function to create printable HTML content
 */
function createPrintableShoppingList(shoppingList: ShoppingListResponse): string {
    const items = shoppingList.items
        .map(item => {
            let line = `• ${item.ingredient_name}: ${item.total_quantity} ${item.unit}`;
            if (item.shop_suggestion) {
                line += ` (at ${item.shop_suggestion})`;
            }
            return `<li style="margin: 4px 0;">${line}</li>`;
        })
        .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shopping List</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
        ul { padding-left: 20px; }
        li { margin: 4px 0; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>Shopping List</h1>
      <div class="summary">
        <p><strong>Period:</strong> ${shoppingList.summary.date_range_start} to ${shoppingList.summary.date_range_end}</p>
        <p><strong>Generated:</strong> ${shoppingList.generated_at}</p>
        <p><strong>Total Items:</strong> ${shoppingList.summary.total_items}</p>
        ${shoppingList.summary.total_estimated_cost ?
            `<p><strong>Estimated Cost:</strong> $${shoppingList.summary.total_estimated_cost.toFixed(2)}</p>` : ''
        }
      </div>
      <ul>${items}</ul>
    </body>
    </html>
  `;
}
