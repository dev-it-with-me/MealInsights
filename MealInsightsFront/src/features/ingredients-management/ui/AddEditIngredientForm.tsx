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
  TagsInput,
  Group,
  Stack,
  Divider,
  Button,
  Image,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect, useRef, useCallback } from 'react';

import { Modal } from '@/shared/ui';
import { DietTagEnum } from '@/shared/lib/types';
import type { DietTag } from '@/shared/lib/types';
import { createImageDataUrl, isValidPhotoData } from '@/shared/lib/imageUtils';
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
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false); // Track if user wants to remove existing photo
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      shops: ingredient?.shops || [],
      calories_per_100g_or_ml: ingredient?.calories_per_100g_or_ml || 0,
      macros_per_100g_or_ml: ingredient?.macros_per_100g_or_ml || {
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        saturated_fat: 0
      },
      tags: ingredient?.tags || []
    } : {
      name: '',
      shops: [],
      calories_per_100g_or_ml: 0,
      macros_per_100g_or_ml: {
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        saturated_fat: 0
      },
      tags: []
    }
  });

  const watchedTags = watch('tags') || [];
  const watchedShops = watch('shops') || [];

  useEffect(() => {
    if (isOpen && ingredient && editingMode) {
      reset({
        name: ingredient.name,
        shops: ingredient.shops || [],
        calories_per_100g_or_ml: ingredient.calories_per_100g_or_ml,
        macros_per_100g_or_ml: ingredient.macros_per_100g_or_ml,
        tags: ingredient.tags
      });
      setSelectedPhoto(null);
      setPhotoRemoved(false); // Reset photo removal state
      
      // Set preview URL for existing photo
      if (ingredient.photo_url) {
        setPreviewUrl(ingredient.photo_url);
        console.log('useEffect (editing): Setting previewUrl from photo_url:', ingredient.photo_url);
      } else if (ingredient.photo_data && isValidPhotoData(ingredient.photo_data)) {
        setPreviewUrl(createImageDataUrl(ingredient.photo_data));
        console.log('useEffect (editing): Setting previewUrl from photo_data');
      } else {
        setPreviewUrl(null);
        console.log('useEffect (editing): No existing photo, setting previewUrl to null');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (isOpen && !editingMode) {
      reset({
        name: '',
        shops: [],
        calories_per_100g_or_ml: 0,
        macros_per_100g_or_ml: {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          sugar: 0,
          fiber: 0,
          saturated_fat: 0
        },
        tags: []
      });
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setPhotoRemoved(false); // Reset photo removal state
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, ingredient?.id, editingMode]); // Removed reset and use ingredient.id instead of whole ingredient object

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleRemovePhoto = useCallback(() => {
    if (editingMode && ingredient && (ingredient.photo_url || ingredient.photo_data)) {
      // Editing mode: mark existing photo for removal
      setPhotoRemoved(true);
      setPreviewUrl(null);
      setSelectedPhoto(null);
    } else {
      // Create mode or no existing photo: just clear current selection
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setPhotoRemoved(false); // Clear photo removal state
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editingMode, ingredient]);

  const handleKeepExistingPhoto = useCallback(() => {
    setPhotoRemoved(false);
    if (ingredient?.photo_url) {
      setPreviewUrl(ingredient.photo_url);
    } else if (ingredient?.photo_data && isValidPhotoData(ingredient.photo_data)) {
      setPreviewUrl(createImageDataUrl(ingredient.photo_data));
    }
    setSelectedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [ingredient]);

  const handleRemoveNewPhoto = useCallback(() => {
    setSelectedPhoto(null);
    setPreviewUrl(null);
    setPhotoRemoved(false); // Clear photo removal state
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFormSubmit = async (data: IngredientCreateInput | IngredientUpdateInput) => {
    setIsSubmitting(true);
    try {
      const baseData = {
        name: data.name!,
        shops: data.shops!,
        calories_per_100g_or_ml: data.calories_per_100g_or_ml!,
        macros_per_100g_or_ml: data.macros_per_100g_or_ml!,
        tags: (data.tags || []) as DietTag[]
      };

      if (onSubmit) {
        // If a custom onSubmit is provided, use it and pass photo info
        console.log('handleFormSubmit: Using custom onSubmit prop. Passing data, selectedPhoto:', selectedPhoto, 'photoRemoved:', photoRemoved);
        await onSubmit({ ...baseData, photoFile: selectedPhoto, photoRemoved });
      } else {
        // Use built-in API calls
        if (editingMode && ingredient) {
          if (selectedPhoto) {
            console.log('handleFormSubmit (editing): selectedPhoto is TRUTHY, attempting to call updateIngredientWithPhoto.');
            const photoUploadData = {
              ...baseData,
              photo_data: selectedPhoto
            };
            await ingredientApi.updateIngredientWithPhoto(ingredient.id, photoUploadData);
          } else if (photoRemoved) {
            console.log('handleFormSubmit (editing): photoRemoved is true, updating with photo removal.');
            // Note: This would need to be handled by the parent component since ingredientApi.updateIngredient 
            // might not handle photo_data: null. For now, using regular update.
            await ingredientApi.updateIngredient(ingredient.id, baseData as UpdateIngredientRequest);
          } else {
            console.log('handleFormSubmit (editing): no photo changes, calling regular updateIngredient.');
            await ingredientApi.updateIngredient(ingredient.id, baseData as UpdateIngredientRequest);
          }
          notifications.show({
            title: 'Success',
            message: 'Ingredient updated successfully!',
            color: 'green',
          });
        } else {
          // Creating new ingredient
          if (selectedPhoto) {
            console.log('handleFormSubmit (creating): selectedPhoto is TRUTHY, attempting to call createIngredientWithPhoto.');
            const photoUploadData = {
              ...baseData,
              photo_data: selectedPhoto
            };
            await ingredientApi.createIngredientWithPhoto(photoUploadData);
          } else {
            console.log('handleFormSubmit (creating): no photo, calling regular createIngredient.');
            await ingredientApi.createIngredient(baseData as CreateIngredientRequest);
          }
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
    setSelectedPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      title={editingMode ? 'Edit Ingredient' : 'Add New Ingredient'}
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

          {/* E3012 - ShopsField */}
          <TagsInput
            label="Shops"
            placeholder="Add shops where you can buy this ingredient"
            value={watchedShops}
            onChange={(value) => setValue('shops', value)}
            splitChars={[',', '|', ';']}
            clearable
            error={errors.shops?.message}
            description="Press Enter or comma to add multiple shops"
          />

          {/* E3011 - PhotoUploadField */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Photo
            </label>
            
            {/* Show existing photo when editing (and not removed) */}
            {editingMode && isValidPhotoData(ingredient?.photo_data) && !selectedPhoto && !photoRemoved && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Current photo:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Image
                    src={createImageDataUrl(ingredient!.photo_data)}
                    alt={ingredient!.name}
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
                    onClick={handleRemovePhoto}
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
                  onClick={handleKeepExistingPhoto}
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
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              {editingMode ? 'Upload a new photo to replace the current one (optional)' : 'Upload a photo of the ingredient (optional)'}
            </small>
            
            {selectedPhoto && (
              <div style={{ marginTop: '8px', color: '#28a745' }}>
                Selected: {selectedPhoto.name}
                <button
                  type="button"
                  onClick={handleRemoveNewPhoto}
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

          {/* Macros Fields - E3014, E3015, E3016, E3017, E3018, E3019 */}
          <Group grow>
            <Controller
              name="macros_per_100g_or_ml.protein"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Protein (g)"
                  placeholder="0"
                  min={0}
                  step={0.1}
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
                  step={0.1}
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
                  step={0.1}
                  error={errors.macros_per_100g_or_ml?.fat?.message}
                  {...field}
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
                  placeholder="0"
                  min={0}
                  step={0.1}
                  error={errors.macros_per_100g_or_ml?.sugar?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="macros_per_100g_or_ml.fiber"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Fiber (g)"
                  placeholder="0"
                  min={0}
                  step={0.1}
                  error={errors.macros_per_100g_or_ml?.fiber?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="macros_per_100g_or_ml.saturated_fat"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Saturated Fat (g)"
                  placeholder="0"
                  min={0}
                  step={0.1}
                  error={errors.macros_per_100g_or_ml?.saturated_fat?.message}
                  {...field}
                />
              )}
            />
          </Group>

          {/* E3020 - TagsField */}
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

          {/* Action Buttons - E3021, E3022 */}
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
