import { useState, useEffect } from 'react';
import { Container, Stack, Title, Group, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconChefHat } from '@tabler/icons-react';
import { 
  getAllMeals, 
  createMeal, 
  updateMeal, 
  deleteMeal,
  getMealById
} from '@/entities/meal/api/mealApi';
import { MealsList, AddEditMealForm } from '@/features/meals-management/ui';
import type { 
  Meal, 
  MealListItem, 
  CreateMealRequest, 
  UpdateMealRequest 
} from '@/entities/meal/model/types';

const ManageMealsPage = () => {
  const [meals, setMeals] = useState<MealListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMeals();
      setMeals(data);
    } catch (error) {
      console.error('Failed to load meals:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load meals',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeal = async (mealData: CreateMealRequest) => {
    try {
      setIsSubmitting(true);
      await createMeal(mealData);
      notifications.show({
        title: 'Success',
        message: 'Meal created successfully',
        color: 'green',
      });
      await loadMeals();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to create meal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create meal',
        color: 'red',
      });
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMeal = async (mealData: UpdateMealRequest) => {
    if (!editingMeal) return;
    
    try {
      setIsSubmitting(true);
      await updateMeal(editingMeal.id, mealData);
      notifications.show({
        title: 'Success',
        message: 'Meal updated successfully',
        color: 'green',
      });
      await loadMeals();
      setEditingMeal(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to update meal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update meal',
        color: 'red',
      });
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal(id);
      notifications.show({
        title: 'Success',
        message: 'Meal deleted successfully',
        color: 'green',
      });
      await loadMeals();
    } catch (error) {
      console.error('Failed to delete meal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete meal',
        color: 'red',
      });
    }
  };

  const openAddMealForm = () => {
    setEditingMeal(null);
    setIsFormOpen(true);
  };

  const openEditMealForm = async (mealItem: MealListItem) => {
    try {
      // Fetch full meal data for editing
      const fullMeal = await getMealById(mealItem.id);
      setEditingMeal(fullMeal);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Failed to load meal for editing:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load meal details',
        color: 'red',
      });
    }
  };

  const handleFormSubmit = async (data: CreateMealRequest | UpdateMealRequest) => {
    if (editingMeal) {
      await handleUpdateMeal(data as UpdateMealRequest);
    } else {
      await handleCreateMeal(data as CreateMealRequest);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMeal(null);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={1} size="h2">
            <Group gap="sm" align="center">
              <IconChefHat size={32} />
              Manage Meals
            </Group>
          </Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAddMealForm}
            size="md"
          >
            Add New Meal
          </Button>
        </Group>

        <AddEditMealForm
          meal={editingMeal}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
        />

        <MealsList
          meals={meals}
          onEdit={openEditMealForm}
          onDelete={handleDeleteMeal}
          isLoading={isLoading}
        />
      </Stack>
    </Container>
  );
};

export default ManageMealsPage;
