import { useState, useEffect } from "react";
import { Container, Stack, notifications } from "@/shared/ui-kit";
import { IconShoppingCart } from "@tabler/icons-react";
import { PageHeader } from "@/shared/ui";
import { AddEditIngredientForm } from "@/features/ingredients-management/ui";
import AddEditProductForm from "@/features/product-management/ui/AddEditProductForm";
import UnifiedItemsList from "@/shared/ui/UnifiedItemsList";
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  ingredientApi,
} from "@/entities/ingredient/api/ingredientApi";
import {
  getAllProducts,
  deleteProduct,
  productApi,
} from "@/entities/product/api/productApi";
import type {
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "@/entities/ingredient/model/types";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/entities/product/model/types";
import type { UnifiedItem, UnifiedItemFilters } from "@/shared/lib/types";
import {
  ingredientToUnified,
  productToUnified,
} from "@/shared/lib/utils/unifiedItems";

const ItemsManagementPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  // Debug: log when product modal state changes
  console.debug(
    "ItemsManagementPage render: isProductFormOpen=",
    isProductFormOpen
  );
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
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
        getAllProducts(),
      ]);
      setIngredients(ingredientsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load items",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnifiedItems = () => {
    let items: UnifiedItem[] = [
      ...ingredients.map(ingredientToUnified),
      ...products.map(productToUnified),
    ];

    // Apply filters
    if (filters.name_filter) {
      const nameFilter = filters.name_filter.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(nameFilter)
      );
    }

    if (filters.type_filter && filters.type_filter !== "all") {
      items = items.filter((item) => item.type === filters.type_filter);
    }

    if (filters.tag_filter && filters.tag_filter.length > 0) {
      items = items.filter((item) =>
        filters.tag_filter!.some((tag) => item.tags.includes(tag))
      );
    }

    // Sort by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    setUnifiedItems(items);
  };

  const handleCreateIngredient = async (data: CreateIngredientRequest) => {
    const { photoFile, photoRemoved, ...ingredientData } = data as any;

    try {
      let response;
      if (photoFile instanceof File) {
        console.log(
          "ItemsManagementPage.handleCreateIngredient: photoFile is a File, calling createIngredientWithPhoto"
        );
        response = await ingredientApi.createIngredientWithPhoto({
          ...(ingredientData as CreateIngredientRequest),
          photo_data: photoFile,
        });
      } else {
        console.log(
          "ItemsManagementPage.handleCreateIngredient: photoFile is NOT a File, calling createIngredient"
        );
        const apiResponse = await createIngredient(
          ingredientData as CreateIngredientRequest
        );
        response = apiResponse.data;
      }

      if (response && typeof response.id === "string") {
        // Check if response is a valid ingredient
        setIngredients((prev) => [...prev, response]);
      } else {
        console.error("Create ingredient response is invalid:", response);
        notifications.show({
          title: "Error",
          message: "Failed to create ingredient: Invalid response from server.",
          color: "red",
        });
      }
      setIsIngredientFormOpen(false);
      notifications.show({
        title: "Success",
        message: "Ingredient created successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create ingredient",
        color: "red",
      });
      throw error;
    }
  };

  const handleUpdateIngredient = async (data: UpdateIngredientRequest) => {
    if (!editingIngredient) return;
    const { photoFile, photoRemoved, ...ingredientData } = data as any;

    try {
      let response;

      // First, remove any photo_data from ingredientData that might have come from the form
      // since we handle photo data separately through photoFile and photoRemoved
      const { photo_data: _, ...cleanIngredientData } = ingredientData;

      if (photoFile instanceof File) {
        console.log(
          "ItemsManagementPage.handleUpdateIngredient: photoFile is a File, calling updateIngredientWithPhoto"
        );
        // Ensure name is defined for CreateIngredientWithPhotoRequest
        const photoRequestData = {
          name: cleanIngredientData.name || editingIngredient.name, // Fallback to existing name if not provided
          shops: cleanIngredientData.shops,
          calories_per_100g_or_ml: cleanIngredientData.calories_per_100g_or_ml,
          macros_per_100g_or_ml: cleanIngredientData.macros_per_100g_or_ml,
          tags: cleanIngredientData.tags || [],
          photo_data: photoFile,
        };
        response = await ingredientApi.updateIngredientWithPhoto(
          editingIngredient.id,
          photoRequestData
        );
      } else if (photoRemoved) {
        console.log(
          "ItemsManagementPage.handleUpdateIngredient: photoRemoved is true, updating ingredient with photo_data: null"
        );
        console.log("Original ingredientData:", ingredientData);
        // User wants to remove the existing photo, send update with photo_data: null
        const updateDataWithPhotoRemoval: UpdateIngredientRequest = {
          ...cleanIngredientData,
          photo_data: null, // Explicitly set to null to remove the photo
        };
        console.log(
          "Final updateDataWithPhotoRemoval being sent:",
          updateDataWithPhotoRemoval
        );
        console.log(
          "JSON stringify of data being sent:",
          JSON.stringify(updateDataWithPhotoRemoval, null, 2)
        );
        const apiResponse = await updateIngredient(
          editingIngredient.id,
          updateDataWithPhotoRemoval
        );
        response = apiResponse.data;
      } else {
        console.log(
          "ItemsManagementPage.handleUpdateIngredient: no photo changes, calling regular updateIngredient with existing photo data"
        );
        // Include existing photo data to preserve it during update
        const updateDataWithExistingPhoto: UpdateIngredientRequest = {
          ...cleanIngredientData,
          photo_data: editingIngredient.photo_data, // Include existing photo data to preserve it
        };
        console.log(
          "Update data with existing photo (preserving):",
          updateDataWithExistingPhoto
        );
        const apiResponse = await updateIngredient(
          editingIngredient.id,
          updateDataWithExistingPhoto
        );
        response = apiResponse.data;
      }

      if (response && typeof response.id === "string") {
        // Check if response is a valid ingredient
        setIngredients((prev) =>
          prev.map((ingredient) =>
            ingredient.id === editingIngredient.id ? response : ingredient
          )
        );
      } else {
        console.error("Update ingredient response is invalid:", response);
        notifications.show({
          title: "Error",
          message: "Failed to update ingredient: Invalid response from server.",
          color: "red",
        });
      }
      setIsIngredientFormOpen(false);
      setEditingIngredient(null);
      notifications.show({
        title: "Success",
        message: "Ingredient updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update ingredient",
        color: "red",
      });
      throw error;
    }
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    const { photoFile, photoRemoved, ...productData } = data as any;

    try {
      let response;
      if (photoFile instanceof File) {
        console.log(
          "ItemsManagementPage.handleCreateProduct: photoFile is a File, calling createProductWithPhoto"
        );
        response = await productApi.createProductWithPhoto({
          ...(productData as CreateProductRequest),
          photo_data: photoFile,
        });
      } else {
        console.log(
          "ItemsManagementPage.handleCreateProduct: photoFile is NOT a File, calling createProduct"
        );
        response = await productApi.createProduct(
          productData as CreateProductRequest
        );
      }

      if (response && typeof response.id === "string") {
        // Check if response is a valid product
        setProducts((prev) => [...prev, response]);
      } else {
        console.error("Create product response is invalid:", response);
        notifications.show({
          title: "Error",
          message: "Failed to create product: Invalid response from server.",
          color: "red",
        });
      }
      setIsProductFormOpen(false);
      notifications.show({
        title: "Success",
        message: "Product created successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create product",
        color: "red",
      });
      throw error;
    }
  };

  const handleUpdateProduct = async (data: UpdateProductRequest) => {
    if (!editingProduct) return;
    const { photoFile, photoRemoved, ...productData } = data as any;

    try {
      let response;

      // First, remove any photo_data from productData that might have come from the form
      // since we handle photo data separately through photoFile and photoRemoved
      const { photo_data: _, ...cleanProductData } = productData;

      if (photoFile instanceof File) {
        console.log(
          "ItemsManagementPage.handleUpdateProduct: photoFile is a File, calling updateProductWithPhoto"
        );
        // Ensure name is defined for CreateProductWithPhotoRequest
        const photoRequestData = {
          name: cleanProductData.name || editingProduct.name, // Fallback to existing name if not provided
          brand: cleanProductData.brand,
          shop: cleanProductData.shop,
          calories_per_100g_or_ml: cleanProductData.calories_per_100g_or_ml,
          macros_per_100g_or_ml: cleanProductData.macros_per_100g_or_ml,
          package_size_g_or_ml: cleanProductData.package_size_g_or_ml,
          ingredients: cleanProductData.ingredients,
          tags: cleanProductData.tags || [],
          photo_data: photoFile,
        };
        response = await productApi.updateProductWithPhoto(
          editingProduct.id,
          photoRequestData
        );
      } else if (photoRemoved) {
        // User wants to remove the existing photo, send update with photo_data: null
        const updateDataWithPhotoRemoval: UpdateProductRequest = {
          ...cleanProductData,
          photo_data: null, // Explicitly set to null to remove the photo
        };
        console.log(
          "Final updateDataWithPhotoRemoval being sent:",
          updateDataWithPhotoRemoval
        );
        console.log(
          "JSON stringify of data being sent:",
          JSON.stringify(updateDataWithPhotoRemoval, null, 2)
        );
        response = await productApi.updateProduct(
          editingProduct.id,
          updateDataWithPhotoRemoval
        );
      } else {
        console.log(
          "ItemsManagementPage.handleUpdateProduct: no photo changes, calling regular updateProduct with existing photo data"
        );
        // Include existing photo data to preserve it during update
        const updateDataWithExistingPhoto: UpdateProductRequest = {
          ...cleanProductData,
          photo_data: editingProduct.photo_data, // Include existing photo data to preserve it
        };
        console.log(
          "Update data with existing photo (preserving):",
          updateDataWithExistingPhoto
        );
        response = await productApi.updateProduct(
          editingProduct.id,
          updateDataWithExistingPhoto
        );
      }

      if (response && typeof response.id === "string") {
        // Check if response is a valid product
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? response : p))
        );
      } else {
        console.error("Update product response is invalid:", response);
        notifications.show({
          title: "Error",
          message: "Failed to update product: Invalid response from server.",
          color: "red",
        });
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
      notifications.show({
        title: "Success",
        message: "Product updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update product",
        color: "red",
      });
      throw error;
    }
  };

  const handleDeleteItem = async (item: UnifiedItem) => {
    try {
      if (item.type === "ingredient") {
        await deleteIngredient(item.id);
        setIngredients((prev) =>
          prev.filter((ingredient) => ingredient.id !== item.id)
        );
      } else {
        await deleteProduct(item.id);
        setProducts((prev) => prev.filter((product) => product.id !== item.id));
      }
    } catch (error) {
      throw error; // Let UnifiedItemsList handle the error notification
    }
  };

  const handleEditItem = (item: UnifiedItem) => {
    if (item.type === "ingredient" && item.ingredient) {
      setEditingIngredient(item.ingredient);
      setIsIngredientFormOpen(true);
    } else if (item.type === "product" && item.product) {
      setEditingProduct(item.product);
      setIsProductFormOpen(true);
    }
  };

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIsIngredientFormOpen(true);
  };

  const handleAddProduct = () => {
    console.debug("ItemsManagementPage: handleAddProduct fired");
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
    <div>
      <Container size="xl">
        <Stack gap="xl">
          {/* Page Header */}
          <PageHeader
            icon={IconShoppingCart}
            title="Ingredients & Products"
            description="Browse, add, edit, and manage your ingredients and products database"
          />

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
            onSubmit={
              editingIngredient
                ? handleUpdateIngredient
                : handleCreateIngredient
            }
            ingredient={editingIngredient}
            isEditing={!!editingIngredient}
          />

          {/* Add/Edit Product Form Modal */}
          <AddEditProductForm
            isOpen={isProductFormOpen}
            onClose={handleProductFormClose}
            onSubmit={
              editingProduct ? handleUpdateProduct : handleCreateProduct
            }
            product={editingProduct}
            isEditing={!!editingProduct}
            onSuccess={loadAllItems} // Refresh list on success
          />
        </Stack>
      </Container>
    </div>
  );
};

export default ItemsManagementPage;
