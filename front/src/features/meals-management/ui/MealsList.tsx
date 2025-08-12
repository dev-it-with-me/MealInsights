import { 
  Card, 
  Group, 
  Text, 
  Button, 
  Stack, 
  Badge, 
  Image, 
  Menu,
  ActionIcon,
  SimpleGrid
} from '@/shared/ui-kit';
import { 
  IconEdit, 
  IconTrash, 
  IconDotsVertical, 
  IconFlame, 
  IconUsers 
} from '@tabler/icons-react';
import { 
  IconChefHat
} from '@tabler/icons-react';
import { modals } from '@/shared/ui-kit';
import type { MealListItem } from '@/entities/meal/model/types';

interface MealsListProps {
  meals: MealListItem[];
  onEdit: (meal: MealListItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const MealsList = ({ meals, onEdit, onDelete, isLoading = false }: MealsListProps) => {
  const handleDeleteClick = (meal: MealListItem) => {
    modals.openConfirmModal({
      title: 'Delete Meal',
      children: (
        <Text>
          Are you sure you want to delete "{meal.name}"? This action cannot be undone.
        </Text>
      ),
  // Minimal API supports only title/children/onConfirm
      onConfirm: () => onDelete(meal.id),
    });
  };

  const formatCalories = (calories?: number | null) => {
    return calories ? `${Math.round(calories)} cal` : 'N/A';
  };

  const formatTags = (tags: string[]) => {
    return tags.slice(0, 3); // Show max 3 tags
  };

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
            <div>
              <div style={{ height: 120, backgroundColor: '#f1f3f4' }} />
            </div>
            <Stack gap="xs" mt="md">
              <div style={{ height: 20, backgroundColor: '#f1f3f4', borderRadius: 4 }} />
              <div style={{ height: 16, backgroundColor: '#f1f3f4', borderRadius: 4, width: '60%' }} />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (meals.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Stack align="center" gap="md">
          <IconChefHat size={48} color="gray" />
          <Text size="lg" fw={500} c="dimmed">
            No meals found
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Start by creating your first meal to build your recipe collection.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {meals.map((meal) => (
        <Card key={meal.id} shadow="sm" padding="lg" radius="md" withBorder>
          <div>
            {meal.photo_data ? (
              <Image
                src={`data:image/jpeg;base64,${meal.photo_data}`}
                height={120}
                alt={meal.name}
                fit="cover"
              />
            ) : (
              <div 
                style={{ 
                  height: 120, 
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconChefHat size={32} color="gray" />
              </div>
            )}
            </div>

          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500} size="lg" lineClamp={1}>
              {meal.name}
            </Text>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<IconEdit size={14} />}
                  onClick={() => onEdit(meal)}
                >
                  Edit
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => handleDeleteClick(meal)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Stack gap="xs">
            <Group gap="lg">
              <Group gap="xs">
                <IconUsers size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  {meal.ingredient_count} ingredients
                </Text>
              </Group>
              <Group gap="xs">
                <IconFlame size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  {formatCalories(meal.calories_total)}
                </Text>
              </Group>
            </Group>

            {meal.tags.length > 0 && (
              <Group gap="xs">
                {formatTags(meal.tags).map((tag) => (
                  <Badge key={tag} size="xs" variant="light">
                    {tag.replace('_', ' ')}
                  </Badge>
                ))}
                {meal.tags.length > 3 && (
                  <Badge size="xs" variant="outline" color="gray">
                    +{meal.tags.length - 3}
                  </Badge>
                )}
              </Group>
            )}
          </Stack>

          <Group justify="space-between" mt="md">
            <Button 
              variant="light" 
              size="sm"
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit(meal)}
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => handleDeleteClick(meal)}
            >
              Delete
            </Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default MealsList;
