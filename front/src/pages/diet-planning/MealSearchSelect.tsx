import { useState, useEffect } from 'react';
import {
  TextInput,
  Stack,
  Card,
  Text,
  Badge,
  Group,
  ScrollArea,
  Loader,
  Alert,
  Button,
} from '@/shared/ui-kit';
import { IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { useDebouncedValue } from '@/shared/ui-kit';
import { useMealSearch } from '../../entities/diet-planning/api/hooks';
import type { MealListItem } from '../../entities/meal/model/types';

export interface MealSearchSelectProps {
  value: string | null;
  onChange: (mealId: string | null) => void;
  placeholder?: string;
}

export const MealSearchSelect = ({
  value,
  onChange,
  placeholder = "Search for meals...",
}: MealSearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealListItem | null>(null);

  // Search for meals
  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useMealSearch(debouncedQuery, {
    enabled: debouncedQuery.length > 0
  });

  // Find selected meal when value changes
  useEffect(() => {
    if (value && searchResults) {
      const meal = searchResults.find(m => m.id === value);
      setSelectedMeal(meal || null);
    } else {
      setSelectedMeal(null);
    }
  }, [value, searchResults]);

  const handleMealSelect = (meal: MealListItem) => {
    setSelectedMeal(meal);
    onChange(meal.id);
    setSearchQuery(meal.name);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedMeal(null);
    onChange(null);
    setSearchQuery('');
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(true);
    
    // Clear selection if user starts typing
    if (selectedMeal && value !== selectedMeal.name) {
      setSelectedMeal(null);
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for click events
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Stack gap="xs" style={{ position: 'relative' }}>
      <TextInput
        placeholder={placeholder}
        value={searchQuery}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        leftSection={<IconSearch size={16} />}
        rightSection={selectedMeal && (
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={handleClearSelection}
          >
            Clear
          </Button>
        )}
      />

      {/* Selected Meal Display */}
      {selectedMeal && (
        <Card p="sm" withBorder bg="blue.0">
          <Group justify="space-between">
            <Text size="sm" fw={500}>{selectedMeal.name}</Text>
            <Badge size="sm" variant="light" color="green">
              {Math.round(selectedMeal.calories_total || 0)} cal
            </Badge>
          </Group>
        </Card>
      )}

      {/* Search Results Dropdown */}
      {isOpen && debouncedQuery.length > 0 && (
        <Card
          p={0}
          withBorder
          shadow="md"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '300px',
          }}
        >
          <ScrollArea mah={300}>
            {isLoading ? (
              <Group justify="center" p="md">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">Searching meals...</Text>
              </Group>
            ) : error ? (
              <Alert icon={<IconAlertCircle size={16} />} color="red" m="sm">
                Failed to search meals
              </Alert>
            ) : searchResults && searchResults.length > 0 ? (
              <Stack gap={0}>
                {searchResults.map((meal) => (
                  <Card
                    key={meal.id}
                    p="sm"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 0,
                      border: 'none',
                    }}
                    onClick={() => handleMealSelect(meal)}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Group justify="space-between">
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {meal.name}
                        </Text>
                        {/* MealListItem doesn't have description field */}
                        {meal.tags && meal.tags.length > 0 && (
                          <Group gap="xs">
                            {meal.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} size="xs" variant="dot">
                                {tag}
                              </Badge>
                            ))}
                            {meal.tags.length > 3 && (
                              <Text size="xs" c="dimmed">
                                +{meal.tags.length - 3} more
                              </Text>
                            )}
                          </Group>
                        )}
                      </Stack>
                      <Stack align="end" gap="xs">
                        <Badge size="sm" variant="light" color="green">
                          {Math.round(meal.calories_total || 0)} cal
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {meal.ingredient_count} ingredients
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" ta="center" p="md">
                No meals found for "{debouncedQuery}"
              </Text>
            )}
          </ScrollArea>
        </Card>
      )}
    </Stack>
  );
};
