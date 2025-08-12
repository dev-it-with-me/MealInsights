import React from 'react';
import { Table, Badge, Text, Group, Paper, Stack, Center } from '@/shared/ui-kit';
import { IconPhoto } from '@tabler/icons-react';
import type { Ingredient } from '@/entities/ingredient/model/types';
import type { DietTag } from '@/shared/lib/types';
import { DietTagEnum } from '@/shared/lib/types';
import { LoadingSpinner } from '@/shared/ui';

interface AllIngredientsListProps {
  ingredients: Ingredient[];
  isLoading?: boolean;
}

const AllIngredientsList: React.FC<AllIngredientsListProps> = ({
  ingredients,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (ingredients.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Text c="dimmed" size="lg">
            No ingredients found
          </Text>
        </Center>
      </Paper>
    );
  }

  const formatMacros = (ingredient: Ingredient) => {
    if (!ingredient.macros_per_100g_or_ml) return 'N/A';
    
    const { carbohydrates, protein, fat } = ingredient.macros_per_100g_or_ml;
    return `C: ${carbohydrates}g | P: ${protein}g | F: ${fat}g`;
  };

  const getDietTagBadgeColor = (tag: DietTag) => {
    switch (tag) {
      case DietTagEnum.VEGAN:
        return 'green';
      case DietTagEnum.VEGETARIAN:
        return 'lime';
      case DietTagEnum.GLUTEN_FREE:
        return 'yellow';
      case DietTagEnum.DAIRY_FREE:
        return 'orange';
      case DietTagEnum.KETO:
        return 'purple';
      case DietTagEnum.PALEO:
        return 'brown';
      case DietTagEnum.LOW_CARB:
        return 'blue';
      case DietTagEnum.HIGH_PROTEIN:
        return 'red';
      default:
        return 'gray';
    }
  };

  const rows = ingredients.map((ingredient) => (
    <Table.Tr key={ingredient.id}>
      <Table.Td>
        <Group gap="sm">
          {ingredient.photo_url ? (
            <img
              src={ingredient.photo_url}
              alt={ingredient.name}
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                objectFit: 'cover',
              }}
            />
          ) : (
            <Center
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#f1f3f4',
                borderRadius: 4,
              }}
            >
              <IconPhoto size={20} color="#9ca3af" />
            </Center>
          )}
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {ingredient.name}
            </Text>
            {ingredient.shops && ingredient.shops.length > 0 && (
              <Group gap={4}>
                {ingredient.shops.slice(0, 2).map((shop, index) => (
                  <Text key={index} size="xs" c="dimmed">
                    {shop}
                  </Text>
                ))}
                {ingredient.shops.length > 2 && (
                  <Text size="xs" c="dimmed">
                    +{ingredient.shops.length - 2} more
                  </Text>
                )}
              </Group>
            )}
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {ingredient.calories_per_100g_or_ml || 'N/A'} kcal
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {formatMacros(ingredient)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {ingredient.tags && ingredient.tags.length > 0 ? (
            ingredient.tags.map((tag) => (
              <Badge
                key={tag}
                size="xs"
                color={getDietTagBadgeColor(tag)}
                variant="light"
              >
                {tag.replace('_', ' ')}
              </Badge>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              No tags
            </Text>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper withBorder>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ingredient</Table.Th>
            <Table.Th>Calories (per 100g)</Table.Th>
            <Table.Th>Macros (per 100g)</Table.Th>
            <Table.Th>Diet Tags</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Paper>
  );
};

export default AllIngredientsList;
