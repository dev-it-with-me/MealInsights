import { useState, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Group,
  Button,
  Select,
  NumberInput,
  Table,
  ActionIcon,
  Text,
  Card,
  Badge,
  Loader,
  ScrollArea,
  Paper,
} from '@/shared/ui-kit';
import { useDebouncedValue } from '@/shared/ui-kit';
import { notifications } from '@/shared/ui-kit';
import { IconSearch, IconPlus, IconTrash, IconShoppingCart, IconLeaf } from '@tabler/icons-react';
import { ingredientApi } from '@/entities/ingredient/api/ingredientApi';
import { productApi } from '@/entities/product/api/productApi';
import type { Ingredient } from '@/entities/ingredient/model/types';
import type { Product } from '@/entities/product/model/types';

export interface MealIngredient {
  id: string;
  name: string;
  type: 'ingredient' | 'product';
  quantity: number;
  unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  sugar_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  saturated_fat_per_100g: number;
}

interface SearchResult {
  id: string;
  name: string;
  type: 'ingredient' | 'product';
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  sugar_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  saturated_fat_per_100g: number;
  tags: string[];
  brand?: string | null;
}

interface IngredientSelectorForMealProps {
  selectedIngredients: MealIngredient[];
  onIngredientsChange: (ingredients: MealIngredient[]) => void;
}

const UNIT_OPTIONS = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'cup', label: 'Cup' },
  { value: 'tablespoon', label: 'Tablespoon' },
  { value: 'teaspoon', label: 'Teaspoon' },
];

export const IngredientSelectorForMeal = ({ 
  selectedIngredients, 
  onIngredientsChange 
}: IngredientSelectorForMealProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');

  // Search for ingredients and products
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const [ingredientsResponse, productsResponse] = await Promise.all([
          ingredientApi.getIngredients({ 
            name_filter: debouncedSearch, 
            limit: 20 
          }),
          productApi.getProducts({ 
            name_filter: debouncedSearch, 
            limit: 20 
          })
        ]);

        const ingredients: SearchResult[] = ingredientsResponse.ingredients.map((ingredient: Ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          type: 'ingredient' as const,
          calories_per_100g: ingredient.calories_per_100g_or_ml || 0,
          protein_per_100g: ingredient.macros_per_100g_or_ml?.protein || 0,
          carbs_per_100g: ingredient.macros_per_100g_or_ml?.carbohydrates || 0,
          sugar_per_100g: ingredient.macros_per_100g_or_ml?.sugar || 0,
          fat_per_100g: ingredient.macros_per_100g_or_ml?.fat || 0,
          fiber_per_100g: ingredient.macros_per_100g_or_ml?.fiber || 0,
          saturated_fat_per_100g: ingredient.macros_per_100g_or_ml?.saturated_fat || 0,
          tags: ingredient.tags || [],
        }));

        const products: SearchResult[] = productsResponse.products.map((product: Product) => ({
          id: product.id,
          name: product.name,
          type: 'product' as const,
          calories_per_100g: product.calories_per_100g_or_ml || 0,
          protein_per_100g: product.macros_per_100g_or_ml?.protein || 0,
          carbs_per_100g: product.macros_per_100g_or_ml?.carbohydrates || 0,
          sugar_per_100g: product.macros_per_100g_or_ml?.sugar || 0,
          fat_per_100g: product.macros_per_100g_or_ml?.fat || 0,
          fiber_per_100g: product.macros_per_100g_or_ml?.fiber || 0,
          saturated_fat_per_100g: product.macros_per_100g_or_ml?.saturated_fat || 0,
          tags: product.tags || [],
          brand: product.brand,
        }));

        setSearchResults([...ingredients, ...products]);
      } catch (error) {
        console.error('Search failed:', error);
        notifications.show({
          title: 'Search Error',
          message: 'Failed to search for ingredients and products',
          color: 'red',
        });
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleAddIngredient = () => {
    if (!selectedItem || quantity <= 0) {
      notifications.show({
        title: 'Invalid Selection',
        message: 'Please select an item and enter a valid quantity',
        color: 'orange',
      });
      return;
    }

    // Check if ingredient is already added
    const isAlreadyAdded = selectedIngredients.some(
      ingredient => ingredient.id === selectedItem.id && ingredient.type === selectedItem.type
    );

    if (isAlreadyAdded) {
      notifications.show({
        title: 'Already Added',
        message: 'This item is already in the meal',
        color: 'orange',
      });
      return;
    }

    const newIngredient: MealIngredient = {
      id: selectedItem.id,
      name: selectedItem.name,
      type: selectedItem.type,
      quantity,
      unit,
      calories_per_100g: selectedItem.calories_per_100g,
      protein_per_100g: selectedItem.protein_per_100g,
      carbs_per_100g: selectedItem.carbs_per_100g,
      sugar_per_100g: selectedItem.sugar_per_100g,
      fat_per_100g: selectedItem.fat_per_100g,
      fiber_per_100g: selectedItem.fiber_per_100g,
      saturated_fat_per_100g: selectedItem.saturated_fat_per_100g,
    };

    onIngredientsChange([...selectedIngredients, newIngredient]);
    
    // Reset form
    setSelectedItem(null);
    setQuantity(100);
    setUnit('g');
    setSearchQuery('');
    setSearchResults([]);

    notifications.show({
      title: 'Added',
      message: `${selectedItem.name} added to meal`,
      color: 'green',
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = selectedIngredients.filter((_, i) => i !== index);
    onIngredientsChange(newIngredients);
    
    notifications.show({
      title: 'Removed',
      message: 'Ingredient removed from meal',
      color: 'blue',
    });
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const newIngredients = [...selectedIngredients];
    newIngredients[index].quantity = newQuantity;
    onIngredientsChange(newIngredients);
  };

  const handleUpdateUnit = (index: number, newUnit: string) => {
    const newIngredients = [...selectedIngredients];
    newIngredients[index].unit = newUnit;
    onIngredientsChange(newIngredients);
  };

  return (
    <Stack gap="md">
      {/* Search Section */}
      <Card withBorder p="md">
        <Text size="sm" fw={500} mb="sm">Search Ingredients & Products</Text>
        
        <Stack gap="sm">
          <TextInput
            placeholder="Search for ingredients or products..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={isSearching ? <Loader size={16} /> : null}
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Paper withBorder p="sm" mah={200}>
              <ScrollArea>
                <Stack gap="xs">
                  {searchResults.map((item) => (
                    <Paper
                      key={`${item.type}-${item.id}`}
                      p="xs"
                      withBorder={selectedItem?.id === item.id && selectedItem?.type === item.type}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedItem?.id === item.id && selectedItem?.type === item.type ? 'var(--mantine-color-blue-light)' : undefined
                      }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <Group justify="space-between">
                        <Group gap="xs">
                          {item.type === 'ingredient' ? (
                            <IconLeaf size={14} color="green" />
                          ) : (
                            <IconShoppingCart size={14} color="blue" />
                          )}
                          <Text size="sm" fw={500}>
                            {item.name}
                            {item.brand && <Text span size="xs" c="dimmed"> • {item.brand}</Text>}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Badge size="xs" variant="light" color={item.type === 'ingredient' ? 'green' : 'blue'}>
                            {item.type}
                          </Badge>
                          <Text size="xs" c="dimmed">{item.calories_per_100g} cal/100g</Text>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            </Paper>
          )}

          {/* Add Ingredient Form */}
          {selectedItem && (
            <Paper withBorder p="sm" bg="gray.0">
              <Stack gap="sm">
                <Text size="sm" fw={500}>
                  Adding: {selectedItem.name}
                  {selectedItem.brand && <Text span size="xs" c="dimmed"> ({selectedItem.brand})</Text>}
                </Text>
                
                <Group>
                  <NumberInput
                    label="Quantity"
                    value={quantity}
                    onChange={(value: any) => setQuantity(Number(value) || 0)}
                    min={0.1}
                    step={0.1}
                    decimalScale={1}
                    style={{ flex: 1 }}
                  />
                  
                  <Select
                    label="Unit"
                    value={unit}
                    onChange={(value: string | null) => setUnit(value || 'g')}
                    data={UNIT_OPTIONS}
                    style={{ flex: 1 }}
                  />
                  
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddIngredient}
                    disabled={!selectedItem || quantity <= 0}
                    mt="auto"
                  >
                    Add to Meal
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Card>

      {/* Selected Ingredients List */}
      {selectedIngredients.length > 0 && (
        <Card withBorder p="md">
          <Text size="sm" fw={500} mb="sm">Selected Ingredients ({selectedIngredients.length})</Text>
          
          <ScrollArea>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Unit</Table.Th>
                  <Table.Th>Calories</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedIngredients.map((ingredient, index) => (
                  <Table.Tr key={`${ingredient.type}-${ingredient.id}-${index}`}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{ingredient.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={ingredient.type === 'ingredient' ? 'green' : 'blue'}>
                        {ingredient.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={ingredient.quantity}
                        onChange={(value: any) => handleUpdateQuantity(index, Number(value) || 0)}
                        min={0.1}
                        step={0.1}
                        decimalScale={1}
                        size="xs"
                        w={80}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        value={ingredient.unit}
                        onChange={(value: string | null) => handleUpdateUnit(index, value || 'g')}
                        data={UNIT_OPTIONS}
                        size="xs"
                        w={100}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {Math.round((ingredient.calories_per_100g * ingredient.quantity) / 100)} cal
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </Stack>
  );
};
