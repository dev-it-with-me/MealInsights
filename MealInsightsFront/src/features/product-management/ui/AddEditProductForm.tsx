/**
 * Form for adding/editing products
 * Handles product-specific fields like brand, barcode, package size, ingredients composition
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';

import { Modal } from '@/shared/ui';
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

type ProductFormData = CreateProductRequest | UpdateProductRequest;

const AddEditProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isEditing,
  onSuccess
}: AddEditProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Debug: log modal open state on each render
  console.debug('AddEditProductForm render: isOpen=', isOpen);
  const editingMode = isEditing ?? !!product;

  const schema = editingMode ? updateProductRequestSchema : createProductRequestSchema;
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: editingMode ? {
      name: product?.name || '',
      brand: product?.brand || '',
      shop: product?.shop || '',
      barcode: product?.barcode || '',
      calories_per_100g_or_ml: product?.calories_per_100g_or_ml || 0,
      macros_per_100g_or_ml: product?.macros_per_100g_or_ml || {
        protein: 0,
        carbohydrates: 0,
        fat: 0
      },
      package_size_g_or_ml: product?.package_size_g_or_ml || 0,
      tags: product?.tags || []
    } : {
      name: '',
      brand: '',
      shop: '',
      barcode: '',
      calories_per_100g_or_ml: 0,
      macros_per_100g_or_ml: {
        protein: 0,
        carbohydrates: 0,
        fat: 0
      },
      package_size_g_or_ml: 0,
      tags: []
    }
  });

  useEffect(() => {
    if (isOpen && product && editingMode) {
      reset({
        name: product.name,
        brand: product.brand || '',
        shop: product.shop || '',
        barcode: product.barcode || '',
        calories_per_100g_or_ml: product.calories_per_100g_or_ml || 0,
        macros_per_100g_or_ml: product.macros_per_100g_or_ml || {
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        package_size_g_or_ml: product.package_size_g_or_ml || 0,
        tags: product.tags
      });
    } else if (isOpen && !editingMode) {
      reset({
        name: '',
        brand: '',
        shop: '',
        barcode: '',
        calories_per_100g_or_ml: 0,
        macros_per_100g_or_ml: {
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        package_size_g_or_ml: 0,
        tags: []
      });
    }
  }, [isOpen, product, editingMode, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      let apiData: CreateProductRequest | UpdateProductRequest;
      
      if (editingMode && product) {
        apiData = {
          name: data.name,
          brand: data.brand || null,
          shop: data.shop || null,
          barcode: data.barcode || null,
          calories_per_100g_or_ml: data.calories_per_100g_or_ml || null,
          macros_per_100g_or_ml: data.macros_per_100g_or_ml || null,
          package_size_g_or_ml: data.package_size_g_or_ml || null,
          tags: (data.tags || []) as DietTag[]
        } as UpdateProductRequest;
      } else {
        apiData = {
          name: data.name!,
          brand: data.brand || null,
          shop: data.shop || null,
          barcode: data.barcode || null,
          calories_per_100g_or_ml: data.calories_per_100g_or_ml || null,
          macros_per_100g_or_ml: data.macros_per_100g_or_ml || null,
          package_size_g_or_ml: data.package_size_g_or_ml || null,
          tags: (data.tags || []) as DietTag[]
        } as CreateProductRequest;
      }

      if (onSubmit) {
        await onSubmit(apiData);
      } else {
        // Use built-in API calls
        if (editingMode && product) {
          await productApi.updateProduct(product.id, apiData as UpdateProductRequest);
          notifications.show({
            title: 'Success',
            message: 'Product updated successfully',
            color: 'green',
          });
        } else {
          await productApi.createProduct(apiData as CreateProductRequest);
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
      console.error('Error submitting product form:', error);
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

          <Group grow>
            <TextInput
              label="Barcode"
              placeholder="Enter barcode"
              {...register('barcode')}
              error={errors.barcode?.message}
            />
            
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
