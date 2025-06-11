"""
Data access layer for ingredients and products.
Handles all database operations for the ingredients_and_products module using raw SQL.
"""

import uuid
import logging
import json
from typing import List, Any

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.engine import CursorResult

from app.enums import DietTagEnum, UnitEnum
from app.models import Macros  # Assuming Macros is a Pydantic model
from .models import Ingredient, Product  # Pydantic models
from .exceptions import (
    DatabaseError,
    IngredientNotFoundError,
    ProductNotFoundError,
    DuplicateProductError,  # Assuming this is a custom exception
    # Add DuplicateIngredientError if you have one, or handle appropriately
)

logger = logging.getLogger(__name__)


# Helper to convert RowProxy to dict
def row_to_dict(row) -> None | dict[str, Any]:
    if row is None:
        return None
    return row._asdict() if hasattr(row, "_asdict") else dict(row)


class IngredientRepository:
    """Repository for ingredient data access operations using raw SQL queries."""

    def __init__(self, session: Session) -> None:
        """Initialize the repository with a database session."""
        self.session = session

    def _map_row_to_ingredient(
        self, row_dict: None | dict[str, Any], tags: List[DietTagEnum]
    ) -> None | Ingredient:
        """Converts a database row dictionary to an Ingredient Pydantic model."""
        if not row_dict:
            return None

        # Ensure all fields expected by Pydantic model are present, with defaults if necessary
        shops_data = row_dict.get("shops", [])
        if shops_data is None:
            shops_data = []
        elif isinstance(shops_data, str):
            # Handle legacy single shop data
            shops_data = [shops_data] if shops_data else []

        return Ingredient(
            id=row_dict.get("id"),  # type: ignore
            name=row_dict.get("name"),  # type: ignore
            photo_data=row_dict.get("photo_data"),
            shops=shops_data,
            calories_per_100g_or_ml=row_dict.get("calories_per_100g_or_ml", 0),
            macros_per_100g_or_ml=Macros(
                protein=row_dict.get("macros_protein_g_per_100g_or_ml", 0),
                carbohydrates=row_dict.get("macros_carbohydrates_g_per_100g_or_ml", 0),
                sugar=row_dict.get("macros_sugar_g_per_100g_or_ml", 0),
                fat=row_dict.get("macros_fat_g_per_100g_or_ml", 0),
                fiber=row_dict.get("macros_fiber_g_per_100g_or_ml", 0),
                saturated_fat=row_dict.get("macros_saturated_fat_g_per_100g_or_ml", 0),
            ),
            tags=tags,
        )

    def create(self, ingredient_create: Ingredient) -> Ingredient:
        """
        Creates a new ingredient in the database using raw SQL.
        Assumes ingredient_create.id is pre-generated (e.g., uuid.uuid4()).
        """
        try:
            ingredient_id = ingredient_create.id or uuid.uuid4()

            sql_insert_ingredient = text("""
                INSERT INTO ingredients (
                    id, name, photo_data, shops,
                    calories_per_100g_or_ml,
                    macros_protein_g_per_100g_or_ml,
                    macros_carbohydrates_g_per_100g_or_ml,
                    macros_sugar_g_per_100g_or_ml,
                    macros_fat_g_per_100g_or_ml,
                    macros_fiber_g_per_100g_or_ml,
                    macros_saturated_fat_g_per_100g_or_ml
                ) VALUES (
                    :id, :name, :photo_data, :shops,
                    :calories, :protein, :carbs, :sugar, :fat, :fiber, :saturated_fat
                )
                RETURNING id; 
            """)  # RETURNING id might not be needed if id is pre-generated and passed

            params = {
                "id": ingredient_id,
                "name": ingredient_create.name,
                "photo_data": ingredient_create.photo_data,
                "shops": json.dumps(ingredient_create.shops),
                "calories": ingredient_create.calories_per_100g_or_ml,
                "protein": ingredient_create.macros_per_100g_or_ml.protein_g,
                "carbs": ingredient_create.macros_per_100g_or_ml.carbohydrates_g,
                "sugar": ingredient_create.macros_per_100g_or_ml.sugar_g,
                "fat": ingredient_create.macros_per_100g_or_ml.fat_g,
                "fiber": ingredient_create.macros_per_100g_or_ml.fiber_g,
                "saturated_fat": ingredient_create.macros_per_100g_or_ml.saturated_fat_g,
            }

            # Execute and get the ID (if RETURNING is used and id wasn't pre-set)
            # result = self.session.execute(sql_insert_ingredient, params).fetchone()
            # created_id = result[0] if result else ingredient_id
            self.session.execute(
                sql_insert_ingredient, params
            )  # If ID is pre-generated

            if ingredient_create.tags:
                sql_insert_tag = text(
                    "INSERT INTO ingredient_tags (ingredient_id, tag) VALUES (:ingredient_id, :tag)"
                )
                self.session.execute(
                    sql_insert_tag,
                    [
                        {"ingredient_id": ingredient_id, "tag": tag.value}
                        for tag in ingredient_create.tags
                    ],
                )

            self.session.commit()
            # Fetch the created ingredient to return the full object
            created_ingredient = self.get_by_id(ingredient_id)
            if not created_ingredient:
                # This case should ideally not happen if commit was successful
                raise DatabaseError("Failed to retrieve ingredient after creation.")
            return created_ingredient
        except IntegrityError as e:
            self.session.rollback()
            logger.error(f"Database integrity error creating ingredient: {e}")
            # Consider checking for specific constraint violations if needed
            raise DatabaseError(
                "Ingredient creation failed due to integrity constraint.", str(e)
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error creating ingredient: {e}")
            raise DatabaseError("ingredient creation", str(e))

    def get_by_id(self, ingredient_id: uuid.UUID) -> None | Ingredient:
        """Retrieves an ingredient by its ID using raw SQL."""
        try:
            sql_select_ingredient = text("SELECT * FROM ingredients WHERE id = :id")
            result = self.session.execute(
                sql_select_ingredient, {"id": ingredient_id}
            ).first()
            ingredient_row_dict = row_to_dict(result)

            if not ingredient_row_dict:
                return None

            sql_select_tags = text(
                "SELECT tag FROM ingredient_tags WHERE ingredient_id = :ingredient_id"
            )
            tag_results = self.session.execute(
                sql_select_tags, {"ingredient_id": ingredient_id}
            ).fetchall()
            tags = [DietTagEnum(tag_row[0]) for tag_row in tag_results]

            return self._map_row_to_ingredient(ingredient_row_dict, tags)
        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching ingredient by ID {ingredient_id}: {e}"
            )
            raise DatabaseError("ingredient fetch by ID", str(e))

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        name_filter: None | str = None,
        shop_filter: None | str = None,
        tag_filter: None | List[DietTagEnum] = None,
    ) -> List[Ingredient]:
        """Retrieves ingredients with filtering and pagination using raw SQL."""
        try:
            params: dict[str, Any] = {"limit": limit, "offset": skip}

            # Base query - select specific columns to avoid JSON DISTINCT issues
            base_sql = """SELECT i.id, i.name, i.photo_data, i.shops, i.calories_per_100g_or_ml,
                         i.macros_protein_g_per_100g_or_ml, i.macros_carbohydrates_g_per_100g_or_ml,
                         i.macros_sugar_g_per_100g_or_ml, i.macros_fat_g_per_100g_or_ml,
                         i.macros_fiber_g_per_100g_or_ml, i.macros_saturated_fat_g_per_100g_or_ml FROM ingredients i"""
            conditions: List[str] = []
            joins: List[str] = []

            if name_filter:
                conditions.append("i.name ILIKE :name_filter")
                params["name_filter"] = f"%{name_filter}%"

            if shop_filter:
                # Use simple string contains for partial shop matching
                conditions.append("i.shops::text ILIKE :shop_filter")
                params["shop_filter"] = f"%{shop_filter}%"

            if tag_filter:
                joins.append("JOIN ingredient_tags it ON i.id = it.ingredient_id")
                # Create a list of tag values for the IN clause
                tag_values_params = {}
                tag_placeholders = []
                for i, tag_val in enumerate(tag_filter):
                    param_name = f"tag_val_{i}"
                    tag_placeholders.append(f":{param_name}")
                    tag_values_params[param_name] = tag_val.value

                params.update(tag_values_params)
                conditions.append(f"it.tag IN ({', '.join(tag_placeholders)})")
                # To ensure ALL tags are present, we need a subquery or group by + having count
                # This simplified version checks if ANY of the tags are present.
                # For ALL tags, the query becomes more complex:
                # base_sql = f\"\"\"
                # SELECT i.* FROM ingredients i
                # WHERE (
                #     SELECT COUNT(DISTINCT it.tag)
                #     FROM ingredient_tags it
                #     WHERE it.ingredient_id = i.id AND it.tag IN ({', '.join(tag_placeholders)})
                # ) = {len(tag_filter)}
                # \"\"\"
                # This is an example for "all tags". The current implementation uses a simple JOIN + IN.
                # For "all tags" with the join approach:
                # conditions.append(f"(SELECT COUNT(DISTINCT it_sub.tag) FROM ingredient_tags it_sub WHERE it_sub.ingredient_id = i.id AND it_sub.tag IN ({', '.join(tag_placeholders)})) = :num_tags")
                # params["num_tags"] = len(tag_filter)

            query_str = base_sql
            if joins:
                query_str += " " + " ".join(joins)
            if conditions:
                query_str += " WHERE " + " AND ".join(conditions)

            query_str += " ORDER BY i.name LIMIT :limit OFFSET :offset"

            sql_query = text(query_str)
            results = self.session.execute(sql_query, params).fetchall()

            ingredients_list = []
            for row_tuple in results:
                row = row_to_dict(row_tuple)
                if not row:
                    continue

                # Fetch tags for each ingredient
                sql_select_tags = text(
                    "SELECT tag FROM ingredient_tags WHERE ingredient_id = :ingredient_id"
                )
                tag_results = self.session.execute(
                    sql_select_tags, {"ingredient_id": row["id"]}
                ).fetchall()
                tags = [DietTagEnum(tag_row[0]) for tag_row in tag_results]

                ingredient_model = self._map_row_to_ingredient(row, tags)
                if ingredient_model:
                    ingredients_list.append(ingredient_model)

            return ingredients_list
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching all ingredients: {e}")
            raise DatabaseError("ingredients fetch all", str(e))

    def update(self, ingredient_update: Ingredient) -> None | Ingredient:
        """Updates an ingredient using raw SQL."""
        try:
            # Check if ingredient exists first
            if not self.get_by_id(ingredient_update.id):
                raise IngredientNotFoundError(
                    f"Ingredient with ID {ingredient_update.id} not found for update."
                )

            sql_update_ingredient = text("""
                UPDATE ingredients SET
                    name = :name,
                    photo_data = :photo_data,
                    shops = :shops,
                    calories_per_100g_or_ml = :calories,
                    macros_protein_g_per_100g_or_ml = :protein,
                    macros_carbohydrates_g_per_100g_or_ml = :carbs,
                    macros_sugar_g_per_100g_or_ml = :sugar,
                    macros_fat_g_per_100g_or_ml = :fat,
                    macros_fiber_g_per_100g_or_ml = :fiber,
                    macros_saturated_fat_g_per_100g_or_ml = :saturated_fat
                WHERE id = :id
            """)
            params = {
                "id": ingredient_update.id,
                "name": ingredient_update.name,
                "photo_data": ingredient_update.photo_data,
                "shops": json.dumps(ingredient_update.shops),
                "calories": ingredient_update.calories_per_100g_or_ml,
                "protein": ingredient_update.macros_per_100g_or_ml.protein_g,
                "carbs": ingredient_update.macros_per_100g_or_ml.carbohydrates_g,
                "sugar": ingredient_update.macros_per_100g_or_ml.sugar_g,
                "fat": ingredient_update.macros_per_100g_or_ml.fat_g,
                "fiber": ingredient_update.macros_per_100g_or_ml.fiber_g,
                "saturated_fat": ingredient_update.macros_per_100g_or_ml.saturated_fat_g,
            }
            self.session.execute(sql_update_ingredient, params)

            # Update tags: delete existing and insert new ones
            sql_delete_tags = text(
                "DELETE FROM ingredient_tags WHERE ingredient_id = :ingredient_id"
            )
            self.session.execute(
                sql_delete_tags, {"ingredient_id": ingredient_update.id}
            )

            if ingredient_update.tags:
                sql_insert_tag = text(
                    "INSERT INTO ingredient_tags (ingredient_id, tag) VALUES (:ingredient_id, :tag)"
                )

                self.session.execute(
                    sql_insert_tag,
                    [
                        {"ingredient_id": ingredient_update.id, "tag": tag.value}
                        for tag in ingredient_update.tags
                    ],
                )

            self.session.commit()
            return self.get_by_id(ingredient_update.id)
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(
                f"Database error updating ingredient {ingredient_update.id}: {e}"
            )
            raise DatabaseError("ingredient update", str(e))

    def delete(self, ingredient_id: uuid.UUID) -> bool:
        """Deletes an ingredient using raw SQL. Tags are expected to be handled by CASCADE or manually if needed."""
        try:
            # Check existence
            # Note: CASCADE on DB for ingredient_tags means they will be auto-deleted.
            sql_delete_ingredient = text("DELETE FROM ingredients WHERE id = :id")
            result: CursorResult = self.session.execute(
                sql_delete_ingredient, {"id": ingredient_id}
            )  # type: ignore

            if result.rowcount == 0:
                raise IngredientNotFoundError(
                    f"Ingredient with ID {ingredient_id} not found for deletion, or no rows affected."
                )

            self.session.commit()
            return True
        except IntegrityError as e:
            self.session.rollback()
            logger.error(
                f"Database integrity error deleting ingredient {ingredient_id}: {e}"
            )
            # This typically means a foreign key constraint violation (e.g., ingredient used in product_ingredients with ON DELETE RESTRICT)
            raise DatabaseError(
                f"Cannot delete ingredient {ingredient_id} as it is referenced by other records (e.g., products).",
                str(e),
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error deleting ingredient {ingredient_id}: {e}")
            raise DatabaseError("ingredient deletion", str(e))

    def search_by_name(self, name_pattern: str, limit: int = 10) -> List[Ingredient]:
        """Searches ingredients by name pattern using raw SQL."""
        return self.get_all(limit=limit, name_filter=name_pattern)


class ProductRepository:
    """Repository for product data access operations using raw SQL queries."""

    def __init__(self, session: Session) -> None:
        """Initialize the repository with a database session."""
        self.session = session

    def _map_row_to_product(
        self,
        row_dict: None | dict[str, Any],
        tags: List[DietTagEnum],
        product_ingredients: List[Ingredient],
    ) -> None | Product:
        """Converts a database row dictionary to a Product Pydantic model."""
        if not row_dict:
            return None

        macros = None
        if (
            row_dict.get("macros_protein_g_per_100g_or_ml") is not None
            and row_dict.get("macros_carbohydrates_g_per_100g_or_ml") is not None
            and row_dict.get("macros_fat_g_per_100g_or_ml") is not None
        ):
            macros = Macros(
                protein=row_dict.get("macros_protein_g_per_100g_or_ml"),  # type: ignore
                carbohydrates=row_dict.get("macros_carbohydrates_g_per_100g_or_ml"),  # type: ignore
                sugar=row_dict.get("macros_sugar_g_per_100g_or_ml", 0),
                fat=row_dict.get("macros_fat_g_per_100g_or_ml"),  # type: ignore
                fiber=row_dict.get("macros_fiber_g_per_100g_or_ml", 0),
                saturated_fat=row_dict.get("macros_saturated_fat_g_per_100g_or_ml", 0),
            )

        return Product(
            id=row_dict.get("id"),  # type: ignore
            name=row_dict.get("name"),  # type: ignore
            brand=row_dict.get("brand"),
            photo_data=row_dict.get("photo_data"),
            shop=row_dict.get("shop"),
            barcode=row_dict.get("barcode"),
            calories_per_100g_or_ml=row_dict.get("calories_per_100g_or_ml"),
            macros_per_100g_or_ml=macros,
            package_size_g_or_ml=row_dict.get("package_size_g_or_ml"),
            ingredients=product_ingredients,
            tags=tags,
        )

    def _fetch_ingredient_details_for_product(
        self, ingredient_id: uuid.UUID, quantity: float, unit: UnitEnum
    ) -> None | Ingredient:
        """Fetches a single ingredient's details and wraps it in Ingredient."""
        # This uses the IngredientRepository's get_by_id for simplicity and consistency
        # If IngredientRepository is not available here, you'd replicate its logic
        # For now, let's assume we might need a direct way or pass IngredientRepository instance

        # Simplified direct fetch for this helper:
        try:
            sql_ing = text("SELECT * FROM ingredients WHERE id = :id")
            ing_row_tuple = self.session.execute(sql_ing, {"id": ingredient_id}).first()
            ing_row_dict = row_to_dict(ing_row_tuple)
            if not ing_row_dict:
                return None

            sql_tags = text("SELECT tag FROM ingredient_tags WHERE ingredient_id = :id")
            tag_results = self.session.execute(
                sql_tags, {"id": ingredient_id}
            ).fetchall()
            tags = [DietTagEnum(tag_row[0]) for tag_row in tag_results]

            # Handle shops data for ingredient in Ingredient
            shops_data = ing_row_dict.get("shops", [])
            if shops_data is None:
                shops_data = []
            elif isinstance(shops_data, str):
                # Handle legacy single shop data
                shops_data = [shops_data] if shops_data else []

            return Ingredient(
                id=ing_row_dict.get("id"),  # type: ignore
                name=ing_row_dict.get("name"),  # type: ignore
                photo_data=ing_row_dict.get("photo_data"),
                shops=shops_data,
                calories_per_100g_or_ml=ing_row_dict.get("calories_per_100g_or_ml", 0),
                macros_per_100g_or_ml=Macros(
                    protein=ing_row_dict.get("macros_protein_g_per_100g_or_ml", 0),
                    carbohydrates=ing_row_dict.get(
                        "macros_carbohydrates_g_per_100g_or_ml", 0
                    ),
                    sugar=ing_row_dict.get("macros_sugar_g_per_100g_or_ml", 0),
                    fat=ing_row_dict.get("macros_fat_g_per_100g_or_ml", 0),
                    fiber=ing_row_dict.get("macros_fiber_g_per_100g_or_ml", 0),
                    saturated_fat=ing_row_dict.get(
                        "macros_saturated_fat_g_per_100g_or_ml", 0
                    ),
                ),
                tags=tags,
            )
        except SQLAlchemyError as e:
            logger.error(
                f"DB error in _fetch_ingredient_details_for_product for {ingredient_id}: {e}"
            )
            return None

    def create(self, product_create: Product) -> Product:
        """Creates a new product using raw SQL. Assumes product_create.id is pre-generated."""
        try:
            product_id = product_create.id or uuid.uuid4()

            if product_create.barcode:
                sql_check_barcode = text(
                    "SELECT id FROM products WHERE barcode = :barcode"
                )
                if self.session.execute(
                    sql_check_barcode, {"barcode": product_create.barcode}
                ).first():
                    raise DuplicateProductError(
                        f"Product with barcode '{product_create.barcode}' already exists."
                    )

            sql_insert_product = text("""
                INSERT INTO products (
                    id, name, brand, photo_data, shop, barcode,
                    calories_per_100g_or_ml,
                    macros_protein_g_per_100g_or_ml,
                    macros_carbohydrates_g_per_100g_or_ml,
                    macros_sugar_g_per_100g_or_ml,
                    macros_fat_g_per_100g_or_ml,
                    macros_fiber_g_per_100g_or_ml,
                    macros_saturated_fat_g_per_100g_or_ml,
                    package_size_g_or_ml
                ) VALUES (
                    :id, :name, :brand, :photo_data, :shop, :barcode,
                    :calories, :protein, :carbs, :sugar, :fat, :fiber, :saturated_fat, :package_size
                )
            """)
            params = {
                "id": product_id,
                "name": product_create.name,
                "brand": product_create.brand,
                "photo_data": product_create.photo_data,
                "shop": product_create.shop,
                "barcode": product_create.barcode,
                "calories": product_create.calories_per_100g_or_ml,
                "protein": product_create.macros_per_100g_or_ml.protein_g
                if product_create.macros_per_100g_or_ml
                else None,
                "carbs": product_create.macros_per_100g_or_ml.carbohydrates_g
                if product_create.macros_per_100g_or_ml
                else None,
                "sugar": product_create.macros_per_100g_or_ml.sugar_g
                if product_create.macros_per_100g_or_ml
                else None,
                "fat": product_create.macros_per_100g_or_ml.fat_g
                if product_create.macros_per_100g_or_ml
                else None,
                "fiber": product_create.macros_per_100g_or_ml.fiber_g
                if product_create.macros_per_100g_or_ml
                else None,
                "saturated_fat": product_create.macros_per_100g_or_ml.saturated_fat_g
                if product_create.macros_per_100g_or_ml
                else None,
                "package_size": product_create.package_size_g_or_ml,
            }
            self.session.execute(sql_insert_product, params)

            if product_create.tags:
                sql_insert_tag = text(
                    "INSERT INTO product_tags (product_id, tag) VALUES (:product_id, :tag)"
                )
                for tag in product_create.tags:
                    self.session.execute(
                        sql_insert_tag, {"product_id": product_id, "tag": tag.value}
                    )

            if product_create.ingredients:
                sql_insert_pi = text("""
                    INSERT INTO product_ingredients (product_id, ingredient_id)
                    VALUES (:product_id, :ingredient_id)
                """)
                for iq in product_create.ingredients:
                    self.session.execute(
                        sql_insert_pi,
                        {
                            "product_id": product_id,
                            "ingredient_id": iq.id,
                        },
                    )

            self.session.commit()
            created_product = self.get_by_id(product_id)
            if not created_product:
                raise DatabaseError("Failed to retrieve product after creation.")
            return created_product
        except IntegrityError as e:
            self.session.rollback()
            logger.error(f"Database integrity error creating product: {e}")
            if product_create.barcode and "barcode" in str(e).lower():  # Basic check
                raise DuplicateProductError(
                    f"Product with barcode '{product_create.barcode}' failed (integrity error)."
                )
            raise DatabaseError(
                "Product creation failed due to integrity constraint.", str(e)
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error creating product: {e}")
            raise DatabaseError("product creation", str(e))

    def get_by_id(self, product_id: uuid.UUID) -> None | Product:
        """Retrieves a product by ID, including tags and ingredients, using raw SQL."""
        try:
            sql_select_product = text("SELECT * FROM products WHERE id = :id")
            result = self.session.execute(
                sql_select_product, {"id": product_id}
            ).first()
            product_row_dict = row_to_dict(result)

            if not product_row_dict:
                return None

            # Fetch tags
            sql_select_tags = text(
                "SELECT tag FROM product_tags WHERE product_id = :product_id"
            )
            tag_results = self.session.execute(
                sql_select_tags, {"product_id": product_id}
            ).fetchall()
            tags = [DietTagEnum(tag_row[0]) for tag_row in tag_results]

            # Fetch product ingredients
            product_ingredients_list: List[Ingredient] = []
            sql_pi = text("""
                SELECT ingredient_id, quantity, unit 
                FROM product_ingredients 
                WHERE product_id = :product_id
            """)
            pi_results = self.session.execute(
                sql_pi, {"product_id": product_id}
            ).fetchall()

            for pi_row_tuple in pi_results:
                pi_row = row_to_dict(pi_row_tuple)
                if not pi_row:
                    continue

                ingredient_quantity_obj = self._fetch_ingredient_details_for_product(
                    ingredient_id=pi_row["ingredient_id"],
                    quantity=pi_row["quantity"],
                    unit=UnitEnum(pi_row["unit"]),  # Ensure unit is converted to Enum
                )
                if ingredient_quantity_obj:
                    product_ingredients_list.append(ingredient_quantity_obj)

            return self._map_row_to_product(
                product_row_dict, tags, product_ingredients_list
            )
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching product by ID {product_id}: {e}")
            raise DatabaseError("product fetch by ID", str(e))

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        name_filter: None | str = None,
        brand_filter: None | str = None,
        shop_filter: None | str = None,
        tag_filter: None | List[DietTagEnum] = None,
    ) -> List[Product]:
        """Retrieves products with filtering. Ingredients not fetched for list view performance."""
        try:
            params: dict[str, Any] = {"limit": limit, "offset": skip}
            base_sql = "SELECT DISTINCT p.* FROM products p"
            conditions: List[str] = []
            joins: List[str] = []

            if name_filter:
                conditions.append("p.name ILIKE :name_filter")
                params["name_filter"] = f"%{name_filter}%"
            if brand_filter:
                conditions.append("p.brand ILIKE :brand_filter")
                params["brand_filter"] = f"%{brand_filter}%"
            if shop_filter:
                conditions.append("p.shop ILIKE :shop_filter")
                params["shop_filter"] = f"%{shop_filter}%"

            if tag_filter:
                joins.append("JOIN product_tags pt ON p.id = pt.product_id")
                tag_values_params = {}
                tag_placeholders = []
                for i, tag_val in enumerate(tag_filter):
                    param_name = f"tag_val_{i}"
                    tag_placeholders.append(f":{param_name}")
                    tag_values_params[param_name] = tag_val.value
                params.update(tag_values_params)
                conditions.append(f"pt.tag IN ({', '.join(tag_placeholders)})")
                # Add GROUP BY and HAVING for "all tags" if needed, similar to IngredientRepository.get_all

            query_str = base_sql
            if joins:
                query_str += " " + " ".join(joins)
            if conditions:
                query_str += " WHERE " + " AND ".join(conditions)

            query_str += " ORDER BY p.name LIMIT :limit OFFSET :offset"

            sql_query = text(query_str)
            results = self.session.execute(sql_query, params).fetchall()

            product_list = []
            for row_tuple in results:
                row = row_to_dict(row_tuple)
                if not row:
                    continue

                sql_select_tags = text(
                    "SELECT tag FROM product_tags WHERE product_id = :product_id"
                )
                tag_results = self.session.execute(
                    sql_select_tags, {"product_id": row["id"]}
                ).fetchall()
                tags = [DietTagEnum(tag_row[0]) for tag_row in tag_results]

                # Ingredients are not fetched for get_all to improve performance
                product_model = self._map_row_to_product(row, tags, [])
                if product_model:
                    product_list.append(product_model)

            return product_list
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching all products: {e}")
            raise DatabaseError("products fetch all", str(e))

    def get_by_barcode(self, barcode: str) -> None | Product:
        """Retrieves a product by its barcode using raw SQL."""
        try:
            sql_select_product_id = text(
                "SELECT id FROM products WHERE barcode = :barcode"
            )
            result = self.session.execute(
                sql_select_product_id, {"barcode": barcode}
            ).first()

            if not result:
                return None

            product_id = result[0]
            return self.get_by_id(product_id)  # Reuses get_by_id to load full details
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching product by barcode {barcode}: {e}")
            raise DatabaseError("product fetch by barcode", str(e))

    def update(self, product_update: Product) -> None | Product:
        """Updates a product using raw SQL."""
        try:
            # Check existence
            current_product = self.get_by_id(product_update.id)
            if not current_product:
                raise ProductNotFoundError(
                    f"Product with ID {product_update.id} not found for update."
                )

            # Check for barcode conflict if barcode is being changed
            if (
                product_update.barcode
                and product_update.barcode != current_product.barcode
            ):
                sql_check_barcode = text(
                    "SELECT id FROM products WHERE barcode = :barcode AND id != :current_id"
                )
                if self.session.execute(
                    sql_check_barcode,
                    {
                        "barcode": product_update.barcode,
                        "current_id": product_update.id,
                    },
                ).first():
                    raise DuplicateProductError(
                        f"Another product with barcode '{product_update.barcode}' already exists."
                    )

            sql_update_product = text("""
                UPDATE products SET
                    name = :name, brand = :brand, photo_data = :photo_data, shop = :shop,
                    barcode = :barcode, calories_per_100g_or_ml = :calories,
                    macros_protein_g_per_100g_or_ml = :protein,
                    macros_carbohydrates_g_per_100g_or_ml = :carbs,
                    macros_sugar_g_per_100g_or_ml = :sugar,
                    macros_fat_g_per_100g_or_ml = :fat,
                    macros_fiber_g_per_100g_or_ml = :fiber,
                    macros_saturated_fat_g_per_100g_or_ml = :saturated_fat,
                    package_size_g_or_ml = :package_size
                WHERE id = :id
            """)
            params = {
                "id": product_update.id,
                "name": product_update.name,
                "brand": product_update.brand,
                "photo_data": product_update.photo_data,
                "shop": product_update.shop,
                "barcode": product_update.barcode,
                "calories": product_update.calories_per_100g_or_ml,
                "protein": product_update.macros_per_100g_or_ml.protein_g
                if product_update.macros_per_100g_or_ml
                else None,
                "carbs": product_update.macros_per_100g_or_ml.carbohydrates_g
                if product_update.macros_per_100g_or_ml
                else None,
                "sugar": product_update.macros_per_100g_or_ml.sugar_g
                if product_update.macros_per_100g_or_ml
                else None,
                "fat": product_update.macros_per_100g_or_ml.fat_g
                if product_update.macros_per_100g_or_ml
                else None,
                "fiber": product_update.macros_per_100g_or_ml.fiber_g
                if product_update.macros_per_100g_or_ml
                else None,
                "saturated_fat": product_update.macros_per_100g_or_ml.saturated_fat_g
                if product_update.macros_per_100g_or_ml
                else None,
                "package_size": product_update.package_size_g_or_ml,
            }
            self.session.execute(sql_update_product, params)

            # Update tags
            sql_delete_tags = text(
                "DELETE FROM product_tags WHERE product_id = :product_id"
            )
            self.session.execute(sql_delete_tags, {"product_id": product_update.id})
            if product_update.tags:
                sql_insert_tag = text(
                    "INSERT INTO product_tags (product_id, tag) VALUES (:product_id, :tag)"
                )
                for tag in product_update.tags:
                    self.session.execute(
                        sql_insert_tag,
                        {"product_id": product_update.id, "tag": tag.value},
                    )

            # Update ingredients
            sql_delete_pi = text(
                "DELETE FROM product_ingredients WHERE product_id = :product_id"
            )
            self.session.execute(sql_delete_pi, {"product_id": product_update.id})
            if product_update.ingredients:
                sql_insert_pi = text("""
                    INSERT INTO product_ingredients (product_id, ingredient_id)
                    VALUES (:product_id, :ingredient_id)
                """)
                for iq in product_update.ingredients:
                    self.session.execute(
                        sql_insert_pi,
                        {
                            "product_id": product_update.id,
                            "ingredient_id": iq.id,
                        },
                    )

            self.session.commit()
            return self.get_by_id(product_update.id)
        except IntegrityError as e:
            self.session.rollback()
            logger.error(
                f"DB integrity error updating product {product_update.id}: {e}"
            )
            if product_update.barcode and "barcode" in str(e).lower():
                raise DuplicateProductError(
                    f"Product barcode '{product_update.barcode}' conflict (integrity error)."
                )
            raise DatabaseError(
                "Product update failed due to integrity constraint.", str(e)
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error updating product {product_update.id}: {e}")
            raise DatabaseError("product update", str(e))

    def delete(self, product_id: uuid.UUID) -> bool:
        """Deletes a product using raw SQL. Associated tags/ingredients expected to CASCADE."""
        try:
            sql_delete_product = text("DELETE FROM products WHERE id = :id")
            result: CursorResult = self.session.execute(
                sql_delete_product, {"id": product_id}
            )  # type: ignore

            if result.rowcount == 0:
                raise ProductNotFoundError(
                    f"Product with ID {product_id} not found for deletion, or no rows affected."
                )

            self.session.commit()
            return True
        except (
            SQLAlchemyError
        ) as e:  # Catches IntegrityError too if not handled by DB CASCADE
            self.session.rollback()
            logger.error(f"Database error deleting product {product_id}: {e}")
            # If IntegrityError due to FK constraints (if CASCADE isn't set up for all related tables)
            if isinstance(e, IntegrityError):
                raise DatabaseError(
                    f"Cannot delete product {product_id} as it might be referenced by other records.",
                    str(e),
                )
            raise DatabaseError("product deletion", str(e))

    def search_by_name(self, name_pattern: str, limit: int = 10) -> List[Product]:
        """Searches products by name pattern using raw SQL. Ingredients not loaded."""
        return self.get_all(limit=limit, name_filter=name_pattern)
