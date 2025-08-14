/**
 * P0105.ShoppingListPage - Generates a shopping list based on the meal plan for selected days
 * URL: /shopping-list
 */
import React from "react";
import { Container, Stack, Card, Title } from "@/shared/ui-kit";
import { IconShoppingCart } from "@tabler/icons-react";
import { PageHeader } from "@/shared/ui";
import { DateRangeSelectorForShopping } from "@/features/shopping-list-management/ui/DateRangeSelectorForShopping";
import { GenerateShoppingListButton } from "@/features/shopping-list-management/ui/GenerateShoppingListButton";
import { ShoppingListDisplay } from "@/features/shopping-list-management/ui/ShoppingListDisplay";
import { useShoppingListState } from "@/entities/shopping";

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

  const handleDateRangeChange = (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    setDateRange({ startDate, endDate });
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const canGenerateList = dateRange.startDate && dateRange.endDate;

  return (
    <div>
      <Container size="xl">
        <PageHeader
          icon={IconShoppingCart}
          title="Shopping List Generator"
          description="Generate a shopping list based on your meal plan"
        />

        <Stack gap="xl">
          {/* C1011 - DateRangeSelectorForShopping */}
          <Card
            padding="lg"
            style={{
              backgroundColor: "var(--color-surface-900)",
              border: "1px solid var(--color-surface-800)",
              borderRadius: "12px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Title
              order={3}
              mb="md"
              style={{
                color: "var(--color-surface-50)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
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
            <Card
              padding="lg"
              style={{
                backgroundColor: "var(--color-surface-900)",
                border: "1px solid var(--color-surface-800)",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
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
            <Card
              padding="xl"
              style={{
                backgroundColor: "var(--color-surface-900)",
                border: "1px solid var(--color-surface-800)",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <Stack align="center" gap="md">
                <Title
                  order={4}
                  style={{
                    color: "var(--color-surface-400)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  No Shopping List Generated
                </Title>
                <p
                  style={{
                    color: "var(--color-surface-300)",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Select a date range and click "Generate Shopping List" to
                  create your shopping list based on your meal plan.
                </p>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </div>
  );
};

export default ShoppingListPage;
