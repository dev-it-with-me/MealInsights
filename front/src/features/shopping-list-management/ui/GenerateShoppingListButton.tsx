/**
 * E3006.GenerateShoppingListButton - Triggers generation of the shopping list based on selected dates
 * Part of P0105.ShoppingListPage
 * Trigger: Click C1011 (On Dates Set)
 */
import React from "react";
import { Button, Group, Text, Stack, Alert } from "@/shared/ui-kit";
import { IconShoppingCart, IconAlertCircle } from "@tabler/icons-react";
import type { DateRangeSelection } from "@/entities/shopping";

interface GenerateShoppingListButtonProps {
  onGenerate: () => void;
  disabled: boolean;
  isLoading: boolean;
  dateRange: DateRangeSelection;
}

export const GenerateShoppingListButton: React.FC<
  GenerateShoppingListButtonProps
> = ({ onGenerate, disabled, isLoading, dateRange }) => {
  const { startDate, endDate } = dateRange;
  const hasValidDateRange = startDate && endDate && startDate <= endDate;

  const getButtonText = () => {
    if (isLoading) return "Generating Shopping List...";
    if (hasValidDateRange) {
      const daysDiff =
        Math.ceil(
          (endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      return `Generate Shopping List (${daysDiff} day${
        daysDiff !== 1 ? "s" : ""
      })`;
    }
    return "Generate Shopping List";
  };

  const getDisabledReason = () => {
    if (!startDate && !endDate) {
      return "Please select both start and end dates";
    }
    if (!startDate) {
      return "Please select a start date";
    }
    if (!endDate) {
      return "Please select an end date";
    }
    if (startDate > endDate) {
      return "Start date must be before or equal to end date";
    }
    return null;
  };

  const disabledReason = getDisabledReason();

  return (
    <Stack gap="md" align="center">
      {/* Show disabled reason as alert */}
      {disabled && disabledReason && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
          style={{ alignSelf: "stretch" }}
        >
          <Text size="sm">{disabledReason}</Text>
        </Alert>
      )}

      {/* Main generate button */}
      <Button
        size="lg"
        leftsection={isLoading ? undefined : <IconShoppingCart size={20} />}
        onClick={onGenerate}
        disabled={disabled}
        loading={isLoading}
        variant={hasValidDateRange ? "filled" : "light"}
        color={hasValidDateRange ? "blue" : "gray"}
        style={{ minWidth: 280 }}
      >
        {getButtonText()}
      </Button>

      {/* Additional information when ready */}
      {hasValidDateRange && !isLoading && (
        <Group gap="xs">
          <Text size="sm" color="dimmed">
            Period: {startDate!.toLocaleDateString()} -{" "}
            {endDate!.toLocaleDateString()}
          </Text>
        </Group>
      )}

      {/* Loading state additional info */}
      {isLoading && (
        <Text size="sm" color="dimmed">
          Analyzing your meal plan and aggregating ingredients...
        </Text>
      )}
    </Stack>
  );
};
