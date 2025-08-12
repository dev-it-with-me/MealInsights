import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Modal, TextInput, Textarea, Button, Group, Stack,
  NumberInput, MultiSelect, Switch, Title, Divider,
  ScrollArea, Grid, Card, notifications, useForm, FileInput
} from '@/shared/ui-kit';
import { 
  IconChefHat, 
  IconPhoto, 
  IconCalculator 
} from '@tabler/icons-react';
import { DietTagEnum } from '@/shared/lib/types';
import type { 
  Meal, 
  CreateMealRequest, 
  UpdateMealRequest
} from '@/entities/meal/model/types';
import { IngredientSelectorForMeal, type MealIngredient as MealIngredientType } from './IngredientSelectorForMeal';
import { IngredientEquivalentsManager, type MealEquivalent } from './IngredientEquivalentsManager';

interface AddEditMealFormProps {
  meal?: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMealRequest | UpdateMealRequest) => Promise<void>;
  isLoading?: boolean;
}

interface FormValues {
  name: string;
  recipe: string;
  photo_data: string | null;
  calories_total: number | null;
  macros_total: {
    protein: number;
    carbohydrates: number;
    sugar: number;
    fat: number;
    fiber: number;
    saturated_fat: number;
  } | null;
  is_nutrition_calculated: boolean;
  tags: string[];
  ingredients: MealIngredientType[];
  equivalents: MealEquivalent[];
}

const AddEditMealForm = ({ 
  meal, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: AddEditMealFormProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      recipe: '',
      photo_data: null,
      calories_total: null,
      macros_total: null,
      is_nutrition_calculated: false,
      tags: [],
      ingredients: [],
      equivalents: []
    },
    validate: {
      name: (value) => 
        value.length < 1 ? 'Meal name is required' : 
        value.length > 150 ? 'Meal name must be less than 150 characters' : null,
    },
  });

  useEffect(() => {
    if (meal && isOpen) {
      // Convert meal ingredients to local format
      const convertedIngredients: MealIngredientType[] = meal.ingredients.map(ing => ({
        id: ing.item_id,
        name: ing.item_name,
        type: ing.item_type,
        quantity: ing.quantity,
        unit: ing.unit,
        calories_per_100g: 0, // Will be fetched if needed
        protein_per_100g: 0,
        carbs_per_100g: 0,
        sugar_per_100g: 0,
        fat_per_100g: 0,
        fiber_per_100g: 0,
        saturated_fat_per_100g: 0,
      }));

      // Convert meal equivalents to local format
      const convertedEquivalents: MealEquivalent[] = meal.equivalents.map(equiv => ({
        originalIngredientId: equiv.original_item_id,
        originalIngredientName: 'N/A', // We'll need to look this up
        originalIngredientType: 'ingredient', // Default type since API doesn't provide this
        equivalentIngredientId: equiv.equivalent_item_id,
        equivalentIngredientName: equiv.equivalent_item_name,
        equivalentIngredientType: equiv.equivalent_item_type,
      }));

      form.setValues({
        name: meal.name,
        recipe: meal.recipe || '',
        photo_data: meal.photo_data ?? null,
        calories_total: meal.calories_total ?? null,
        macros_total: meal.macros_total ?? null,
        is_nutrition_calculated: meal.is_nutrition_calculated,
        tags: meal.tags,
        ingredients: convertedIngredients,
        equivalents: convertedEquivalents
      });
    } else if (!meal && isOpen) {
      form.reset();
    }
  }, [meal, isOpen]);

  const handleIngredientsChange = useCallback((ingredients: MealIngredientType[]) => {
    form.setFieldValue('ingredients', ingredients);
  }, []);

  const handleEquivalentsChange = useCallback((equivalents: MealEquivalent[]) => {
    form.setFieldValue('equivalents', equivalents);
  }, []);

  const handleSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      const mealData = {
        name: values.name,
        recipe: values.recipe || null,
        photo_data: values.photo_data,
        calories_total: values.calories_total,
        macros_total: values.macros_total,
        is_nutrition_calculated: values.is_nutrition_calculated,
        tags: values.tags as any, // Cast to DietTag[] - will be validated by backend
        // Convert local ingredient format to API format
        ingredients: values.ingredients.map(ing => ({
          item_id: ing.id,
          item_type: ing.type,
          item_name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit as any, // Cast to Unit type - will be validated by backend
        })),
        // Convert local equivalent format to API format  
        equivalents: values.equivalents.map(equiv => ({
          original_item_id: equiv.originalIngredientId,
          equivalent_item_id: equiv.equivalentIngredientId,
          equivalent_item_type: equiv.equivalentIngredientType,
          equivalent_item_name: equiv.equivalentIngredientName,
          conversion_ratio: 1, // Default conversion ratio
        }))
      };

      await onSubmit(mealData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit meal:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save meal. Please try again.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateNutrition = useCallback(() => {
    const ingredients = form.values.ingredients;
    
    if (ingredients.length === 0) {
      notifications.show({
        title: 'No Ingredients',
        message: 'Add some ingredients first to calculate nutrition',
        color: 'orange',
      });
      return;
    }

    const totals = ingredients.reduce((acc, ingredient) => {
      const factor = ingredient.quantity / 100; // Convert to per-100g basis
      
      return {
        protein: acc.protein + (ingredient.protein_per_100g * factor),
        carbohydrates: acc.carbohydrates + (ingredient.carbs_per_100g * factor),
        sugar: acc.sugar + (ingredient.sugar_per_100g * factor),
        fat: acc.fat + (ingredient.fat_per_100g * factor),
        fiber: acc.fiber + (ingredient.fiber_per_100g * factor),
        saturated_fat: acc.saturated_fat + (ingredient.saturated_fat_per_100g * factor),
      };
    }, {
      protein: 0,
      carbohydrates: 0,
      sugar: 0,
      fat: 0,
      fiber: 0,
      saturated_fat: 0,
    });

    const totalCalories = ingredients.reduce((acc, ingredient) => {
      const factor = ingredient.quantity / 100;
      return acc + (ingredient.calories_per_100g * factor);
    }, 0);

    // Update form values
    form.setFieldValue('calories_total', Math.round(totalCalories));
    form.setFieldValue('macros_total', {
      protein: Math.round(totals.protein * 10) / 10,
      carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      saturated_fat: Math.round(totals.saturated_fat * 10) / 10,
    });
    form.setFieldValue('is_nutrition_calculated', true);

    notifications.show({
      title: 'Nutrition Calculated',
      message: 'Nutritional values have been calculated from selected ingredients',
      color: 'green',
    });
  }, [form.values.ingredients]);

  const handleFileUpload = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64Data = base64.split(',')[1];
        form.setFieldValue('photo_data', base64Data);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue('photo_data', null);
    }
  }, []);

  const dietTagOptions = useMemo(() => 
    Object.values(DietTagEnum).map(tag => ({
      value: tag,
      label: tag.replace('_', ' ').toUpperCase()
    })), []);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconChefHat size={20} />
          <Title order={3}>
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </Title>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <TextInput
            label="Meal Name"
            placeholder="Enter meal name"
            required
            {...form.getInputProps('name')}
          />

          <FileInput
            label="Meal Photo"
            placeholder="Upload a photo of the meal"
            accept="image/*"
            leftSection={<IconPhoto size={16} />}
            onChange={(file: File | null) => handleFileUpload(file as any)}
          />

          <Textarea
            label="Recipe Instructions"
            placeholder="Enter preparation instructions..."
            minRows={4}
            maxRows={8}
            autosize
            {...form.getInputProps('recipe')}
          />

          <Divider label="Ingredients & Composition" />
          
          <Card withBorder p="md">
            <IngredientSelectorForMeal
              selectedIngredients={form.values.ingredients}
              onIngredientsChange={handleIngredientsChange}
            />
          </Card>

          {form.values.ingredients.length > 0 && (
            <Card withBorder p="md">
              <IngredientEquivalentsManager
                selectedIngredients={form.values.ingredients}
                equivalents={form.values.equivalents}
                onEquivalentsChange={handleEquivalentsChange}
              />
            </Card>
          )}

          <Divider label="Nutrition Information" />

          <Group grow>
            <Switch
              label="Auto-calculate nutrition from ingredients"
              {...form.getInputProps('is_nutrition_calculated', { type: 'checkbox' })}
            />
            <Button 
              variant="light" 
              leftSection={<IconCalculator size={16} />}
              disabled={!form.values.is_nutrition_calculated || form.values.ingredients.length === 0}
              onClick={calculateNutrition}
            >
              Calculate
            </Button>
          </Group>

          <Group grow>
            <NumberInput
              label="Total Calories"
              placeholder="0"
              min={0}
              disabled={form.values.is_nutrition_calculated}
              {...form.getInputProps('calories_total')}
            />
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Protein (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.protein || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.protein', Number(value) || 0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Carbohydrates (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.carbohydrates || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.carbohydrates', Number(value) || 0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Sugar (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.sugar || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.sugar', Number(value) || 0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Fat (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.fat || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.fat', Number(value) || 0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Fiber (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.fiber || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.fiber', Number(value) || 0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Saturated Fat (g)"
                placeholder="0"
                min={0}
                decimalScale={1}
                disabled={form.values.is_nutrition_calculated}
                value={form.values.macros_total?.saturated_fat || 0}
                onChange={(value: any) => form.setFieldValue('macros_total.saturated_fat', Number(value) || 0)}
              />
            </Grid.Col>
          </Grid>
          
          <MultiSelect
            label="Diet Tags"
            placeholder="Select applicable diet tags"
            data={dietTagOptions}
            {...form.getInputProps('tags')}
            searchable
            clearable
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={submitting || isLoading}
              leftSection={<IconChefHat size={16} />}
            >
              {meal ? 'Update Meal' : 'Create Meal'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddEditMealForm;
