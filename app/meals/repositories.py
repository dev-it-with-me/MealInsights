"""
Repository layer for meals data access.
Handles all database operations for the meals module using raw SQL.
"""

from typing import List, Any
import uuid
import logging
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import Session

from app.enums import DietTagEnum, UnitEnum
from app.models import Macros
from .models import Meal, MealIngredient, IngredientEquivalent
from .exceptions import MealNotFoundError

logger = logging.getLogger(__name__)


# Helper to convert RowProxy to dict
def row_to_dict(row) -> None | dict[str, Any]:
    """Convert database row to dictionary."""
    if row is None:
        return None
    return row._asdict() if hasattr(row, "_asdict") else dict(row)


class MealRepository:
    """Repository for meal data access operations using raw SQL queries."""

    def __init__(self, session: Session) -> None:
        """Initialize the repository with a database session."""
        self.session = session

    def _map_row_to_meal(
        self,
        row_dict: None | dict[str, Any],
        ingredients: list[MealIngredient],
        equivalents: list[IngredientEquivalent],
        tags: list[DietTagEnum],
    ) -> None | Meal:
        """Converts a database row dictionary to a Meal Pydantic model."""
        if not row_dict:
            return None

        # Build macros if data exists
        macros = None
        if any(
            [
                row_dict.get("macros_protein_g") is not None,
                row_dict.get("macros_carbohydrates_g") is not None,
                row_dict.get("macros_fat_g") is not None,
            ]
        ):
            macros = Macros(
                protein=row_dict.get("macros_protein_g", 0),
                carbohydrates=row_dict.get("macros_carbohydrates_g", 0),
                sugar=row_dict.get("macros_sugar_g", 0),
                fat=row_dict.get("macros_fat_g", 0),
                fiber=row_dict.get("macros_fiber_g", 0),
                saturated_fat=row_dict.get("macros_saturated_fat_g", 0),
            )

        # Convert photo_data from memoryview to bytes if needed
        photo_data = row_dict.get("photo_data")
        if isinstance(photo_data, memoryview):
            photo_data = bytes(photo_data)

        return Meal(
            id=row_dict["id"],  # Required field, should not be None
            name=row_dict["name"],  # Required field, should not be None
            photo_data=photo_data,
            recipe=row_dict.get("recipe"),
            ingredients=ingredients,
            equivalents=equivalents,
            calories_total=row_dict.get("calories_total"),
            macros_total=macros,
            is_nutrition_calculated=row_dict.get("is_nutrition_calculated", False),
            tags=tags,
        )

    def _fetch_meal_ingredients(self, meal_id: uuid.UUID) -> list[MealIngredient]:
        """Fetch ingredients for a meal."""
        try:
            sql_select_ingredients = text("""
                SELECT item_id, item_type, item_name, quantity, unit
                FROM meal_ingredients
                WHERE meal_id = :meal_id
                ORDER BY item_name
            """)
            results = self.session.execute(
                sql_select_ingredients, {"meal_id": meal_id}
            ).fetchall()

            ingredients = []
            for row in results:
                ingredients.append(
                    MealIngredient(
                        item_id=row.item_id,
                        item_type=row.item_type,
                        item_name=row.item_name,
                        quantity=row.quantity,
                        unit=UnitEnum(row.unit),
                    )
                )
            return ingredients
        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching meal ingredients for meal {meal_id}: {e}"
            )
            return []

    def _fetch_meal_equivalents(self, meal_id: uuid.UUID) -> list[IngredientEquivalent]:
        """Fetch ingredient equivalents for a meal."""
        try:
            sql_select_equivalents = text("""
                SELECT original_item_id, equivalent_item_id, equivalent_item_type, 
                       equivalent_item_name, conversion_ratio
                FROM meal_ingredient_equivalents
                WHERE meal_id = :meal_id
                ORDER BY equivalent_item_name
            """)
            results = self.session.execute(
                sql_select_equivalents, {"meal_id": meal_id}
            ).fetchall()

            equivalents = []
            for row in results:
                equivalents.append(
                    IngredientEquivalent(
                        original_item_id=row.original_item_id,
                        equivalent_item_id=row.equivalent_item_id,
                        equivalent_item_type=row.equivalent_item_type,
                        equivalent_item_name=row.equivalent_item_name,
                        conversion_ratio=row.conversion_ratio,
                    )
                )
            return equivalents
        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching meal equivalents for meal {meal_id}: {e}"
            )
            return []

    def _fetch_meal_tags(self, meal_id: uuid.UUID) -> list[DietTagEnum]:
        """Fetch tags for a meal."""
        try:
            sql_select_tags = text("""
                SELECT tag FROM meal_tags WHERE meal_id = :meal_id
            """)
            results = self.session.execute(
                sql_select_tags, {"meal_id": meal_id}
            ).fetchall()
            return [DietTagEnum(row.tag) for row in results]
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching meal tags for meal {meal_id}: {e}")
            return []

    async def create_meal(self, meal: Meal) -> Meal:
        """Create a new meal."""
        try:
            meal_id = meal.id or uuid.uuid4()

            # Insert meal record
            sql_insert_meal = text("""
                INSERT INTO meals (
                    id, name, photo_data, recipe, calories_total,
                    macros_protein_g, macros_carbohydrates_g, macros_sugar_g,
                    macros_fat_g, macros_fiber_g, macros_saturated_fat_g,
                    is_nutrition_calculated
                ) VALUES (
                    :id, :name, :photo_data, :recipe, :calories_total,
                    :protein, :carbs, :sugar, :fat, :fiber, :saturated_fat,
                    :is_nutrition_calculated
                )
            """)

            params = {
                "id": meal_id,
                "name": meal.name,
                "photo_data": meal.photo_data,
                "recipe": meal.recipe,
                "calories_total": meal.calories_total,
                "protein": meal.macros_total.protein_g if meal.macros_total else None,
                "carbs": meal.macros_total.carbohydrates_g
                if meal.macros_total
                else None,
                "sugar": meal.macros_total.sugar_g if meal.macros_total else None,
                "fat": meal.macros_total.fat_g if meal.macros_total else None,
                "fiber": meal.macros_total.fiber_g if meal.macros_total else None,
                "saturated_fat": meal.macros_total.saturated_fat_g
                if meal.macros_total
                else None,
                "is_nutrition_calculated": meal.is_nutrition_calculated,
            }

            self.session.execute(sql_insert_meal, params)

            # Insert meal ingredients
            if meal.ingredients:
                sql_insert_ingredient = text("""
                    INSERT INTO meal_ingredients (
                        meal_id, item_id, item_type, item_name, quantity, unit
                    ) VALUES (
                        :meal_id, :item_id, :item_type, :item_name, :quantity, :unit
                    )
                """)
                for ingredient in meal.ingredients:
                    self.session.execute(
                        sql_insert_ingredient,
                        {
                            "meal_id": meal_id,
                            "item_id": ingredient.item_id,
                            "item_type": ingredient.item_type,
                            "item_name": ingredient.item_name,
                            "quantity": ingredient.quantity,
                            "unit": ingredient.unit.value,
                        },
                    )

            # Insert meal equivalents
            if meal.equivalents:
                sql_insert_equivalent = text("""
                    INSERT INTO meal_ingredient_equivalents (
                        meal_id, original_item_id, equivalent_item_id, 
                        equivalent_item_type, equivalent_item_name, conversion_ratio
                    ) VALUES (
                        :meal_id, :original_item_id, :equivalent_item_id,
                        :equivalent_item_type, :equivalent_item_name, :conversion_ratio
                    )
                """)
                for equivalent in meal.equivalents:
                    self.session.execute(
                        sql_insert_equivalent,
                        {
                            "meal_id": meal_id,
                            "original_item_id": equivalent.original_item_id,
                            "equivalent_item_id": equivalent.equivalent_item_id,
                            "equivalent_item_type": equivalent.equivalent_item_type,
                            "equivalent_item_name": equivalent.equivalent_item_name,
                            "conversion_ratio": equivalent.conversion_ratio,
                        },
                    )

            # Insert meal tags
            if meal.tags:
                sql_insert_tag = text("""
                    INSERT INTO meal_tags (meal_id, tag)
                    VALUES (:meal_id, :tag)
                """)
                for tag in meal.tags:
                    self.session.execute(
                        sql_insert_tag,
                        {
                            "meal_id": meal_id,
                            "tag": tag.value,
                        },
                    )

            self.session.commit()

            # Fetch and return the created meal
            created_meal = await self.get_meal_by_id(meal_id)
            if not created_meal:
                raise MealNotFoundError(
                    f"Failed to retrieve created meal with id {meal_id}"
                )
            return created_meal

        except IntegrityError as e:
            self.session.rollback()
            logger.error(f"Database integrity error creating meal: {e}")
            raise MealNotFoundError("Meal creation failed due to integrity constraint")
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error creating meal: {e}")
            raise MealNotFoundError(f"Failed to create meal: {str(e)}")

    async def get_meal_by_id(self, meal_id: uuid.UUID) -> Meal:
        """Get a meal by its ID."""
        try:
            sql_select_meal = text("SELECT * FROM meals WHERE id = :id")
            result = self.session.execute(sql_select_meal, {"id": meal_id}).first()
            meal_row_dict = row_to_dict(result)

            if not meal_row_dict:
                raise MealNotFoundError(f"Meal with id {meal_id} not found")

            # Fetch related data
            ingredients = self._fetch_meal_ingredients(meal_id)
            equivalents = self._fetch_meal_equivalents(meal_id)
            tags = self._fetch_meal_tags(meal_id)

            meal = self._map_row_to_meal(meal_row_dict, ingredients, equivalents, tags)
            if not meal:
                raise MealNotFoundError(f"Failed to map meal with id {meal_id}")
            return meal

        except SQLAlchemyError as e:
            logger.error(f"Database error fetching meal by ID {meal_id}: {e}")
            raise MealNotFoundError(f"Failed to fetch meal: {str(e)}")

    async def get_all_meals(self, skip: int = 0, limit: int = 100) -> List[Meal]:
        """Get all meals with pagination."""
        try:
            sql_select_meals = text("""
                SELECT * FROM meals 
                ORDER BY name 
                LIMIT :limit OFFSET :offset
            """)
            results = self.session.execute(
                sql_select_meals, {"limit": limit, "offset": skip}
            ).fetchall()

            meals = []
            for row in results:
                meal_row_dict = row_to_dict(row)
                if meal_row_dict:
                    meal_id = meal_row_dict["id"]
                    ingredients = self._fetch_meal_ingredients(meal_id)
                    equivalents = self._fetch_meal_equivalents(meal_id)
                    tags = self._fetch_meal_tags(meal_id)

                    meal = self._map_row_to_meal(
                        meal_row_dict, ingredients, equivalents, tags
                    )
                    if meal:
                        meals.append(meal)

            return meals

        except SQLAlchemyError as e:
            logger.error(f"Database error fetching all meals: {e}")
            raise MealNotFoundError(f"Failed to fetch meals: {str(e)}")

    async def update_meal(self, meal_id: uuid.UUID, meal: Meal) -> Meal:
        """Update an existing meal."""
        try:
            # Check if meal exists first
            existing_meal = await self.get_meal_by_id(meal_id)
            if not existing_meal:
                raise MealNotFoundError(f"Meal with id {meal_id} not found")

            # Update meal record
            sql_update_meal = text("""
                UPDATE meals SET
                    name = :name,
                    photo_data = :photo_data,
                    recipe = :recipe,
                    calories_total = :calories_total,
                    macros_protein_g = :protein,
                    macros_carbohydrates_g = :carbs,
                    macros_sugar_g = :sugar,
                    macros_fat_g = :fat,
                    macros_fiber_g = :fiber,
                    macros_saturated_fat_g = :saturated_fat,
                    is_nutrition_calculated = :is_nutrition_calculated
                WHERE id = :id
            """)

            params = {
                "id": meal_id,
                "name": meal.name,
                "photo_data": meal.photo_data,
                "recipe": meal.recipe,
                "calories_total": meal.calories_total,
                "protein": meal.macros_total.protein_g if meal.macros_total else None,
                "carbs": meal.macros_total.carbohydrates_g
                if meal.macros_total
                else None,
                "sugar": meal.macros_total.sugar_g if meal.macros_total else None,
                "fat": meal.macros_total.fat_g if meal.macros_total else None,
                "fiber": meal.macros_total.fiber_g if meal.macros_total else None,
                "saturated_fat": meal.macros_total.saturated_fat_g
                if meal.macros_total
                else None,
                "is_nutrition_calculated": meal.is_nutrition_calculated,
            }

            self.session.execute(sql_update_meal, params)

            # Delete existing related records
            self.session.execute(
                text("DELETE FROM meal_ingredients WHERE meal_id = :meal_id"),
                {"meal_id": meal_id},
            )
            self.session.execute(
                text(
                    "DELETE FROM meal_ingredient_equivalents WHERE meal_id = :meal_id"
                ),
                {"meal_id": meal_id},
            )
            self.session.execute(
                text("DELETE FROM meal_tags WHERE meal_id = :meal_id"),
                {"meal_id": meal_id},
            )

            # Insert updated ingredients
            if meal.ingredients:
                sql_insert_ingredient = text("""
                    INSERT INTO meal_ingredients (
                        meal_id, item_id, item_type, item_name, quantity, unit
                    ) VALUES (
                        :meal_id, :item_id, :item_type, :item_name, :quantity, :unit
                    )
                """)
                for ingredient in meal.ingredients:
                    self.session.execute(
                        sql_insert_ingredient,
                        {
                            "meal_id": meal_id,
                            "item_id": ingredient.item_id,
                            "item_type": ingredient.item_type,
                            "item_name": ingredient.item_name,
                            "quantity": ingredient.quantity,
                            "unit": ingredient.unit.value,
                        },
                    )

            # Insert updated equivalents
            if meal.equivalents:
                sql_insert_equivalent = text("""
                    INSERT INTO meal_ingredient_equivalents (
                        meal_id, original_item_id, equivalent_item_id, 
                        equivalent_item_type, equivalent_item_name, conversion_ratio
                    ) VALUES (
                        :meal_id, :original_item_id, :equivalent_item_id,
                        :equivalent_item_type, :equivalent_item_name, :conversion_ratio
                    )
                """)
                for equivalent in meal.equivalents:
                    self.session.execute(
                        sql_insert_equivalent,
                        {
                            "meal_id": meal_id,
                            "original_item_id": equivalent.original_item_id,
                            "equivalent_item_id": equivalent.equivalent_item_id,
                            "equivalent_item_type": equivalent.equivalent_item_type,
                            "equivalent_item_name": equivalent.equivalent_item_name,
                            "conversion_ratio": equivalent.conversion_ratio,
                        },
                    )

            # Insert updated tags
            print(meal.tags)
            if meal.tags:
                sql_insert_tag = text("""
                    INSERT INTO meal_tags (meal_id, tag)
                    VALUES (:meal_id, :tag)
                """)
                for tag in meal.tags:
                    self.session.execute(
                        sql_insert_tag,
                        {
                            "meal_id": meal_id,
                            "tag": tag.value,
                        },
                    )

            self.session.commit()

            # Fetch and return the updated meal
            return await self.get_meal_by_id(meal_id)

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error updating meal {meal_id}: {e}")
            raise MealNotFoundError(f"Failed to update meal: {str(e)}")

    async def delete_meal(self, meal_id: uuid.UUID) -> None:
        """Delete a meal."""
        try:
            # Check if meal exists first
            existing_meal = await self.get_meal_by_id(meal_id)
            if not existing_meal:
                raise MealNotFoundError(f"Meal with id {meal_id} not found")

            # Delete meal (related records will be deleted by CASCADE)
            sql_delete_meal = text("DELETE FROM meals WHERE id = :meal_id")
            self.session.execute(sql_delete_meal, {"meal_id": meal_id})
            self.session.commit()

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error deleting meal {meal_id}: {e}")
            raise MealNotFoundError(f"Failed to delete meal: {str(e)}")

    async def search_meals_by_name(
        self, name_query: str, skip: int = 0, limit: int = 100
    ) -> List[Meal]:
        """Search meals by name."""
        try:
            sql_search_meals = text("""
                SELECT * FROM meals 
                WHERE LOWER(name) LIKE LOWER(:name_pattern)
                ORDER BY name 
                LIMIT :limit OFFSET :offset
            """)

            results = self.session.execute(
                sql_search_meals,
                {"name_pattern": f"%{name_query}%", "limit": limit, "offset": skip},
            ).fetchall()

            meals = []
            for row in results:
                meal_row_dict = row_to_dict(row)
                if meal_row_dict:
                    meal_id = meal_row_dict["id"]
                    ingredients = self._fetch_meal_ingredients(meal_id)
                    equivalents = self._fetch_meal_equivalents(meal_id)
                    tags = self._fetch_meal_tags(meal_id)

                    meal = self._map_row_to_meal(
                        meal_row_dict, ingredients, equivalents, tags
                    )
                    if meal:
                        meals.append(meal)

            return meals

        except SQLAlchemyError as e:
            logger.error(f"Database error searching meals by name '{name_query}': {e}")
            raise MealNotFoundError(f"Failed to search meals: {str(e)}")
