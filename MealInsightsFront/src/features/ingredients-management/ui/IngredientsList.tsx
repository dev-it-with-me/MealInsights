/**
 * List of Dynamic Objects C1001.IngredientsList
 * Displays existing ingredients with options to edit or delete
 */
import { useState } from 'react';
import {
  Table,
  Badge,
  Group,
  ActionIcon,
  Text,
  Image,
  Alert,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';

import { Card, LoadingSpinner } from '@/shared/ui';
import type { DietTag } from '@/shared/lib/types';
import { DietTagEnum } from '@/shared/lib/types';
import type { Ingredient } from '@/entities/ingredient/model/types';
import { ingredientApi } from '@/entities/ingredient/api/ingredientApi';

interface IngredientsListProps {
  ingredients: Ingredient[];
  loading?: boolean;
  isLoading?: boolean;
  onEditClick?: (ingredient: Ingredient) => void;
  onDeleteClick?: (ingredientId: string) => Promise<void>;
  onEdit?: (ingredient: Ingredient) => void;
  onRefresh?: () => void;
}

const IngredientsList = ({ 
  ingredients, 
  loading = false,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  onEdit, 
  onRefresh 
}: IngredientsListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const actualLoading = loading || isLoading;

  const formatMacros = (macros: { protein: number; carbohydrates: number; fat: number }) => {
    return `P: ${macros.protein}g, C: ${macros.carbohydrates}g, F: ${macros.fat}g`;
  };

  const formatTags = (tags: DietTag[]) => {
    return tags.map(tag => (
      <Badge
        key={tag}
        variant="light"
        size="xs"
        color={getTagColor(tag)}
      >
        {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    ));
  };

  const getTagColor = (tag: DietTag): string => {
    const colorMap: Record<string, string> = {
      [DietTagEnum.VEGETARIAN]: 'green',
      [DietTagEnum.VEGAN]: 'lime',
      [DietTagEnum.GLUTEN_FREE]: 'orange',
      [DietTagEnum.DAIRY_FREE]: 'cyan',
      [DietTagEnum.MEAT]: 'red',
      [DietTagEnum.FISH]: 'blue',
      [DietTagEnum.FRUIT]: 'pink',
      [DietTagEnum.VEGETABLE]: 'teal',
      [DietTagEnum.HIGH_PROTEIN]: 'violet',
    };
    return colorMap[tag] || 'gray';
  };

  // E3021 - DeleteIngredientButton handler
  const handleDelete = async (ingredient: Ingredient) => {
    if (onDeleteClick) {
      // Use external delete handler
      try {
        await onDeleteClick(ingredient.id);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to delete ingredient',
          color: 'red',
        });
      }
      return;
    }

    // Use internal delete handler with modal
    modals.openConfirmModal({
      title: 'Delete Ingredient',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{ingredient.name}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setDeletingId(ingredient.id);
        try {
          await ingredientApi.deleteIngredient(ingredient.id);
          notifications.show({
            title: 'Success',
            message: 'Ingredient deleted successfully!',
            color: 'green',
          });
          onRefresh?.();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete ingredient',
            color: 'red',
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleEdit = (ingredient: Ingredient) => {
    if (onEditClick) {
      onEditClick(ingredient);
    } else if (onEdit) {
      onEdit(ingredient);
    }
  };

  if (actualLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (ingredients.length === 0) {
    return (
      <Alert variant="light" color="blue" title="No ingredients found">
        Start by adding your first ingredient!
      </Alert>
    );
  }

  return (
    <Card>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Photo</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Shops</Table.Th>
            <Table.Th>Calories/100g</Table.Th>
            <Table.Th>Macros/100g</Table.Th>
            <Table.Th>Tags</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ingredients.map((ingredient) => (
            <Table.Tr key={ingredient.id}>
              {/* PhotoColumn */}
              <Table.Td>
                {ingredient.photo_data ? (
                  <Image
                    src={`data:image/jpeg;base64,${btoa(
                      String.fromCharCode(...Array.from(ingredient.photo_data))
                    )}`}
                    alt={ingredient.name}
                    w={40}
                    h={40}
                    radius="sm"
                  />
                ) : (
                  <IconPhoto size={40} color="gray" />
                )}
              </Table.Td>

              {/* NameColumn */}
              <Table.Td>
                <Text fw={500}>{ingredient.name}</Text>
              </Table.Td>

              {/* ShopsColumn */}
              <Table.Td>
                {ingredient.shops && ingredient.shops.length > 0 ? (
                  <Group gap={4} wrap="wrap">
                    {ingredient.shops.map((shop, index) => (
                      <Badge
                        key={index}
                        size="xs"
                        variant="light"
                        color="gray"
                      >
                        {shop}
                      </Badge>
                    ))}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    Not specified
                  </Text>
                )}
              </Table.Td>

              {/* CaloriesColumn */}
              <Table.Td>
                <Text size="sm">{ingredient.calories_per_100g_or_ml} kcal</Text>
              </Table.Td>

              {/* MacrosColumn */}
              <Table.Td>
                <Text size="xs" c="dimmed">
                  {formatMacros(ingredient.macros_per_100g_or_ml)}
                </Text>
              </Table.Td>

              {/* TagsColumn */}
              <Table.Td>
                <Group gap={4}>
                  {ingredient.tags.length > 0 ? (
                    formatTags(ingredient.tags)
                  ) : (
                    <Text size="xs" c="dimmed">No tags</Text>
                  )}
                </Group>
              </Table.Td>

              {/* ActionsColumn */}
              <Table.Td>
                <Group gap={8}>
                  {/* E3020 - EditIngredientButton */}
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(ingredient)}
                    aria-label="Edit ingredient"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>

                  {/* E3021 - DeleteIngredientButton */}
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(ingredient)}
                    loading={deletingId === ingredient.id}
                    aria-label="Delete ingredient"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};

export default IngredientsList;
