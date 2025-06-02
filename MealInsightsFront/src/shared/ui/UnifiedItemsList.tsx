/**
 * Unified list component for both ingredients and products
 */
import { useState } from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Card,
  ActionIcon,
  Menu,
  Image,
  SimpleGrid,
  Loader,
  Center,
  Title,
  Select,
  TextInput,
  MultiSelect,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconSearch,
  IconPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import type { UnifiedItem, UnifiedItemFilters } from '@/shared/lib/types';
import { getItemTypeLabel, getItemAdditionalInfo } from '@/shared/lib/utils/unifiedItems';
import { DietTagEnum } from '@/shared/lib/types';

interface UnifiedItemsListProps {
  items: UnifiedItem[];
  isLoading?: boolean;
  onEdit?: (item: UnifiedItem) => void;
  onDelete?: (item: UnifiedItem) => void;
  onView?: (item: UnifiedItem) => void;
  onAddIngredient?: () => void;
  onAddProduct?: () => void;
  filters?: UnifiedItemFilters;
  onFiltersChange?: (filters: UnifiedItemFilters) => void;
  showFilters?: boolean;
}

const dietTagOptions = Object.values(DietTagEnum).map(tag => ({
  value: tag,
  label: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const UnifiedItemsList = ({
  items,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onAddIngredient,
  onAddProduct,
  filters = {},
  onFiltersChange,
  showFilters = true,
}: UnifiedItemsListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleFilterChange = (key: keyof UnifiedItemFilters, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const handleDelete = async (item: UnifiedItem) => {
    if (deleteConfirm !== item.id) {
      setDeleteConfirm(item.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await onDelete?.(item);
      setDeleteConfirm(null);
      notifications.show({
        title: 'Success',
        message: `${getItemTypeLabel(item.type)} deleted successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to delete ${item.type}`,
        color: 'red',
      });
    }
  };

  const getItemTypeColor = (type: 'ingredient' | 'product') => {
    return type === 'ingredient' ? 'green' : 'blue';
  };

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  // Ensure button handlers are correctly passed
  console.log('UnifiedItemsList handlers:', { onAddIngredient: !!onAddIngredient, onAddProduct: !!onAddProduct });
  return (
    <Stack gap="md">
      {/* Header with Add Buttons */}
      <Group justify="space-between">
        <Title order={3}>Items Management</Title>
        <Group>
          {onAddIngredient && (
            <Button leftSection={<IconPlus size={16} />} variant="outline" color="green" onClick={onAddIngredient}>
              Add Ingredient
            </Button>
          )}
          {onAddProduct && (
            <Button leftSection={<IconPlus size={16} />} variant="outline" color="blue" onClick={onAddProduct}>
              Add Product
            </Button>
          )}
        </Group>
      </Group>

      {/* Filters */}
      {showFilters && (
        <Card withBorder p="md">
          <Group grow>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search by name..."
              value={filters.name_filter || ''}
              onChange={(event) => handleFilterChange('name_filter', event.currentTarget.value)}
            />
            
            <Select
              placeholder="Filter by type"
              data={[
                { value: 'all', label: 'All Types' },
                { value: 'ingredient', label: 'Ingredients' },
                { value: 'product', label: 'Products' },
              ]}
              value={filters.type_filter || 'all'}
              onChange={(value) => handleFilterChange('type_filter', value)}
              clearable
            />
            
            <MultiSelect
              placeholder="Filter by tags"
              data={dietTagOptions}
              value={filters.tag_filter || []}
              onChange={(value) => handleFilterChange('tag_filter', value)}
              searchable
              clearable
            />
          </Group>
        </Card>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <Center h={200}>
          <Stack align="center" gap="sm">
            <Text size="lg" c="dimmed">No items found</Text>
            <Text size="sm" c="dimmed">
              {filters.name_filter || filters.type_filter !== 'all' || filters.tag_filter?.length
                ? 'Try adjusting your filters'
                : 'Add some ingredients or products to get started'
              }
            </Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {items.map((item) => (
            <Card key={item.id} withBorder shadow="sm" radius="md">
              <Card.Section>
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    height={120}
                    alt={item.name}
                    fallbackSrc="/placeholder-image.png"
                  />
                ) : (
                  <div
                    style={{
                      height: 120,
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text size="sm" c="dimmed">
                      No image
                    </Text>
                  </div>
                )}
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={500} lineClamp={2}>
                      {item.name}
                    </Text>
                    <Badge
                      color={getItemTypeColor(item.type)}
                      variant="light"
                      size="sm"
                    >
                      {getItemTypeLabel(item.type)}
                    </Badge>
                  </Stack>

                  <Menu shadow="md" width={160}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      {onView && (
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView(item)}>
                          View Details
                        </Menu.Item>
                      )}
                      {onEdit && (
                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(item)}>
                          Edit
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color={deleteConfirm === item.id ? 'red' : undefined}
                          onClick={() => handleDelete(item)}
                        >
                          {deleteConfirm === item.id ? 'Confirm Delete' : 'Delete'}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                <Text size="xs" c="dimmed">
                  {getItemAdditionalInfo(item)}
                </Text>

                {item.calories_per_100g_or_ml && (
                  <Text size="xs" c="dimmed">
                    {item.calories_per_100g_or_ml} cal/100g
                  </Text>
                )}

                {item.tags.length > 0 && (
                  <Group gap={4}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} size="xs" variant="dot">
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge size="xs" variant="outline">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};

export default UnifiedItemsList;
