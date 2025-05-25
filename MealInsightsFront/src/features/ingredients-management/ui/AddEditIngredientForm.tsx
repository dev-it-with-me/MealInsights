/**
 * Form C1000.AddEditIngredientForm
 * Allows input/edit of ingredient details (name, photo, shop, calories, macros, tags)
 */
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  NumberInput,
  MultiSelect,
  FileInput,
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
  ingredientCreateSchema, 
  ingredientUpdateSchema,
  type IngredientCreateInput,
  type IngredientUpdateInput 
} from '@/entities/ingredient/lib/schemas';
import { ingredientApi } from '@/entities/ingredient/api/ingredientApi';
import type { 
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest 
} from '@/entities/ingredient/model/types';

interface AddEditIngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  ingredient?: Ingredient | null;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const dietTagOptions = Object.values(DietTagEnum).map(tag => ({
  value: tag,
  label: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const AddEditIngredientForm = ({
  isOpen,
  onClose,
  onSubmit,
  ingredient,
  isEditing,
  onSuccess
}: AddEditIngredientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editingMode = isEditing ?? !!ingredient;

  const schema = editingMode ? ingredientUpdateSchema : ingredientCreateSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors }
  } = useForm<IngredientCreateInput | IngredientUpdateInput>({
    resolver: zodResolver(schema),
    defaultValues: editingMode ? {
      name: ingredient?.name || '',
      shop: ingredient?.shop || '',
      calories_per_100g_or_ml: ingredient?.calories_per_100g_or_ml || 0,
      macros_per_100g_or_ml: ingredient?.macros_per_100g_or_ml || {
        protein: 0,
        carbohydrates: 0,
        fat: 0
      },
      tags: ingredient?.tags || []
    } : {
      name: '',
      shop: '',
      calories_per_100g_or_ml: 0,
      macros_per_100g_or_ml: {
        protein: 0,
        carbohydrates: 0,
        fat: 0
      },
      tags: []
    }
  });

  const watchedTags = watch('tags') || [];

  useEffect(() => {
    if (isOpen && ingredient && editingMode) {
      reset({
        name: ingredient.name,
        shop: ingredient.shop || '',
        calories_per_100g_or_ml: ingredient.calories_per_100g_or_ml,
        macros_per_100g_or_ml: ingredient.macros_per_100g_or_ml,
        tags: ingredient.tags
      });
    } else if (isOpen && !editingMode) {
      reset({
        name: '',
        shop: '',
        calories_per_100g_or_ml: 0,
        macros_per_100g_or_ml: {
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        tags: []
      });
    }
  }, [isOpen, ingredient, editingMode, reset]);

  const handleFormSubmit = async (data: IngredientCreateInput | IngredientUpdateInput) => {
    setIsSubmitting(true);
    try {
      // Convert form data to API-compatible format
      let apiData: CreateIngredientRequest | UpdateIngredientRequest;
      
      if (editingMode && ingredient) {
        apiData = {
          name: data.name,
          shop: data.shop,
          calories_per_100g_or_ml: data.calories_per_100g_or_ml,
          macros_per_100g_or_ml: data.macros_per_100g_or_ml,
          tags: (data.tags || []) as DietTag[]
        } as UpdateIngredientRequest;
      } else {
        apiData = {
          name: data.name!,
          shop: data.shop,
          calories_per_100g_or_ml: data.calories_per_100g_or_ml!,
          macros_per_100g_or_ml: data.macros_per_100g_or_ml!,
          tags: (data.tags || []) as DietTag[]
        } as CreateIngredientRequest;
      }

      if (onSubmit) {
        // Use external submit handler
        await onSubmit(apiData);
      } else {
        // Use internal submit logic
        if (editingMode && ingredient) {
          await ingredientApi.updateIngredient(ingredient.id, apiData as UpdateIngredientRequest);
          notifications.show({
            title: 'Success',
            message: 'Ingredient updated successfully!',
            color: 'green',
          });
        } else {
          await ingredientApi.createIngredient(apiData as CreateIngredientRequest);
          notifications.show({
            title: 'Success',
            message: 'Ingredient created successfully!',
            color: 'green',
          });
        }
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'An error occurred',
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
      title={
        <Title order={3}>
          {editingMode ? 'Edit Ingredient' : 'Add New Ingredient'}
        </Title>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="md">
          {/* E3010 - NameField */}
          <TextInput
            label="Name"
            placeholder="Enter ingredient name"
            error={errors.name?.message}
            {...register('name')}
            required
          />

          {/* E3012 - ShopField */}
          <TextInput
            label="Shop"
            placeholder="Where did you buy this ingredient?"
            error={errors.shop?.message}
            {...register('shop')}
          />

          {/* E3011 - PhotoUploadField - TODO: Implement file upload */}
          <FileInput
            label="Photo"
            placeholder="Upload ingredient photo"
            accept="image/*"
            disabled // TODO: Implement photo upload functionality
          />

          <Divider label="Nutritional Information" labelPosition="center" />

          {/* E3013 - CaloriesField */}
          <Controller
            name="calories_per_100g_or_ml"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Calories per 100g/ml"
                placeholder="0"
                min={0}
                error={errors.calories_per_100g_or_ml?.message}
                {...field}
              />
            )}
          />

          {/* Macros Fields - E3014, E3015, E3016 */}
          <Group grow>
            <Controller
              name="macros_per_100g_or_ml.protein"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Protein (g)"
                  placeholder="0"
                  min={0}
                  error={errors.macros_per_100g_or_ml?.protein?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="macros_per_100g_or_ml.carbohydrates"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Carbohydrates (g)"
                  placeholder="0"
                  min={0}
                  error={errors.macros_per_100g_or_ml?.carbohydrates?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="macros_per_100g_or_ml.fat"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Fat (g)"
                  placeholder="0"
                  min={0}
                  error={errors.macros_per_100g_or_ml?.fat?.message}
                  {...field}
                />
              )}
            />
          </Group>

          {/* E3017 - TagsField */}
          <MultiSelect
            label="Tags"
            placeholder="Select diet tags"
            data={dietTagOptions}
            value={watchedTags}
            onChange={(value) => setValue('tags', value as DietTag[])}
            error={errors.tags?.message}
            searchable
            clearable
          />

          {/* Action Buttons - E3018, E3019 */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {editingMode ? 'Update Ingredient' : 'Add Ingredient'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddEditIngredientForm;
