"""
Service layer for meals business logic.
"""

from typing import List
import uuid
from app.enums import DietTagEnum
from app.models import Macros
from app.ingredients_and_products.repositories import (
    IngredientRepository,
    ProductRepository,
)
from ..ingredients_and_products.models import Ingredient, Product
from .models import Meal, MealIngredient, IngredientEquivalent
from .repositories import MealRepository
from .schemas import (
    CreateMealSchema,
    UpdateMealSchema,
    MealResponseSchema,
    MealListResponseSchema,
    MealIngredientSchema,
    IngredientEquivalentSchema,
)
from .exceptions import MealValidationError


class MealService:
    """Service class for meal business logic."""

    def __init__(
        self,
        meal_repository: MealRepository,
        ingredient_repository: IngredientRepository,
        product_repository: ProductRepository,
    ):
        self.meal_repository = meal_repository
        self.ingredient_repository = ingredient_repository
        self.product_repository = product_repository

    async def create_meal(self, meal_data: CreateMealSchema) -> MealResponseSchema:
        """Create a new meal."""
        # Convert schemas to models
        ingredients: list[MealIngredient] = [
            self._schema_to_meal_ingredient(ing) for ing in meal_data.ingredients
        ]
        equivalents = [
            self._schema_to_ingredient_equivalent(eq) for eq in meal_data.equivalents
        ]

        # Validate that all ingredients/products exist
        await self._validate_meal_items(ingredients)

        tags_from_items: list[DietTagEnum] = []
        item: Ingredient | Product | None = None
        for ingredient in ingredients:
            # fetch the underlying ingredient or product
            if ingredient.item_type == "ingredient":
                item = self.ingredient_repository.get_by_id(ingredient.item_id)
            else:  # product
                item = self.product_repository.get_by_id(ingredient.item_id)
            if item:
                tags_from_items.extend(item.tags)

        print(tags_from_items)

        if not meal_data.tags:
            # merge user-provided tags with those derived from items
            merged_tags = list(set(tags_from_items))
        else:
            merged_tags = list(set(meal_data.tags + tags_from_items))

        print(merged_tags)

        # Create meal model
        meal = Meal(
            name=meal_data.name,
            photo_data=meal_data.photo_data,
            recipe=meal_data.recipe,
            ingredients=ingredients,
            equivalents=equivalents,
            calories_total=meal_data.calories_total,
            macros_total=meal_data.macros_total,
            is_nutrition_calculated=meal_data.is_nutrition_calculated,
            tags=merged_tags,
        )

        # Auto-calculate nutrition if requested and no manual values provided
        if meal_data.is_nutrition_calculated and not meal_data.calories_total:
            await self._calculate_meal_nutrition(meal)

        # Save meal
        created_meal = await self.meal_repository.create_meal(meal)

        return self._meal_to_response_schema(created_meal)

    async def get_meal(self, meal_id: uuid.UUID) -> MealResponseSchema:
        """Get a meal by ID."""
        meal = await self.meal_repository.get_meal_by_id(meal_id)
        return self._meal_to_response_schema(meal)

    async def get_all_meals(
        self, skip: int = 0, limit: int = 100
    ) -> List[MealListResponseSchema]:
        """Get all meals with pagination."""
        meals = await self.meal_repository.get_all_meals(skip, limit)

        return [
            MealListResponseSchema(
                id=meal.id,
                name=meal.name,
                photo_data=meal.photo_data,
                calories_total=meal.calories_total,
                tags=meal.tags,
                ingredient_count=len(meal.ingredients),
            )
            for meal in meals
        ]

    async def update_meal(
        self, meal_id: uuid.UUID, meal_data: UpdateMealSchema
    ) -> MealResponseSchema:
        """Update an existing meal."""
        # Get existing meal
        existing_meal = await self.meal_repository.get_meal_by_id(meal_id)

        # Convert schemas to models if provided
        if meal_data.ingredients is not None:
            ingredients = [
                self._schema_to_meal_ingredient(ing) for ing in meal_data.ingredients
            ]
            await self._validate_meal_items(ingredients)
            existing_meal.ingredients = ingredients

        if meal_data.equivalents is not None:
            equivalents = [
                self._schema_to_ingredient_equivalent(eq)
                for eq in meal_data.equivalents
            ]
            existing_meal.equivalents = equivalents

        # Update other fields
        update_dict = meal_data.model_dump(
            exclude_unset=True, exclude={"ingredients", "equivalents"}
        )

        tags_from_items: list[DietTagEnum] = []
        item: Ingredient | Product | None = None
        for mi in existing_meal.ingredients:
            # fetch the underlying ingredient or product
            if mi.item_type == "ingredient":
                item = self.ingredient_repository.get_by_id(mi.item_id)
            else:  # product
                item = self.product_repository.get_by_id(mi.item_id)
            if item:
                tags_from_items.extend(item.tags)

        # merge with any user-provided tags; otherwise derive solely from items
        if not meal_data.tags:
            merged = list(set(tags_from_items))
        else:
            merged = list(set(meal_data.tags + tags_from_items))

        update_dict["tags"] = merged

        for field, value in update_dict.items():
            setattr(existing_meal, field, value)

        # Recalculate nutrition if needed
        if meal_data.is_nutrition_calculated and meal_data.ingredients is not None:
            await self._calculate_meal_nutrition(existing_meal)

        # Save updated meal
        updated_meal = await self.meal_repository.update_meal(meal_id, existing_meal)

        return self._meal_to_response_schema(updated_meal)

    async def delete_meal(self, meal_id: uuid.UUID) -> None:
        """Delete a meal."""
        await self.meal_repository.delete_meal(meal_id)

    async def search_meals(
        self, name_query: str, skip: int = 0, limit: int = 100
    ) -> List[MealListResponseSchema]:
        """Search meals by name."""
        meals = await self.meal_repository.search_meals_by_name(name_query, skip, limit)

        return [
            MealListResponseSchema(
                id=meal.id,
                name=meal.name,
                photo_data=meal.photo_data,
                calories_total=meal.calories_total,
                tags=meal.tags,
                ingredient_count=len(meal.ingredients),
            )
            for meal in meals
        ]

    def _schema_to_meal_ingredient(
        self, schema: MealIngredientSchema
    ) -> MealIngredient:
        """Convert MealIngredientSchema to MealIngredient model."""
        return MealIngredient(
            item_id=schema.item_id,
            item_type=schema.item_type,
            item_name=schema.item_name,
            quantity=schema.quantity,
            unit=schema.unit,
        )

    def _schema_to_ingredient_equivalent(
        self, schema: IngredientEquivalentSchema
    ) -> IngredientEquivalent:
        """Convert IngredientEquivalentSchema to IngredientEquivalent model."""
        return IngredientEquivalent(
            original_item_id=schema.original_item_id,
            equivalent_item_id=schema.equivalent_item_id,
            equivalent_item_type=schema.equivalent_item_type,
            equivalent_item_name=schema.equivalent_item_name,
            conversion_ratio=schema.conversion_ratio,
        )

    def _meal_ingredient_to_schema(self, model: MealIngredient) -> MealIngredientSchema:
        """Convert MealIngredient model to MealIngredientSchema."""
        return MealIngredientSchema(
            item_id=model.item_id,
            item_type=model.item_type,
            item_name=model.item_name,
            quantity=model.quantity,
            unit=model.unit,
        )

    def _ingredient_equivalent_to_schema(
        self, model: IngredientEquivalent
    ) -> IngredientEquivalentSchema:
        """Convert IngredientEquivalent model to IngredientEquivalentSchema."""
        return IngredientEquivalentSchema(
            original_item_id=model.original_item_id,
            equivalent_item_id=model.equivalent_item_id,
            equivalent_item_type=model.equivalent_item_type,
            equivalent_item_name=model.equivalent_item_name,
            conversion_ratio=model.conversion_ratio,
        )

    def _meal_to_response_schema(self, meal: Meal) -> MealResponseSchema:
        """Convert Meal model to MealResponseSchema with proper schema conversion."""
        # Convert ingredients and equivalents to schemas
        ingredient_schemas = [
            self._meal_ingredient_to_schema(ing) for ing in meal.ingredients
        ]
        equivalent_schemas = [
            self._ingredient_equivalent_to_schema(eq) for eq in meal.equivalents
        ]

        return MealResponseSchema(
            id=meal.id,
            name=meal.name,
            photo_data=meal.photo_data,
            recipe=meal.recipe,
            ingredients=ingredient_schemas,
            equivalents=equivalent_schemas,
            calories_total=meal.calories_total,
            macros_total=meal.macros_total,
            is_nutrition_calculated=meal.is_nutrition_calculated,
            tags=meal.tags,
        )

    async def _validate_meal_items(self, ingredients: List[MealIngredient]) -> None:
        """Validate that all meal ingredients/products exist."""
        for ingredient in ingredients:
            try:
                if ingredient.item_type == "ingredient":
                    item = self.ingredient_repository.get_by_id(ingredient.item_id)
                    if not item:
                        raise MealValidationError(
                            f"Ingredient {ingredient.item_id} not found"
                        )
                elif ingredient.item_type == "product":
                    product = self.product_repository.get_by_id(ingredient.item_id)
                    if not product:
                        raise MealValidationError(
                            f"Product {ingredient.item_id} not found"
                        )
                else:
                    raise MealValidationError(
                        f"Invalid item type: {ingredient.item_type}"
                    )
            except Exception as e:
                raise MealValidationError(
                    f"Item {ingredient.item_id} not found: {str(e)}"
                )

    async def _calculate_meal_nutrition(self, meal: Meal) -> None:
        """Calculate total nutrition for a meal based on its ingredients."""
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_sugar = 0.0
        total_fat = 0.0
        total_fiber = 0.0
        total_saturated_fat = 0.0

        for meal_ingredient in meal.ingredients:
            # Get the item (ingredient or product)
            if meal_ingredient.item_type == "ingredient":
                ingredient = self.ingredient_repository.get_by_id(
                    meal_ingredient.item_id
                )
                if not ingredient:
                    continue  # Skip if item not found
                calories_per_100g = ingredient.calories_per_100g_or_ml
                macros_per_100g = ingredient.macros_per_100g_or_ml
            else:  # product
                product = self.product_repository.get_by_id(meal_ingredient.item_id)
                if not product:
                    continue  # Skip if item not found
                calories_per_100g = product.calories_per_100g_or_ml or 0
                macros_per_100g = product.macros_per_100g_or_ml or Macros(
                    protein=0, carbohydrates=0, sugar=0, fat=0, fiber=0, saturated_fat=0
                )

            # Calculate nutrition for the quantity used
            # Assuming quantity is in grams or ml (per 100g/ml base)
            quantity_factor = meal_ingredient.quantity / 100.0

            total_calories += calories_per_100g * quantity_factor
            total_protein += macros_per_100g.protein_g * quantity_factor
            total_carbs += macros_per_100g.carbohydrates_g * quantity_factor
            total_sugar += macros_per_100g.sugar_g * quantity_factor
            total_fat += macros_per_100g.fat_g * quantity_factor
            total_fiber += macros_per_100g.fiber_g * quantity_factor
            total_saturated_fat += macros_per_100g.saturated_fat_g * quantity_factor

        # Update meal nutrition
        meal.calories_total = round(total_calories, 2)
        meal.macros_total = Macros(
            protein=round(total_protein, 2),
            carbohydrates=round(total_carbs, 2),
            sugar=round(total_sugar, 2),
            fat=round(total_fat, 2),
            fiber=round(total_fiber, 2),
            saturated_fat=round(total_saturated_fat, 2),
        )
