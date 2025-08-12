import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Text,
  ActionIcon,
  Badge,
  Alert,
  Loader,
} from '@/shared/ui-kit';
import { 
  IconSearch, 
  IconPlus, 
  IconTrash, 
} from '@tabler/icons-react';
import { notifications } from '@/shared/ui-kit';

import { searchIngredients, ingredientApi } from '@/entities/ingredient/api/ingredientApi';
import { AddEditIngredientForm } from '@/features/ingredients-management/ui';
import type { Ingredient } from '@/entities/ingredient/model/types';

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  error?: string;
}

const IngredientSelector = ({
  selectedIngredients,
  onIngredientsChange,
  error
}: IngredientSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ingredientCache, setIngredientCache] = useState<Map<string, Ingredient>>(new Map());

  // Search ingredients with debounce
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await searchIngredients(searchTerm, 10);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Failed to search ingredients:', error);
          notifications.show({
            title: 'Search Error',
            message: 'Failed to search ingredients. Please try again.',
            color: 'red',
          });
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Load ingredient details for selected IDs
  useEffect(() => {
    const loadMissingIngredients = async () => {
      const missingIds = selectedIngredients.filter(id => !ingredientCache.has(id));
      
      if (missingIds.length === 0) return;

      try {
        const ingredients = await Promise.all(
          missingIds.map(id => ingredientApi.getIngredient(id))
        );
        
        setIngredientCache(prev => {
          const newCache = new Map(prev);
          ingredients.forEach(ingredient => {
            newCache.set(ingredient.id, ingredient);
          });
          return newCache;
        });
      } catch (error) {
        console.warn('Failed to load ingredient details:', error);
      }
    };

    loadMissingIngredients();
  }, [selectedIngredients, ingredientCache]);

  const addIngredient = (ingredient: Ingredient) => {
    if (selectedIngredients.includes(ingredient.id)) {
      notifications.show({
        title: 'Ingredient Already Added',
        message: 'This ingredient is already in the list',
        color: 'orange',
      });
      return;
    }

    // Cache the ingredient data
    setIngredientCache(prev => new Map(prev).set(ingredient.id, ingredient));
    
    // Add ingredient ID to selection
    onIngredientsChange([...selectedIngredients, ingredient.id]);
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeIngredient = (ingredientId: string) => {
    onIngredientsChange(selectedIngredients.filter(id => id !== ingredientId));
  };

  const getIngredientName = (ingredientId: string): string => {
    return ingredientCache.get(ingredientId)?.name || 'Loading...';
  };

  const handleNewIngredientSuccess = () => {
    setIsAddModalOpen(false);
    // Refresh search if there's a term
    if (searchTerm.trim().length >= 2) {
      const currentTerm = searchTerm;
      setSearchTerm('');
      setTimeout(() => setSearchTerm(currentTerm), 100);
    }
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <Card withBorder p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>Add Ingredients</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Ingredient
            </Button>
          </Group>

          <TextInput
            label="Search Ingredients"
            placeholder="Type to search ingredients..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={isSearching ? <Loader size="xs" /> : null}
            description="Minimum 2 characters required"
          />

          {/* No Results */}
          {searchTerm.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
            <Alert color="blue" title="No ingredients found">
              No ingredients found matching "{searchTerm}". Try a different search term.
            </Alert>
          )}
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card withBorder>
              <Stack gap="xs">
                <Text size="sm" fw={500}>Search Results:</Text>
                {searchResults.map((ingredient) => (
                  <Group
                    key={ingredient.id}
                    justify="space-between"
                    p="xs"
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                    onClick={() => addIngredient(ingredient)}
                    className="hover:bg-surface-800/60"
                  >
                    <div>
                      <Text size="sm">{ingredient.name}</Text>
                      <Text size="xs" c="dimmed">
                        {ingredient.calories_per_100g_or_ml} kcal/100g
                        {ingredient.shops.length > 0 && ` • ${ingredient.shops[0]}`}
                      </Text>
                    </div>
                    <Badge size="xs" variant="light">
                      Add
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Card>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <Card withBorder p="md">
          <Stack gap="md">
            <Text fw={500}>Selected Ingredients ({selectedIngredients.length})</Text>
            
            <Stack gap="xs">
              {selectedIngredients.map((ingredientId) => (
                <Group key={ingredientId} justify="space-between" p="xs" style={{ borderRadius: '4px' }} className="bg-surface-800/40">
                  <Text size="sm">{getIngredientName(ingredientId)}</Text>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => removeIngredient(ingredientId)}
                    aria-label="Remove ingredient"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Add New Ingredient Modal */}
      <AddEditIngredientForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleNewIngredientSuccess}
      />
    </Stack>
  );
};

export default IngredientSelector;
