/**
 * P0105.ShoppingListPage - Generates a shopping list based on the meal plan for selected days
 * URL: /shopping-list
 */
import React from 'react';
import { Container, Title, Stack, Card } from '@mantine/core';
import { DateRangeSelectorForShopping } from '@/features/shopping-list-management/ui/DateRangeSelectorForShopping';
import { GenerateShoppingListButton } from '@/features/shopping-list-management/ui/GenerateShoppingListButton';
import { ShoppingListDisplay } from '@/features/shopping-list-management/ui/ShoppingListDisplay';
import { useShoppingListState } from '@/entities/shopping';

const ShoppingListPage: React.FC = () => {
    const {
        dateRange,
        filters,
        shoppingList,
        setDateRange,
        setFilters,
        generateShoppingList,
        exportShoppingList,
        printShoppingList,
        isGenerating,
        isExporting,
        isLoadingPreview,
        preview,
    } = useShoppingListState();

    const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
        setDateRange({ startDate, endDate });
    };

    const handleFiltersChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    const canGenerateList = dateRange.startDate && dateRange.endDate;

    return (
        <Container size="xl" py="xl">
            <Title order={1} mb="xl">
                Shopping List Generator
            </Title>

            <Stack gap="xl">
                {/* C1011 - DateRangeSelectorForShopping */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">
                        Select Date Range
                    </Title>
                    <DateRangeSelectorForShopping
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onDateRangeChange={handleDateRangeChange}
                        onFiltersChange={handleFiltersChange}
                        filters={filters}
                        preview={preview}
                        isLoadingPreview={isLoadingPreview}
                    />
                </Card>

                {/* E3006 - GenerateShoppingListButton */}
                <GenerateShoppingListButton
                    onGenerate={generateShoppingList}
                    disabled={!canGenerateList}
                    isLoading={isGenerating}
                    dateRange={dateRange}
                />

                {/* C1012 - ShoppingListDisplay */}
                {shoppingList && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <ShoppingListDisplay
                            shoppingList={shoppingList}
                            onExport={exportShoppingList}
                            onPrint={printShoppingList}
                            isExporting={isExporting}
                        />
                    </Card>
                )}

                {/* Empty state when no shopping list */}
                {!shoppingList && !isGenerating && (
                    <Card shadow="sm" padding="xl" radius="md" withBorder>
                        <Stack align="center" gap="md">
                            <Title order={4} c="dimmed">
                                No Shopping List Generated
                            </Title>
                            <p>
                                Select a date range and click "Generate Shopping List" to create your shopping list
                                based on your meal plan.
                            </p>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Container>
    );
};

export default ShoppingListPage;
