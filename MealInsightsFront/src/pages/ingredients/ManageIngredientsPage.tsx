import { useState, useEffect } from 'react';
import { Container, Stack, Title, Group, Text, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLeaf, IconPlus } from '@tabler/icons-react';
import { 
  AddEditIngredientForm, 
  IngredientsList 
} from '@/features/ingredients-management/ui';
import { 
  getAllIngredients, 
  createIngredient, 
  updateIngredient, 
  deleteIngredient 
} from '@/entities/ingredient/api/ingredientApi';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '@/entities/ingredient/model/types';

const ManageIngredientsPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

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

  const handleCreateIngredient = async (data: CreateIngredientRequest) => {
    try {
      const response = await createIngredient(data);
      setIngredients(prev => [...prev, response.data]);
      setIsFormModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Ingredient created successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create ingredient',
        color: 'red',
      });
      throw error; // Re-throw to let form handle it
    }
  };

  const handleUpdateIngredient = async (data: UpdateIngredientRequest) => {
    if (!editingIngredient) return;

    try {
      const response = await updateIngredient(editingIngredient.id, data);
      setIngredients(prev => 
        prev.map(ingredient => 
          ingredient.id === editingIngredient.id ? response.data : ingredient
        )
      );
      setIsFormModalOpen(false);
      setEditingIngredient(null);
      notifications.show({
        title: 'Success',
        message: 'Ingredient updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update ingredient',
        color: 'red',
      });
      throw error; // Re-throw to let form handle it
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    try {
      await deleteIngredient(ingredientId);
      setIngredients(prev => prev.filter(ingredient => ingredient.id !== ingredientId));
      notifications.show({
        title: 'Success',
        message: 'Ingredient deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete ingredient',
        color: 'red',
      });
    }
  };

  const handleAddClick = () => {
    setEditingIngredient(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsFormModalOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingIngredient(null);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Group gap="sm">
              <IconLeaf size={32} color="#51cf66" />
              <Title order={1}>Manage Ingredients</Title>
            </Group>
            <Text c="dimmed" size="lg">
              Add, edit, and manage your ingredient database
            </Text>
          </Stack>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddClick}
          >
            Add Ingredient
          </Button>
        </Group>

        {/* Ingredients List */}
        <IngredientsList
          ingredients={ingredients}
          isLoading={isLoading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteIngredient}
        />

        {/* Add/Edit Form Modal */}
        <AddEditIngredientForm
          isOpen={isFormModalOpen}
          onClose={handleFormCancel}
          onSubmit={editingIngredient ? handleUpdateIngredient : handleCreateIngredient}
          ingredient={editingIngredient}
          isEditing={!!editingIngredient}
        />
      </Stack>
    </Container>
  );
};

export default ManageIngredientsPage;
