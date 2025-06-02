import { useState, useEffect } from 'react';
import { Container, Stack, Title, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconShoppingCart } from '@tabler/icons-react';
import { 
  AddEditIngredientForm
} from '@/features/ingredients-management/ui';
import AddEditProductForm from '@/features/product-management/ui/AddEditProductForm';
import UnifiedItemsList from '@/shared/ui/UnifiedItemsList';
import { 
  getAllIngredients, 
  createIngredient, 
  updateIngredient, 
  deleteIngredient 
} from '@/entities/ingredient/api/ingredientApi';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/entities/product/api/productApi';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '@/entities/ingredient/model/types';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/entities/product/model/types';
import type { UnifiedItem, UnifiedItemFilters } from '@/shared/lib/types';
import { ingredientToUnified, productToUnified } from '@/shared/lib/utils/unifiedItems';

const ItemsManagementPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  // Debug: log when product modal state changes
  console.debug('ItemsManagementPage render: isProductFormOpen=', isProductFormOpen);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<UnifiedItemFilters>({});

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    updateUnifiedItems();
  }, [ingredients, products, filters]);

  const loadAllItems = async () => {
    try {
      setIsLoading(true);
      const [ingredientsResponse, productsResponse] = await Promise.all([
        getAllIngredients(),
        getAllProducts()
      ]);
      setIngredients(ingredientsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load items',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnifiedItems = () => {
    let items: UnifiedItem[] = [
      ...ingredients.map(ingredientToUnified),
      ...products.map(productToUnified)
    ];

    // Apply filters
    if (filters.name_filter) {
      const nameFilter = filters.name_filter.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(nameFilter)
      );
    }

    if (filters.type_filter && filters.type_filter !== 'all') {
      items = items.filter(item => item.type === filters.type_filter);
    }

    if (filters.tag_filter && filters.tag_filter.length > 0) {
      items = items.filter(item =>
        filters.tag_filter!.some(tag => item.tags.includes(tag))
      );
    }

    // Sort by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    setUnifiedItems(items);
  };

  const handleCreateIngredient = async (data: CreateIngredientRequest) => {
    try {
      const response = await createIngredient(data);
      setIngredients(prev => [...prev, response.data]);
      setIsIngredientFormOpen(false);
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
      throw error;
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
      setIsIngredientFormOpen(false);
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
      throw error;
    }
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    try {
      const response = await createProduct(data);
      setProducts(prev => [...prev, response.data]);
      setIsProductFormOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Product created successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create product',
        color: 'red',
      });
      throw error;
    }
  };

  const handleUpdateProduct = async (data: UpdateProductRequest) => {
    if (!editingProduct) return;

    try {
      const response = await updateProduct(editingProduct.id, data);
      setProducts(prev => 
        prev.map(product => 
          product.id === editingProduct.id ? response.data : product
        )
      );
      setIsProductFormOpen(false);
      setEditingProduct(null);
      notifications.show({
        title: 'Success',
        message: 'Product updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update product',
        color: 'red',
      });
      throw error;
    }
  };

  const handleDeleteItem = async (item: UnifiedItem) => {
    try {
      if (item.type === 'ingredient') {
        await deleteIngredient(item.id);
        setIngredients(prev => prev.filter(ingredient => ingredient.id !== item.id));
      } else {
        await deleteProduct(item.id);
        setProducts(prev => prev.filter(product => product.id !== item.id));
      }
    } catch (error) {
      throw error; // Let UnifiedItemsList handle the error notification
    }
  };

  const handleEditItem = (item: UnifiedItem) => {
    if (item.type === 'ingredient' && item.ingredient) {
      setEditingIngredient(item.ingredient);
      setIsIngredientFormOpen(true);
    } else if (item.type === 'product' && item.product) {
      setEditingProduct(item.product);
      setIsProductFormOpen(true);
    }
  };

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIsIngredientFormOpen(true);
  };

  const handleAddProduct = () => {
    console.debug('ItemsManagementPage: handleAddProduct fired');
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleIngredientFormClose = () => {
    setIsIngredientFormOpen(false);
    setEditingIngredient(null);
  };

  const handleProductFormClose = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Group gap="sm">
              <IconShoppingCart size={32} color="#51cf66" />
              <Title order={1}>Ingredients & Products</Title>
            </Group>
            <Text c="dimmed" size="lg">
              Browse, add, edit, and manage your ingredients and products database
            </Text>
          </Stack>
        </Group>

        {/* Unified Items List */}
        <UnifiedItemsList
          items={unifiedItems}
          isLoading={isLoading}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onAddIngredient={handleAddIngredient}
          onAddProduct={handleAddProduct}
          filters={filters}
          onFiltersChange={setFilters}
          showFilters={true}
        />

        {/* Add/Edit Ingredient Form Modal */}
        <AddEditIngredientForm
          isOpen={isIngredientFormOpen}
          onClose={handleIngredientFormClose}
          onSubmit={editingIngredient ? handleUpdateIngredient : handleCreateIngredient}
          ingredient={editingIngredient}
          isEditing={!!editingIngredient}
        />

        {/* Add/Edit Product Form Modal */}
        <AddEditProductForm
          isOpen={isProductFormOpen}
          onClose={handleProductFormClose}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          product={editingProduct}
          isEditing={!!editingProduct}
        />
      </Stack>
    </Container>
  );
};

export default ItemsManagementPage;
