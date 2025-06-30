import {
  Stack,
  Card,
  Text,
  Badge,
  Group,
  ActionIcon,
  Alert,
} from '@mantine/core';
import { IconTrash, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';
import type { MealAssignment } from '../../entities/diet-planning/model/types';

export interface PlannedMealsListForDayProps {
  assignments: MealAssignment[];
  onDeleteAssignment: (assignmentId: string) => void;
  isDeleting?: boolean;
}

const MEAL_TYPE_COLORS = {
  breakfast: 'orange',
  lunch: 'green',
  dinner: 'blue',
  snack: 'grape',
} as const;

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',  
} as const;

export const PlannedMealsListForDay = ({
  assignments,
  onDeleteAssignment,
  isDeleting = false,
}: PlannedMealsListForDayProps) => {
  const handleDeleteClick = (assignment: MealAssignment) => {
    modals.openConfirmModal({
      title: 'Remove Meal Assignment',
      children: (
        <Text size="sm">
          Are you sure you want to remove <strong>{assignment.meal?.name}</strong> from your {MEAL_TYPE_LABELS[assignment.meal_type]}?
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => onDeleteAssignment(assignment.id),
    });
  };

  // Sort assignments by meal type order and creation time
  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const sortedAssignments = [...assignments].sort((a, b) => {
    const aOrder = mealTypeOrder.indexOf(a.meal_type);
    const bOrder = mealTypeOrder.indexOf(b.meal_type);
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same meal type, sort by creation time
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  if (assignments.length === 0) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light">
        <Text size="sm">No meals planned for this day.</Text>
        <Text size="xs" c="dimmed" mt="xs">
          Use the form above to assign meals to this day.
        </Text>
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {sortedAssignments.map((assignment) => (
        <Card key={assignment.id} p="sm" withBorder>
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs" style={{ flex: 1 }}>
                {/* Meal Type Badge */}
                <Badge 
                  size="sm" 
                  variant="light" 
                  color={MEAL_TYPE_COLORS[assignment.meal_type]}
                >
                  {MEAL_TYPE_LABELS[assignment.meal_type]}
                </Badge>

                {/* Meal Name */}
                <Text size="sm" fw={500} lineClamp={2}>
                  {assignment.meal_name || 'Unknown Meal'}
                </Text>

                {/* Meal Details */}
                {assignment.meal && (
                  <Group gap="md">
                    {assignment.meal.calories && (
                      <Badge size="xs" variant="dot" color="green">
                        {Math.round(assignment.meal.calories)} cal
                      </Badge>
                    )}
                    {assignment.meal.protein && (
                      <Badge size="xs" variant="dot" color="blue">
                        {Math.round(assignment.meal.protein)}g protein
                      </Badge>
                    )}
                    {assignment.meal.carbohydrates && (
                      <Badge size="xs" variant="dot" color="orange">
                        {Math.round(assignment.meal.carbohydrates)}g carbs
                      </Badge>
                    )}
                    {assignment.meal.fat && (
                      <Badge size="xs" variant="dot" color="red">
                        {Math.round(assignment.meal.fat)}g fat
                      </Badge>
                    )}
                  </Group>
                )}

                {/* Tags */}
                {assignment.meal?.tags && assignment.meal.tags.length > 0 && (
                  <Group gap="xs">
                    {assignment.meal.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} size="xs" variant="outline" color="gray">
                        {tag}
                      </Badge>
                    ))}
                    {assignment.meal.tags.length > 2 && (
                      <Text size="xs" c="dimmed">
                        +{assignment.meal.tags.length - 2} more
                      </Text>
                    )}
                  </Group>
                )}

                {/* Assignment Time */}
                <Group gap="xs">
                  <IconClock size={12} />
                  {assignment.specific_time ? (
                    <Text size="xs" c="dimmed">
                      Scheduled for {assignment.specific_time}
                    </Text>
                  ) : (
                    <Text size="xs" c="dimmed">
                      {MEAL_TYPE_LABELS[assignment.meal_type]} (no specific time)
                    </Text>
                  )}
                </Group>

                {/* Notes */}
                {assignment.notes && (
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    📝 {assignment.notes}
                  </Text>
                )}

                {/* Created timestamp */}
                {assignment.created_at && (
                  <Text size="xs" c="dimmed" opacity={0.7}>
                    Added {dayjs(assignment.created_at).format('MMM D, h:mm A')}
                  </Text>
                )}
              </Stack>

              {/* Delete Button */}
              <ActionIcon
                color="red"
                variant="light"
                size="sm"
                onClick={() => handleDeleteClick(assignment)}
                disabled={isDeleting}
                loading={isDeleting}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Card>
        ))}
      </Stack>
  );
};
