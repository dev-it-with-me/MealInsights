import React from 'react';
import { 
  Paper, 
  Group, 
  TextInput, 
  Select, 
  MultiSelect, 
  Button, 
  Stack,
  Title,
  Divider,
  NumberInput,
  Grid
} from '@mantine/core';
import { IconSearch, IconFilter, IconX, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import type { DietTag } from '@/shared/lib/types';
import { DietTagEnum } from '@/shared/lib/types';

export interface FilterSortState {
  searchTerm: string;
  shopFilter: string;
  dietTagsFilter: DietTag[];
  caloriesMin: number | null;
  caloriesMax: number | null;
  sortBy: 'name' | 'calories' | 'shop' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

interface IngredientFilterSortPanelProps {
  filters: FilterSortState;
  onFiltersChange: (filters: FilterSortState) => void;
  availableShops: string[];
  isLoading?: boolean;
}

const IngredientFilterSortPanel: React.FC<IngredientFilterSortPanelProps> = ({
  filters,
  onFiltersChange,
  availableShops,
  isLoading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value,
    });
  };

  const handleShopFilterChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      shopFilter: value || '',
    });
  };

  const handleDietTagsChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      dietTagsFilter: values as DietTag[],
    });
  };

  const handleCaloriesMinChange = (value: number | string) => {
    onFiltersChange({
      ...filters,
      caloriesMin: typeof value === 'number' ? value : null,
    });
  };

  const handleCaloriesMaxChange = (value: number | string) => {
    onFiltersChange({
      ...filters,
      caloriesMax: typeof value === 'number' ? value : null,
    });
  };

  const handleSortByChange = (value: string | null) => {
    if (value) {
      onFiltersChange({
        ...filters,
        sortBy: value as FilterSortState['sortBy'],
      });
    }
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      shopFilter: '',
      dietTagsFilter: [],
      caloriesMin: null,
      caloriesMax: null,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.shopFilter || 
    filters.dietTagsFilter.length > 0 || 
    filters.caloriesMin !== null || 
    filters.caloriesMax !== null;

  const dietTagOptions = Object.values(DietTagEnum).map((tag) => ({
    value: tag,
    label: tag.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  const shopOptions = availableShops.map((shop) => ({
    value: shop,
    label: shop,
  }));

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'calories', label: 'Calories' },
    { value: 'shop', label: 'Shop' },
    { value: 'created_at', label: 'Date Added' },
  ];

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={4}>
            <Group gap="xs">
              <IconFilter size={20} />
              Filters & Sort
            </Group>
          </Title>
          {hasActiveFilters && (
            <Button
              variant="light"
              color="gray"
              size="xs"
              leftSection={<IconX size={14} />}
              onClick={clearAllFilters}
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Search ingredients"
              placeholder="Search by name..."
              value={filters.searchTerm}
              onChange={(event) => handleSearchChange(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Select
              label="Shop"
              placeholder="All shops"
              value={filters.shopFilter || null}
              onChange={handleShopFilterChange}
              data={shopOptions}
              clearable
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <MultiSelect
              label="Diet tags"
              placeholder="Select diet tags"
              value={filters.dietTagsFilter}
              onChange={handleDietTagsChange}
              data={dietTagOptions}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <NumberInput
              label="Min calories (per 100g)"
              placeholder="0"
              value={filters.caloriesMin ?? undefined}
              onChange={handleCaloriesMinChange}
              min={0}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <NumberInput
              label="Max calories (per 100g)"
              placeholder="1000"
              value={filters.caloriesMax ?? undefined}
              onChange={handleCaloriesMaxChange}
              min={0}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Group grow>
              <Select
                label="Sort by"
                value={filters.sortBy}
                onChange={handleSortByChange}
                data={sortOptions}
                disabled={isLoading}
              />
              <div>
                <div style={{ height: '1.375rem' }} /> {/* Spacer for label alignment */}
                <Button
                  variant="light"
                  onClick={toggleSortOrder}
                  leftSection={
                    filters.sortOrder === 'asc' ? 
                      <IconSortAscending size={16} /> : 
                      <IconSortDescending size={16} />
                  }
                  disabled={isLoading}
                  fullWidth
                >
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default IngredientFilterSortPanel;
