import { useState, useEffect } from "react";
import {
  Stack,
  Select,
  TextInput,
  Button,
  Group,
  Text,
  Card,
  Table,
  ActionIcon,
  Badge,
  ScrollArea,
  Paper,
  Loader,
  Alert,
} from "@/shared/ui-kit";
import { useDebouncedValue } from "@/shared/ui-kit";
import { notifications } from "@/shared/ui-kit";
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconLeaf,
  IconShoppingCart,
  IconInfoCircle,
} from "@tabler/icons-react";
import { ingredientApi } from "@/entities/ingredient/api/ingredientApi";
import { productApi } from "@/entities/product/api/productApi";
import type { Ingredient } from "@/entities/ingredient/model/types";
import type { Product } from "@/entities/product/model/types";
import type { MealIngredient } from "./IngredientSelectorForMeal";

export interface MealEquivalent {
  originalIngredientId: string;
  originalIngredientName: string;
  originalIngredientType: "ingredient" | "product";
  equivalentIngredientId: string;
  equivalentIngredientName: string;
  equivalentIngredientType: "ingredient" | "product";
  conversionRatio?: number; // Optional conversion ratio (e.g., 1 cup = 240ml)
  notes?: string;
}

interface EquivalentSearchResult {
  id: string;
  name: string;
  type: "ingredient" | "product";
  brand?: string | null;
  tags: string[];
}

interface IngredientEquivalentsManagerProps {
  selectedIngredients: MealIngredient[];
  equivalents: MealEquivalent[];
  onEquivalentsChange: (equivalents: MealEquivalent[]) => void;
}

export const IngredientEquivalentsManager = ({
  selectedIngredients,
  equivalents,
  onEquivalentsChange,
}: IngredientEquivalentsManagerProps) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<EquivalentSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEquivalent, setSelectedEquivalent] =
    useState<EquivalentSearchResult | null>(null);

  // Get options for ingredient dropdown
  const ingredientOptions = selectedIngredients.map((ingredient) => ({
    value: `${ingredient.type}-${ingredient.id}`,
    label: `${ingredient.name} (${ingredient.type})`,
  }));

  // Get currently selected ingredient details
  const selectedIngredient = selectedIngredients.find(
    (ingredient) =>
      `${ingredient.type}-${ingredient.id}` === selectedIngredientId
  );

  // Get equivalents for selected ingredient
  const currentEquivalents = equivalents.filter(
    (equiv) =>
      `${equiv.originalIngredientType}-${equiv.originalIngredientId}` ===
      selectedIngredientId
  );

  // Search for equivalent ingredients and products
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
            limit: 15,
          }),
          productApi.getProducts({
            name_filter: debouncedSearch,
            limit: 15,
          }),
        ]);

        const ingredients: EquivalentSearchResult[] =
          ingredientsResponse.ingredients.map((ingredient: Ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            type: "ingredient" as const,
            tags: ingredient.tags || [],
          }));

        const products: EquivalentSearchResult[] =
          productsResponse.products.map((product: Product) => ({
            id: product.id,
            name: product.name,
            type: "product" as const,
            brand: product.brand,
            tags: product.tags || [],
          }));

        // Filter out items that are already in the meal or already added as equivalents
        const allResults = [...ingredients, ...products];
        const filteredResults = allResults.filter((item) => {
          const itemKey = `${item.type}-${item.id}`;

          // Don't show if it's already in the meal
          const isInMeal = selectedIngredients.some(
            (mealItem) => `${mealItem.type}-${mealItem.id}` === itemKey
          );

          // Don't show if it's already an equivalent for the selected ingredient
          const isAlreadyEquivalent = currentEquivalents.some(
            (equiv) =>
              `${equiv.equivalentIngredientType}-${equiv.equivalentIngredientId}` ===
              itemKey
          );

          return !isInMeal && !isAlreadyEquivalent;
        });

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Equivalent search failed:", error);
        notifications.show({
          title: "Search Error",
          message: "Failed to search for equivalent ingredients",
          color: "red",
        });
      } finally {
        setIsSearching(false);
      }
    };

    if (selectedIngredientId) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, selectedIngredientId, selectedIngredients, equivalents]);

  const handleAddEquivalent = () => {
    if (!selectedIngredient || !selectedEquivalent) {
      notifications.show({
        title: "Invalid Selection",
        message: "Please select both an ingredient and an equivalent",
        color: "orange",
      });
      return;
    }

    const newEquivalent: MealEquivalent = {
      originalIngredientId: selectedIngredient.id,
      originalIngredientName: selectedIngredient.name,
      originalIngredientType: selectedIngredient.type,
      equivalentIngredientId: selectedEquivalent.id,
      equivalentIngredientName: selectedEquivalent.name,
      equivalentIngredientType: selectedEquivalent.type,
    };

    onEquivalentsChange([...equivalents, newEquivalent]);

    // Reset search
    setSelectedEquivalent(null);
    setSearchQuery("");
    setSearchResults([]);

    notifications.show({
      title: "Equivalent Added",
      message: `${selectedEquivalent.name} added as equivalent for ${selectedIngredient.name}`,
      color: "green",
    });
  };

  const handleRemoveEquivalent = (equivalentToRemove: MealEquivalent) => {
    const newEquivalents = equivalents.filter(
      (equiv) =>
        !(
          equiv.originalIngredientId ===
            equivalentToRemove.originalIngredientId &&
          equiv.originalIngredientType ===
            equivalentToRemove.originalIngredientType &&
          equiv.equivalentIngredientId ===
            equivalentToRemove.equivalentIngredientId &&
          equiv.equivalentIngredientType ===
            equivalentToRemove.equivalentIngredientType
        )
    );

    onEquivalentsChange(newEquivalents);

    notifications.show({
      title: "Equivalent Removed",
      message: "Equivalent ingredient removed",
      color: "blue",
    });
  };

  // Reset search when ingredient selection changes
  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedEquivalent(null);
  }, [selectedIngredientId]);

  if (selectedIngredients.length === 0) {
    return (
      <Alert icon={<IconInfoCircle size="1rem" />} color="gray">
        Add some ingredients to the meal first to manage their equivalents.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Ingredient Selection */}
      <Select
        label="Select Meal Ingredient to Manage Equivalents"
        placeholder="Choose an ingredient from your meal"
        value={selectedIngredientId}
        onChange={(value: string | null) =>
          setSelectedIngredientId(value || "")
        }
        data={ingredientOptions}
        searchable
        clearable
      />

      {selectedIngredient && (
        <Card withBorder p="md">
          <Stack gap="sm">
            <Group>
              {selectedIngredient.type === "ingredient" ? (
                <IconLeaf size={16} color="green" />
              ) : (
                <IconShoppingCart size={16} color="blue" />
              )}
              <Text fw={500}>
                Managing equivalents for: {selectedIngredient.name}
              </Text>
              <Badge
                size="sm"
                variant="light"
                color={
                  selectedIngredient.type === "ingredient" ? "green" : "blue"
                }
              >
                {selectedIngredient.type}
              </Badge>
            </Group>

            {/* Search for Equivalents */}
            <TextInput
              placeholder="Search for equivalent ingredients or products..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              leftsection={<IconSearch size={16} />}
              rightsection={isSearching ? <Loader size={16} /> : null}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Paper withBorder p="sm" mah={150}>
                <ScrollArea>
                  <Stack gap="xs">
                    {searchResults.map((item) => (
                      <Paper
                        key={`${item.type}-${item.id}`}
                        p="xs"
                        withBorder={
                          selectedEquivalent?.id === item.id &&
                          selectedEquivalent?.type === item.type
                        }
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedEquivalent?.id === item.id &&
                            selectedEquivalent?.type === item.type
                              ? "var(--mantine-color-blue-light)"
                              : undefined,
                        }}
                        onClick={() => setSelectedEquivalent(item)}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            {item.type === "ingredient" ? (
                              <IconLeaf size={14} color="green" />
                            ) : (
                              <IconShoppingCart size={14} color="blue" />
                            )}
                            <Text size="sm" fw={500}>
                              {item.name}
                              {item.brand && (
                                <Text span size="xs" c="dimmed">
                                  {" "}
                                  • {item.brand}
                                </Text>
                              )}
                            </Text>
                          </Group>
                          <Badge
                            size="xs"
                            variant="light"
                            color={
                              item.type === "ingredient" ? "green" : "blue"
                            }
                          >
                            {item.type}
                          </Badge>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Paper>
            )}

            {/* Add Equivalent Button */}
            {selectedEquivalent && (
              <Paper withBorder p="sm" bg="gray.0">
                <Group justify="space-between">
                  <Text size="sm">
                    Adding equivalent:{" "}
                    <Text span fw={500}>
                      {selectedEquivalent.name}
                    </Text>
                    {selectedEquivalent.brand && (
                      <Text span size="xs" c="dimmed">
                        {" "}
                        ({selectedEquivalent.brand})
                      </Text>
                    )}
                  </Text>
                  <Button
                    size="sm"
                    leftsection={<IconPlus size={14} />}
                    onClick={handleAddEquivalent}
                  >
                    Add Equivalent
                  </Button>
                </Group>
              </Paper>
            )}

            {/* Current Equivalents List */}
            {currentEquivalents.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Current Equivalents ({currentEquivalents.length})
                </Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Equivalent Name</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {currentEquivalents.map((equiv, index) => (
                      <Table.Tr key={`equiv-${index}`}>
                        <Table.Td>
                          <Text size="sm">
                            {equiv.equivalentIngredientName}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="sm"
                            variant="light"
                            color={
                              equiv.equivalentIngredientType === "ingredient"
                                ? "green"
                                : "blue"
                            }
                          >
                            {equiv.equivalentIngredientType}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            variant="light"
                            size="sm"
                            onClick={() => handleRemoveEquivalent(equiv)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}

            {currentEquivalents.length === 0 && (
              <Text size="xs" c="dimmed" ta="center" py="md">
                No equivalents defined for this ingredient yet.
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Summary of All Equivalents */}
      {equivalents.length > 0 && (
        <Card withBorder p="md">
          <Text size="sm" fw={500} mb="sm">
            All Meal Equivalents Summary ({equivalents.length})
          </Text>
          <ScrollArea>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Original Ingredient</Table.Th>
                  <Table.Th>Can be replaced with</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {equivalents.map((equiv, index) => (
                  <Table.Tr key={`summary-equiv-${index}`}>
                    <Table.Td>
                      <Group gap="xs">
                        {equiv.originalIngredientType === "ingredient" ? (
                          <IconLeaf size={14} color="green" />
                        ) : (
                          <IconShoppingCart size={14} color="blue" />
                        )}
                        <Text size="sm">{equiv.originalIngredientName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {equiv.equivalentIngredientType === "ingredient" ? (
                          <IconLeaf size={14} color="green" />
                        ) : (
                          <IconShoppingCart size={14} color="blue" />
                        )}
                        <Text size="sm">{equiv.equivalentIngredientName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="sm"
                        onClick={() => handleRemoveEquivalent(equiv)}
                      >
                        <IconTrash size={14} />
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
