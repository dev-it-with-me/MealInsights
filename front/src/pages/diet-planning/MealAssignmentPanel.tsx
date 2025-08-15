import { useState } from "react";
import {
  Stack,
  Title,
  Text,
  Select,
  Button,
  Group,
  Alert,
  Loader,
  Badge,
  Card,
  Textarea,
} from "@/shared/ui-kit";
import { TimeInput } from "@/shared/ui-kit";
import { IconCalendar, IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@/shared/ui-kit";
import dayjs from "dayjs";
import { MealSearchSelect } from "./MealSearchSelect";
import { PlannedMealsListForDay } from "./PlannedMealsListForDay";
import {
  useDayPlan,
  useCreateMealAssignment,
  useDeleteMealAssignment,
} from "../../entities/diet-planning/api/hooks";
import type { MealType } from "../../entities/diet-planning/model/types";

export interface MealAssignmentPanelProps {
  selectedDate: Date;
  onMealAssigned?: () => void;
}

const MEAL_TYPES: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export const MealAssignmentPanel = ({
  selectedDate,
  onMealAssigned,
}: MealAssignmentPanelProps) => {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("breakfast");
  const [specificTime, setSpecificTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

  // Fetch day plan for selected date
  const {
    data: dayPlan,
    isLoading: isDayPlanLoading,
    error: dayPlanError,
    refetch: refetchDayPlan,
  } = useDayPlan(formattedDate);

  // Mutations for creating and deleting meal assignments
  const createMealAssignmentMutation = useCreateMealAssignment();
  const deleteMealAssignmentMutation = useDeleteMealAssignment();

  const handleAssignMeal = async () => {
    if (!selectedMealId) {
      notifications.show({
        title: "Error",
        message: "Please select a meal to assign",
        color: "red",
      });
      return;
    }

    try {
      await createMealAssignmentMutation.mutateAsync({
        meal_id: selectedMealId,
        plan_date: formattedDate,
        meal_type: selectedMealType,
        specific_time: specificTime || null,
        notes: notes || null,
      });

      notifications.show({
        title: "Success",
        message: "Meal assigned successfully",
        color: "green",
      });

      // Reset form
      setSelectedMealId(null);
      setSpecificTime("");
      setNotes("");

      // Refresh data
      refetchDayPlan();
      onMealAssigned?.();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to assign meal",
        color: "red",
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteMealAssignmentMutation.mutateAsync(assignmentId);

      notifications.show({
        title: "Success",
        message: "Meal assignment removed",
        color: "green",
      });

      // Refresh data
      refetchDayPlan();
      onMealAssigned?.();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to remove meal assignment",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="sm">
      {/* Selected Date Display */}
      <Group gap="xs">
        <IconCalendar size={16} />
        <Title order={4}>
          {dayjs(selectedDate).format("dddd, MMM D, YYYY")}
        </Title>
      </Group>

      {/* Daily Summary */}
      {isDayPlanLoading ? (
        <Loader size="sm" />
      ) : dayPlanError ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          Failed to load day plan
        </Alert>
      ) : (
        <Card p="sm" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Daily Totals
              </Text>
              <Badge variant="light" color="blue">
                {Math.round(dayPlan?.total_calories || 0)} cal
              </Badge>
            </Group>

            <Group gap="xs">
              <Badge variant="light" color="green">
                {Math.round(dayPlan?.total_protein || 0)} g protein
              </Badge>
              <Badge variant="light" color="yellow">
                {Math.round(dayPlan?.total_carbohydrates || 0)} g carbs
              </Badge>
              <Badge variant="light" color="red">
                {Math.round(dayPlan?.total_fat || 0)} g fat
              </Badge>
              <Badge variant="light" color="purple">
                {Math.round(dayPlan?.total_fiber || 0)} g fiber
              </Badge>
            </Group>

            <Text size="xs" c="dimmed">
              {dayPlan?.meal_assignments?.length || 0} meals planned
            </Text>
          </Stack>
        </Card>
      )}
      {/* Planned Meals List */}
      <Card p="sm" withBorder>
        <Stack gap="sm">
          <Title order={5}>Planned Meals</Title>

          <div style={{ minHeight: "200px" }}>
            {isDayPlanLoading ? (
              <Stack align="center" justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading meals...
                </Text>
              </Stack>
            ) : (
              <PlannedMealsListForDay
                assignments={dayPlan?.meal_assignments || []}
                onDeleteAssignment={handleDeleteAssignment}
                isDeleting={deleteMealAssignmentMutation.isPending}
              />
            )}
          </div>
        </Stack>
      </Card>
      {/* Meal Assignment Form */}
      <Card p="sm" withBorder>
        <Stack gap="sm">
          <Title order={5}>Assign New Meal</Title>

          {/* Meal Search and Selection */}
          <MealSearchSelect
            value={selectedMealId}
            onChange={setSelectedMealId}
            placeholder="Search for a meal..."
          />

          {/* Meal Type Selection */}
          <Select
            label="Meal Type"
            placeholder="Select meal type"
            data={MEAL_TYPES}
            value={selectedMealType}
            onChange={(value: string | null) =>
              setSelectedMealType((value as MealType) || "breakfast")
            }
            required
          />

          {/* Specific Time (Optional) */}
          <TimeInput
            label="Specific Time (Optional)"
            value={specificTime}
            onChange={(event: any) =>
              setSpecificTime(event?.currentTarget?.value || "")
            }
          />

          {/* Notes (Optional) */}
          <Textarea
            label="Notes (Optional)"
            placeholder="Add any notes about this meal assignment..."
            value={notes}
            onChange={(event: any) => setNotes(event.currentTarget.value)}
          />

          {/* Assign Button */}
          <Button
            onClick={handleAssignMeal}
            disabled={!selectedMealId}
            loading={createMealAssignmentMutation.isPending}
            leftsection={<IconPlus size={16} />}
            fullWidth
          >
            Assign Meal
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
};
