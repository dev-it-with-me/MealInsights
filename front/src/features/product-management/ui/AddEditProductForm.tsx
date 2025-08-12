/**
 * Form for adding/editing products
 * Handles product-specific fields like brand, package size, ingredients composition
 */
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  NumberInput,
  MultiSelect,
  Group,
  Stack,
  Title,
  Divider,
  Button,
  Image,
} from '@/shared/ui-kit';
import { notifications } from '@/shared/ui-kit';
import { useState, useEffect, useRef } from 'react';

import { Modal, IngredientSelector } from '@/shared/ui';
import { DietTagEnum } from '@/shared/lib/types';
import type { DietTag } from '@/shared/lib/types';
import { 
  createProductRequestSchema, 
  updateProductRequestSchema,
} from '@/entities/product/model/schemas';
import { productApi } from '@/entities/product/api/productApi';
import type { 
  Product,
  CreateProductRequest,
  UpdateProductRequest 
} from '@/entities/product/model/types';

interface AddEditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  product?: Product | null;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const dietTagOptions = Object.values(DietTagEnum).map(tag => ({
  value: tag,
  label: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const AddEditProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isEditing,
  onSuccess
}: AddEditProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Add preview URL state
  const [photoRemoved, setPhotoRemoved] = useState(false); // Track if user wants to remove existing photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingMode = isEditing ?? !!product;

  const schema = editingMode ? updateProductRequestSchema : createProductRequestSchema;
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<CreateProductRequest | UpdateProductRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: editingMode ? {
      name: product?.name || '',
      brand: product?.brand || '',
      shop: product?.shop || '',
      calories_per_100g_or_ml: product?.calories_per_100g_or_ml || 0,
      macros_per_100g_or_ml: product?.macros_per_100g_or_ml || {
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        saturated_fat: 0
      },
      package_size_g_or_ml: product?.package_size_g_or_ml || 0,
      ingredients: product?.ingredients || [],
      tags: product?.tags || []
    } : {
      name: '',
      brand: '',
      shop: '',
      calories_per_100g_or_ml: 0,
      macros_per_100g_or_ml: {
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        saturated_fat: 0
      },
      package_size_g_or_ml: 0,
      ingredients: [],
      tags: []
    }
  });

  useEffect(() => {
    if (isOpen && product && editingMode) {
      reset({
        name: product.name,
        brand: product.brand || '',
        shop: product.shop || '',
        calories_per_100g_or_ml: product.calories_per_100g_or_ml || 0,
        macros_per_100g_or_ml: product.macros_per_100g_or_ml || {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          sugar: 0,
          fiber: 0,
          saturated_fat: 0
        },
        package_size_g_or_ml: product.package_size_g_or_ml || 0,
        ingredients: product.ingredients || [],
        tags: product.tags
      });
      setSelectedPhoto(null); // Reset photo for editing
      setPhotoRemoved(false); // Reset photo removal state
      
      // Set preview URL for existing photo
      if (product.photo_url) {
        setPreviewUrl(product.photo_url);
      } else if (product.photo_data) {
        // If we have photo_data (base64), create data URL
        const dataUrl = product.photo_data.startsWith('data:') ? product.photo_data : `data:image/jpeg;base64,${product.photo_data}`;
        setPreviewUrl(dataUrl);
      } else {
        setPreviewUrl(null);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (isOpen && !editingMode) {
      reset({
        name: '',
        brand: '',
        shop: '',
        calories_per_100g_or_ml: 0,
        macros_per_100g_or_ml: {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          sugar: 0,
          fiber: 0,
          saturated_fat: 0
        },
        package_size_g_or_ml: 0,
        ingredients: [],
        tags: []
      });
      setSelectedPhoto(null); // Reset photo for new product
      setPreviewUrl(null); // Reset preview URL for new product
      setPhotoRemoved(false); // Reset photo removal state
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, product, editingMode, reset]);

  const handleFormSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    setIsSubmitting(true);
    try {
      let apiData: CreateProductRequest | UpdateProductRequest;
      
      // Consolidate baseData creation
      const baseData = {
        name: data.name!, // Name is required by schema for both create/update
        brand: data.brand || null,
        shop: data.shop || null,
        calories_per_100g_or_ml: data.calories_per_100g_or_ml || null,
        macros_per_100g_or_ml: data.macros_per_100g_or_ml || null,
        package_size_g_or_ml: data.package_size_g_or_ml || null,
        ingredients: data.ingredients || [], // Ensure it's an array
        tags: (data.tags || []) as DietTag[]
      };

      if (onSubmit) {
        await onSubmit({ ...baseData, photoFile: selectedPhoto, photoRemoved }); 
      } else {
        if (editingMode && product) {
          apiData = baseData as UpdateProductRequest;
          if (selectedPhoto) {
            await productApi.updateProductWithPhoto(product.id, {
              ...baseData,
              photo_data: selectedPhoto
            });
          } else {
            await productApi.updateProduct(product.id, apiData as UpdateProductRequest);
          }
          notifications.show({
            title: 'Success',
            message: 'Product updated successfully',
            color: 'green',
          });
        } else { // Creating a new product
          apiData = baseData as CreateProductRequest;
          if (selectedPhoto) {
            await productApi.createProductWithPhoto({
              ...(apiData as CreateProductRequest),
              photo_data: selectedPhoto
            });
          } else {
            await productApi.createProduct(apiData as CreateProductRequest);
          }
          notifications.show({
            title: 'Success',
            message: 'Product created successfully',
            color: 'green',
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: editingMode ? 'Failed to update product' : 'Failed to create product',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedPhoto(null);
    setPreviewUrl(null); // Reset preview URL on cancel
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      title={editingMode ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <Title order={4}>Basic Information</Title>
          
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            {...register('name')}
            error={errors.name?.message}
            required
          />

          <Group grow>
            <TextInput
              label="Brand"
              placeholder="Enter brand name"
              {...register('brand')}
              error={errors.brand?.message}
            />
            
            <TextInput
              label="Shop"
              placeholder="Enter shop name"
              {...register('shop')}
              error={errors.shop?.message}
            />
          </Group>

          {/* Photo Upload Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Photo
            </label>
            
            {/* Show existing photo when editing (and not removed) */}
            {editingMode && (product?.photo_url || product?.photo_data) && !selectedPhoto && !photoRemoved && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Current photo:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Image
                    src={product.photo_url || (product.photo_data?.startsWith('data:') ? product.photo_data : `data:image/jpeg;base64,${product.photo_data}`)}
                    alt={product.name}
                    w={80}
                    h={80}
                    radius="sm"
                    fit="cover"
                    fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjFGM0Y0Ii8+CjxwYXRoIGQ9Ik0zMiAzMkgyNFY0MEgzMlYzMloiIGZpbGw9IiNEOUREREREIi8+CjwvcGF0aD4KPC9zdmc+Cg=="
                  />
                  <Button
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => {
                      setPhotoRemoved(true);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Show photo removed notice with undo option */}
            {editingMode && photoRemoved && !selectedPhoto && (
              <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: '#856404', marginBottom: '4px' }}>
                  Photo will be removed when you save.
                </div>
                <Button
                  variant="outline"
                  color="blue"
                  size="xs"
                  onClick={() => {
                    setPhotoRemoved(false);
                    // Restore preview URL for existing photo
                    if (product?.photo_url) {
                      setPreviewUrl(product.photo_url);
                    } else if (product?.photo_data) {
                      const dataUrl = product.photo_data.startsWith('data:') ? product.photo_data : `data:image/jpeg;base64,${product.photo_data}`;
                      setPreviewUrl(dataUrl);
                    }
                  }}
                >
                  Undo Remove
                </Button>
              </div>
            )}
            
            {/* Show new photo preview */}
            {selectedPhoto && previewUrl && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {editingMode ? 'New photo (will replace current):' : 'Selected photo:'}
                </div>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  w={80}
                  h={80}
                  radius="sm"
                  fit="cover"
                />
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedPhoto(file);
                setPhotoRemoved(false); // Clear photo removal state when new file is selected
                
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setPreviewUrl(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setPreviewUrl(null);
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              {editingMode ? 'Upload a new photo to replace the current one (optional)' : 'Upload a photo of the product (optional)'}
            </small>
            
            {selectedPhoto && (
              <div style={{ marginTop: '8px', color: '#28a745' }}>
                Selected: {selectedPhoto.name}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(null);
                    setPreviewUrl(null);
                    setPhotoRemoved(false); // Clear photo removal state
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <Group grow>
            <Controller
              name="package_size_g_or_ml"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Package Size (g/ml)"
                  placeholder="Enter package size"
                  min={0}
                  step={0.1}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.package_size_g_or_ml?.message}
                />
              )}
            />
          </Group>

          <Divider />

          {/* Nutritional Information */}
          <Title order={4}>Nutritional Information (per 100g/ml)</Title>
          
          <Controller
            name="calories_per_100g_or_ml"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Calories"
                placeholder="Enter calories per 100g/ml"
                min={0}
                value={field.value ?? undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                error={errors.calories_per_100g_or_ml?.message}
              />
            )}
          />

          <Group grow>
            <Controller
              name="macros_per_100g_or_ml.protein"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Protein (g)"
                  placeholder="Enter protein"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.protein?.message}
                />
              )}
            />
            
            <Controller
              name="macros_per_100g_or_ml.carbohydrates"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Carbohydrates (g)"
                  placeholder="Enter carbohydrates"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.carbohydrates?.message}
                />
              )}
            />
            
            <Controller
              name="macros_per_100g_or_ml.fat"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Fat (g)"
                  placeholder="Enter fat"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.fat?.message}
                />
              )}
            />
          </Group>

          <Group grow>
            <Controller
              name="macros_per_100g_or_ml.sugar"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Sugar (g)"
                  placeholder="Enter sugar"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.sugar?.message}
                />
              )}
            />
            
            <Controller
              name="macros_per_100g_or_ml.fiber"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Fiber (g)"
                  placeholder="Enter fiber"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.fiber?.message}
                />
              )}
            />
            
            <Controller
              name="macros_per_100g_or_ml.saturated_fat"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Saturated Fat (g)"
                  placeholder="Enter saturated fat"
                  min={0}
                  step={0.1}
                  {...field}
                  error={errors.macros_per_100g_or_ml?.saturated_fat?.message}
                />
              )}
            />
          </Group>

          <Divider />

          {/* Ingredients Composition */}
          <Title order={4}>Ingredients Composition</Title>
          
          <Controller
            name="ingredients"
            control={control}
            render={({ field }) => (
              <IngredientSelector
                selectedIngredients={field.value || []}
                onIngredientsChange={field.onChange}
                error={errors.ingredients?.message}
              />
            )}
          />

          <Divider />

          {/* Tags */}
          <Title order={4}>Diet Tags</Title>
          
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Diet Tags"
                placeholder="Select diet tags"
                data={dietTagOptions}
                value={field.value || []}
                onChange={field.onChange}
                error={errors.tags?.message}
                searchable
                clearable
              />
            )}
          />

          {/* Form Actions */}
          <Group justify="flex-end" mt="lg">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingMode ? 'Update Product' : 'Create Product'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export { AddEditProductForm };
export default AddEditProductForm;
