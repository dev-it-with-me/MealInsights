/**
 * C1011.DateRangeSelectorForShopping - Allows users to select days from the meal plan for the shopping list
 * Part of P0105.ShoppingListPage
 */
import React from "react";
import {
  Stack,
  Group,
  Button,
  Select,
  MultiSelect,
  Text,
  Alert,
  Loader,
  Collapse,
  Badge,
  Grid,
} from "@/shared/ui-kit";
import { DatePickerInput as DateInput } from "@/shared/ui-kit";
import {
  IconCalendar,
  IconInfoCircle,
  IconSettings,
} from "@tabler/icons-react";
import {
  ShoppingListSortBy,
  type ShoppingListFilters,
  type ShoppingListPreview,
} from "@/entities/shopping";

interface DateRangeSelectorForShoppingProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  onFiltersChange: (filters: ShoppingListFilters) => void;
  filters: ShoppingListFilters;
  preview?: ShoppingListPreview | null;
  isLoadingPreview?: boolean;
}

const MEAL_TYPE_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const SORT_OPTIONS = [
  { value: ShoppingListSortBy.INGREDIENT_NAME, label: "Ingredient Name" },
  { value: ShoppingListSortBy.QUANTITY, label: "Quantity" },
  { value: ShoppingListSortBy.SHOP_SUGGESTION, label: "Shop Suggestion" },
  { value: ShoppingListSortBy.MEAL_NAME, label: "Meal Name" },
  { value: ShoppingListSortBy.PLANNED_DATE, label: "Planned Date" },
];

export const DateRangeSelectorForShopping: React.FC<
  DateRangeSelectorForShoppingProps
> = ({
  startDate,
  endDate,
  onDateRangeChange,
  onFiltersChange,
  filters,
  preview,
  isLoadingPreview,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleStartDateChange = (value: Date | null) => {
    onDateRangeChange(value, endDate);
  };

  const handleEndDateChange = (value: Date | null) => {
    onDateRangeChange(startDate, value);
  };

  const handleSetDates = () => {
    // This function could trigger any validation or additional logic
    // For now, dates are set immediately when changed
  };

  const handleExcludeMealTypesChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      excludeMealTypes: values,
    });
  };

  const handleSortByChange = (value: string | null) => {
    if (value) {
      onFiltersChange({
        ...filters,
        sortBy: value as ShoppingListSortBy,
      });
    }
  };

  const isDateRangeValid = startDate && endDate && startDate <= endDate;
  const daysDifference = isDateRangeValid
    ? Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    : 0;

  return (
    <Stack gap="md">
      {/* Main Date Selection */}
      <Grid>
        <Grid.Col span={6}>
          {/* E3120 - ShoppingStartDateField */}
          <DateInput
            label="Start Date"
            placeholder="Select start date"
            value={startDate}
            onChange={handleStartDateChange}
            leftsection={<IconCalendar size={16} />}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={6}>
          {/* E3121 - ShoppingEndDateField */}
          <DateInput
            label="End Date"
            placeholder="Select end date"
            value={endDate}
            onChange={handleEndDateChange}
            leftsection={<IconCalendar size={16} />}
            clearable
            minDate={startDate || undefined}
          />
        </Grid.Col>
      </Grid>

      {/* Date Range Summary */}
      {isDateRangeValid && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            Selected period:{" "}
            <strong>
              {daysDifference} day{daysDifference !== 1 ? "s" : ""}
            </strong>{" "}
            ({startDate.toLocaleDateString()} to {endDate.toLocaleDateString()})
          </Text>
        </Alert>
      )}

      {/* Preview Section */}
      {isDateRangeValid && (
        <Stack gap="xs">
          {isLoadingPreview && (
            <Group>
              <Loader size="sm" />
              <Text size="sm" color="dimmed">
                Loading meal plan preview...
              </Text>
            </Group>
          )}

          {preview && !isLoadingPreview && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="green"
              variant="light"
            >
              <Text size="sm">
                Found meals planned for{" "}
                <strong>
                  {Object.keys(preview.meal_assignments).length} days
                </strong>{" "}
                in this period.
                {Object.keys(preview.meal_assignments).length === 0 && (
                  <Text color="orange" size="sm">
                    No meal plans found for this date range. The shopping list
                    will be empty.
                  </Text>
                )}
              </Text>
            </Alert>
          )}
        </Stack>
      )}

      {/* Advanced Filters */}
      <Group>
        <Button
          variant="subtle"
          leftsection={<IconSettings size={16} />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="sm"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>

        {/* E3122 - SetDatesForShoppingButton */}
        <Button
          onClick={handleSetDates}
          disabled={!isDateRangeValid}
          variant="light"
          size="sm"
        >
          Confirm Date Range
        </Button>
      </Group>

      <Collapse in={showAdvanced}>
        <Stack
          gap="md"
          p="md"
          style={{ border: "1px solid #e9ecef", borderRadius: 4 }}
        >
          <Text size="sm" fw={600}>
            Filter Options
          </Text>

          <MultiSelect
            label="Exclude Meal Types"
            placeholder="Select meal types to exclude from shopping list"
            data={MEAL_TYPE_OPTIONS}
            value={filters.excludeMealTypes}
            onChange={handleExcludeMealTypesChange}
            clearable
            searchable
          />

          <Select
            label="Sort Shopping List By"
            placeholder="Choose how to sort the shopping list"
            data={SORT_OPTIONS}
            value={filters.sortBy}
            onChange={handleSortByChange}
            allowDeselect={false}
          />

          {filters.excludeMealTypes.length > 0 && (
            <Group gap="xs">
              <Text size="sm" color="dimmed">
                Excluding:
              </Text>
              {filters.excludeMealTypes.map((mealType) => (
                <Badge key={mealType} size="sm" variant="light" color="red">
                  {MEAL_TYPE_OPTIONS.find((opt) => opt.value === mealType)
                    ?.label || mealType}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
};
