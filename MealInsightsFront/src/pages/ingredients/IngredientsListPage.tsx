import { useState, useEffect, useMemo } from 'react';
import { Container, Stack, Title, Group, Text, Pagination } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconList } from '@tabler/icons-react';
import { 
  AllIngredientsList, 
  IngredientFilterSortPanel,
  type FilterSortState 
} from '@/features/ingredients-management/ui';
import { getAllIngredients } from '@/entities/ingredient/api/ingredientApi';
import type { Ingredient } from '@/entities/ingredient/model/types';

const ITEMS_PER_PAGE = 20;

const IngredientsListPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterSortState>({
    searchTerm: '',
    shopFilter: '',
    dietTagsFilter: [],
    caloriesMin: null,
    caloriesMax: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const response = await getAllIngredients();
      setIngredients(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load ingredients',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique shops for filter options
  const availableShops = useMemo(() => {
    const shops = new Set<string>();
    ingredients.forEach(ingredient => {
      if (ingredient.shop) {
        shops.add(ingredient.shop);
      }
    });
    return Array.from(shops).sort();
  }, [ingredients]);

  // Filter and sort ingredients
  const filteredAndSortedIngredients = useMemo(() => {
    let filtered = [...ingredients];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchLower) ||
        (ingredient.shop && ingredient.shop.toLowerCase().includes(searchLower))
      );
    }

    // Apply shop filter
    if (filters.shopFilter) {
      filtered = filtered.filter(ingredient => ingredient.shop === filters.shopFilter);
    }

    // Apply diet tags filter
    if (filters.dietTagsFilter.length > 0) {
      filtered = filtered.filter(ingredient =>
        ingredient.tags && 
        filters.dietTagsFilter.some(tag => ingredient.tags!.includes(tag))
      );
    }

    // Apply calories filter
    if (filters.caloriesMin !== null) {
      filtered = filtered.filter(ingredient => 
        ingredient.calories_per_100g_or_ml && ingredient.calories_per_100g_or_ml >= filters.caloriesMin!
      );
    }

    if (filters.caloriesMax !== null) {
      filtered = filtered.filter(ingredient => 
        ingredient.calories_per_100g_or_ml && ingredient.calories_per_100g_or_ml <= filters.caloriesMax!
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'calories':
          const aCalories = a.calories_per_100g_or_ml || 0;
          const bCalories = b.calories_per_100g_or_ml || 0;
          comparison = aCalories - bCalories;
          break;
        case 'shop':
          const aShop = a.shop || '';
          const bShop = b.shop || '';
          comparison = aShop.localeCompare(bShop);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [ingredients, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedIngredients.length / ITEMS_PER_PAGE);
  const paginatedIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedIngredients.slice(startIndex, endIndex);
  }, [filteredAndSortedIngredients, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterSortState) => {
    setFilters(newFilters);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Group gap="sm">
              <IconList size={32} color="#339af0" />
              <Title order={1}>Ingredients Database</Title>
            </Group>
            <Text c="dimmed" size="lg">
              Browse and search through all available ingredients
            </Text>
          </Stack>
        </Group>

        {/* Filter and Sort Panel */}
        <IngredientFilterSortPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableShops={availableShops}
          isLoading={isLoading}
        />

        {/* Results Summary */}
        <Group justify="space-between" align="center">
          <Text c="dimmed">
            Showing {paginatedIngredients.length} of {filteredAndSortedIngredients.length} ingredients
            {filteredAndSortedIngredients.length !== ingredients.length && 
              ` (filtered from ${ingredients.length} total)`
            }
          </Text>
          {totalPages > 1 && (
            <Text c="dimmed" size="sm">
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </Group>

        {/* Ingredients List */}
        <AllIngredientsList
          ingredients={paginatedIngredients}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="md"
              disabled={isLoading}
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
};

export default IngredientsListPage;
