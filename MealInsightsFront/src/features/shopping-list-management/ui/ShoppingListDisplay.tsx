/**
 * C1012.ShoppingListDisplay - Displays the aggregated list of ingredients to buy
 * Part of P0105.ShoppingListPage
 * Trigger: Button E3006 (On Click)
 */
import React, { useState } from 'react';
import {
    Stack,
    Title,
    Group,
    Button,
    Text,
    Badge,
    Table,
    Card,
    Divider,
    Tooltip,
    Alert,
    ScrollArea,
    Grid,
    Select,
    TextInput,
    Collapse,
} from '@mantine/core';
import {
    IconPrinter,
    IconDownload,
    IconShoppingCart,
    IconInfoCircle,
    IconFilter,
    IconSearch,
} from '@tabler/icons-react';
import type {
    ShoppingListResponse
} from '@/entities/shopping';

interface ShoppingListDisplayProps {
    shoppingList: ShoppingListResponse;
    onExport: () => void;
    onPrint: () => void;
    isExporting: boolean;
}

export const ShoppingListDisplay: React.FC<ShoppingListDisplayProps> = ({
    shoppingList,
    onExport,
    onPrint,
    isExporting,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { items, summary } = shoppingList;

    // Filter and search items
    const filteredItems = items.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.planned_meals.some(meal => meal.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === null ||
            item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

    const handleCategoryFilter = (category: string | null) => {
        setSelectedCategory(category);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <Stack gap="lg">
            {/* Header with summary */}
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>
                        <Group gap="xs">
                            <IconShoppingCart size={24} />
                            Shopping List
                        </Group>
                    </Title>
                    <Group gap="md">
                        <Badge size="lg" variant="light" color="blue">
                            {summary.total_items} items
                        </Badge>
                        {summary.total_estimated_cost && (
                            <Badge size="lg" variant="light" color="green">
                                Est. {formatCurrency(summary.total_estimated_cost)}
                            </Badge>
                        )}
                        <Text size="sm" color="dimmed">
                            {formatDate(summary.date_range_start)} - {formatDate(summary.date_range_end)}
                        </Text>
                    </Group>
                </Stack>

                {/* Action buttons */}
                <Group gap="xs">
                    {/* E3130 - PrintShoppingListButton */}
                    <Tooltip label="Print shopping list">
                        <Button
                            variant="light"
                            leftSection={<IconPrinter size={16} />}
                            onClick={onPrint}
                            size="sm"
                        >
                            Print
                        </Button>
                    </Tooltip>

                    {/* E3131 - ExportShoppingListButton */}
                    <Button
                        variant="filled"
                        leftSection={<IconDownload size={16} />}
                        onClick={onExport}
                        loading={isExporting}
                        size="sm"
                    >
                        Export
                    </Button>
                </Group>
            </Group>

            {/* Filters and Search */}
            <Card withBorder padding="sm">
                <Group justify="space-between" align="center">
                    <Group gap="md" style={{ flex: 1 }}>
                        <TextInput
                            placeholder="Search ingredients or meals..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftSection={<IconSearch size={16} />}
                            style={{ flexGrow: 1, maxWidth: 300 }}
                        />

                        {categories.length > 0 && (
                            <Select
                                placeholder="Filter by category"
                                value={selectedCategory}
                                onChange={handleCategoryFilter}
                                data={[
                                    { value: '', label: 'All Categories' },
                                    ...categories.map(cat => ({ value: cat!, label: cat! }))
                                ]}
                                clearable
                                style={{ minWidth: 150 }}
                            />
                        )}
                    </Group>

                    <Button
                        variant="subtle"
                        leftSection={<IconFilter size={16} />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="sm"
                    >
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </Group>

                <Collapse in={showFilters}>
                    <Divider my="sm" />
                    <Text size="sm" color="dimmed" mb="xs">
                        Showing {filteredItems.length} of {items.length} items
                        {searchTerm && ` matching "${searchTerm}"`}
                        {selectedCategory && ` in category "${selectedCategory}"`}
                    </Text>
                </Collapse>
            </Card>

            {/* Shopping List Items */}
            {filteredItems.length === 0 ? (
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                    <Text>No items match your current filters. Try adjusting your search or category filter.</Text>
                </Alert>
            ) : (
                <Card withBorder>
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    {/* IngredientNameColumn */}
                                    <Table.Th>Ingredient</Table.Th>
                                    {/* QuantityColumn */}
                                    <Table.Th>Quantity</Table.Th>
                                    {/* ShopSuggestionColumn */}
                                    <Table.Th>Shop</Table.Th>
                                    {/* PlannedMealColumn */}
                                    <Table.Th>Meals</Table.Th>
                                    {/* PlannedDayColumn */}
                                    <Table.Th>Days</Table.Th>
                                    <Table.Th>Cost</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredItems.map((item, index) => (
                                    <Table.Tr key={`${item.ingredient_id}-${index}`}>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                <Text fw={500}>{item.ingredient_name}</Text>
                                                {item.category && (
                                                    <Badge size="xs" variant="dot" color="gray">
                                                        {item.category}
                                                    </Badge>
                                                )}
                                                {item.notes && (
                                                    <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
                                                        {item.notes}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Table.Td>

                                        <Table.Td>
                                            <Text fw={500}>
                                                {item.total_quantity} {item.unit}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            {item.shop_suggestion ? (
                                                <Badge variant="light" color="blue" size="sm">
                                                    {item.shop_suggestion}
                                                </Badge>
                                            ) : (
                                                <Text size="sm" color="dimmed">—</Text>
                                            )}
                                        </Table.Td>

                                        <Table.Td>
                                            {item.planned_meals.length > 0 ? (
                                                <Stack gap={2}>
                                                    {item.planned_meals.slice(0, 2).map((meal, i) => (
                                                        <Badge key={i} size="xs" variant="light" color="orange">
                                                            {meal}
                                                        </Badge>
                                                    ))}
                                                    {item.planned_meals.length > 2 && (
                                                        <Text size="xs" color="dimmed">
                                                            +{item.planned_meals.length - 2} more
                                                        </Text>
                                                    )}
                                                </Stack>
                                            ) : (
                                                <Text size="sm" color="dimmed">—</Text>
                                            )}
                                        </Table.Td>

                                        <Table.Td>
                                            {item.planned_dates.length > 0 ? (
                                                <Stack gap={2}>
                                                    {item.planned_dates.slice(0, 2).map((date, i) => (
                                                        <Text key={i} size="xs">
                                                            {formatDate(date)}
                                                        </Text>
                                                    ))}
                                                    {item.planned_dates.length > 2 && (
                                                        <Text size="xs" color="dimmed">
                                                            +{item.planned_dates.length - 2} more
                                                        </Text>
                                                    )}
                                                </Stack>
                                            ) : (
                                                <Text size="sm" color="dimmed">—</Text>
                                            )}
                                        </Table.Td>

                                        <Table.Td>
                                            {item.estimated_cost ? (
                                                <Text size="sm" fw={500} c="green">
                                                    {formatCurrency(item.estimated_cost)}
                                                </Text>
                                            ) : (
                                                <Text size="sm" color="dimmed">—</Text>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Card>
            )}

            {/* Summary footer */}
            <Card withBorder padding="md" bg="gray.0">
                <Grid>
                    <Grid.Col span={3}>
                        <Stack gap={4} align="center">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                Total Items
                            </Text>
                            <Text size="lg" fw={700}>
                                {filteredItems.length}
                            </Text>
                        </Stack>
                    </Grid.Col>

                    {summary.total_estimated_cost && (
                        <Grid.Col span={3}>
                            <Stack gap={4} align="center">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Est. Total Cost
                                </Text>
                                <Text size="lg" fw={700} c="green">
                                    {formatCurrency(summary.total_estimated_cost)}
                                </Text>
                            </Stack>
                        </Grid.Col>
                    )}

                    <Grid.Col span={3}>
                        <Stack gap={4} align="center">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                Categories
                            </Text>
                            <Text size="lg" fw={700}>
                                {summary.categories.length}
                            </Text>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <Stack gap={4} align="center">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                Generated
                            </Text>
                            <Text size="sm">
                                {formatDate(shoppingList.generated_at)}
                            </Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Stack>
    );
};
