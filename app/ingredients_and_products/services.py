"""
Business logic layer for ingredients and products.
Orchestrates operations and handles business rules.
"""

import logging
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Macros
from app.enums import DietTagEnum, UnitEnum
from .models import Ingredient, Product, IngredientQuantity
from .repositories import IngredientRepository, ProductRepository
from .exceptions import (
    IngredientNotFoundError,
    ProductNotFoundError,
    DuplicateIngredientError,
    DuplicateProductError,
    InvalidQuantityError,
    DatabaseError,
)

logger = logging.getLogger(__name__)


class IngredientService:
    """Service for ingredient business logic."""

    def __init__(self, session: Session) -> None:
        """Initialize the service with a database session."""
        self.session = session
        self.repository = IngredientRepository(session)

    def create_ingredient(
        self,
        name: str,
        calories_per_100g_or_ml: float,
        macros_per_100g_or_ml: Macros,
        photo_data: Optional[bytes] = None,
        shop: Optional[str] = None,
        tags: Optional[List[DietTagEnum]] = None,
    ) -> Ingredient:
        """
        Create a new ingredient with validation.

        Args:
            name: Ingredient name
            calories_per_100g_or_ml: Calories per 100g or 100ml
            macros_per_100g_or_ml: Macronutrients per 100g or 100ml
            photo_data: Optional photo data
            shop: Optional shop where ingredient can be bought
            tags: Optional list of diet tags

        Returns:
            Ingredient: The created ingredient

        Raises:
            ValueError: If validation fails
            DuplicateIngredientError: If ingredient already exists
            DatabaseError: If database operation fails
        """
        # Validate input
        self._validate_ingredient_data(
            name, calories_per_100g_or_ml, macros_per_100g_or_ml
        )

        # Prepare data
        ingredient_data = {
            "name": name.strip(),
            "calories_per_100g_or_ml": calories_per_100g_or_ml,
            "macros_per_100g_or_ml": macros_per_100g_or_ml,
            "photo_data": photo_data,
            "shop": shop.strip() if shop else None,
            "tags": tags or [],
        }

        logger.info(f"Creating ingredient: {name}")
        return self.repository.create(ingredient_data)

    def get_ingredient_by_id(self, ingredient_id: uuid.UUID) -> Ingredient:
        """
        Get an ingredient by its ID.

        Args:
            ingredient_id: The ingredient ID

        Returns:
            Ingredient: The found ingredient

        Raises:
            IngredientNotFoundError: If ingredient not found
        """
        return self.repository.get_by_id(ingredient_id)

    def get_all_ingredients(
        self,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        shop_filter: Optional[str] = None,
        tag_filter: Optional[List[DietTagEnum]] = None,
    ) -> List[Ingredient]:
        """
        Get all ingredients with optional filtering.

        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            name_filter: Filter by ingredient name (partial match)
            shop_filter: Filter by shop name (partial match)
            tag_filter: Filter by tags (ingredient must have all specified tags)

        Returns:
            List[Ingredient]: List of ingredients
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError("Skip parameter must be non-negative")
        if limit <= 0 or limit > 1000:
            raise ValueError("Limit must be between 1 and 1000")

        return self.repository.get_all(
            skip=skip,
            limit=limit,
            name_filter=name_filter,
            shop_filter=shop_filter,
            tag_filter=tag_filter,
        )

    def update_ingredient(
        self,
        ingredient_id: uuid.UUID,
        name: Optional[str] = None,
        calories_per_100g_or_ml: Optional[float] = None,
        macros_per_100g_or_ml: Optional[Macros] = None,
        photo_data: Optional[bytes] = None,
        shop: Optional[str] = None,
        tags: Optional[List[DietTagEnum]] = None,
    ) -> Ingredient:
        """
        Update an existing ingredient.

        Args:
            ingredient_id: The ingredient ID
            name: Optional new name
            calories_per_100g_or_ml: Optional new calories
            macros_per_100g_or_ml: Optional new macros
            photo_data: Optional new photo data
            shop: Optional new shop
            tags: Optional new tags list

        Returns:
            Ingredient: The updated ingredient

        Raises:
            IngredientNotFoundError: If ingredient not found
            ValueError: If validation fails
            DatabaseError: If database operation fails
        """
        # Validate provided data
        if name is not None:
            if not name.strip():
                raise ValueError("Ingredient name cannot be empty")

        if calories_per_100g_or_ml is not None:
            if calories_per_100g_or_ml < 0:
                raise ValueError("Calories must be non-negative")

        if macros_per_100g_or_ml is not None:
            if (
                macros_per_100g_or_ml.protein_g < 0
                or macros_per_100g_or_ml.carbohydrates_g < 0
                or macros_per_100g_or_ml.fat_g < 0
            ):
                raise ValueError("Macronutrient values must be non-negative")

        # Prepare update data
        update_data = {}
        if name is not None:
            update_data["name"] = name.strip()
        if calories_per_100g_or_ml is not None:
            update_data["calories_per_100g_or_ml"] = calories_per_100g_or_ml
        if macros_per_100g_or_ml is not None:
            update_data["macros_per_100g_or_ml"] = macros_per_100g_or_ml
        if photo_data is not None:
            update_data["photo_data"] = photo_data
        if shop is not None:
            update_data["shop"] = shop.strip() if shop else None
        if tags is not None:
            update_data["tags"] = tags

        if not update_data:
            # No changes to make, return current ingredient
            return self.repository.get_by_id(ingredient_id)

        logger.info(f"Updating ingredient: {ingredient_id}")
        return self.repository.update(ingredient_id, update_data)

    def delete_ingredient(self, ingredient_id: uuid.UUID) -> bool:
        """
        Delete an ingredient.

        Args:
            ingredient_id: The ingredient ID

        Returns:
            bool: True if deleted successfully

        Raises:
            IngredientNotFoundError: If ingredient not found
            DatabaseError: If database operation fails
        """
        logger.info(f"Deleting ingredient: {ingredient_id}")
        return self.repository.delete(ingredient_id)

    def search_ingredients(
        self, name_pattern: str, limit: int = 10
    ) -> List[Ingredient]:
        """
        Search ingredients by name pattern.

        Args:
            name_pattern: Pattern to search for
            limit: Maximum number of results

        Returns:
            List[Ingredient]: List of matching ingredients
        """
        if not name_pattern.strip():
            raise ValueError("Search pattern cannot be empty")

        if limit <= 0 or limit > 100:
            raise ValueError("Limit must be between 1 and 100")

        return self.repository.search_by_name(name_pattern.strip(), limit)

    def get_ingredients_by_tags(self, tags: List[DietTagEnum]) -> List[Ingredient]:
        """
        Get ingredients that have all specified tags.

        Args:
            tags: List of required tags

        Returns:
            List[Ingredient]: List of ingredients with all specified tags
        """
        if not tags:
            raise ValueError("At least one tag must be specified")

        return self.repository.get_all(tag_filter=tags)

    def calculate_ingredient_nutrition_for_quantity(
        self, ingredient: Ingredient, quantity: float, unit: UnitEnum
    ) -> dict:
        """
        Calculate nutrition values for a specific quantity of an ingredient.

        Args:
            ingredient: The ingredient
            quantity: The quantity
            unit: The unit of measurement

        Returns:
            dict: Calculated nutrition values

        Raises:
            InvalidQuantityError: If quantity is invalid
            ValueError: If unit conversion is not supported
        """
        if quantity <= 0:
            raise InvalidQuantityError(quantity)

        # Convert quantity to grams/ml for calculation
        # For simplicity, assuming g and ml are equivalent for calculation
        # In a real application, you might need more sophisticated unit conversion
        conversion_factor = self._get_unit_conversion_factor(unit)
        quantity_in_g_or_ml = quantity * conversion_factor

        # Calculate based on per 100g/ml values
        ratio = quantity_in_g_or_ml / 100.0

        return {
            "calories": ingredient.calories_per_100g_or_ml * ratio,
            "protein_g": ingredient.macros_per_100g_or_ml.protein_g * ratio,
            "carbohydrates_g": ingredient.macros_per_100g_or_ml.carbohydrates_g * ratio,
            "fat_g": ingredient.macros_per_100g_or_ml.fat_g * ratio,
            "quantity": quantity,
            "unit": unit.value,
        }

    def _validate_ingredient_data(
        self, name: str, calories: float, macros: Macros
    ) -> None:
        """Validate ingredient data."""
        if not name or not name.strip():
            raise ValueError("Ingredient name is required and cannot be empty")

        if calories < 0:
            raise ValueError("Calories must be non-negative")

        if macros.protein_g < 0 or macros.carbohydrates_g < 0 or macros.fat_g < 0:
            raise ValueError("Macronutrient values must be non-negative")

        # Basic sanity check: very high calorie values might indicate an error
        if calories > 10000:
            logger.warning(
                f"Very high calorie value: {calories} for ingredient: {name}"
            )

    def _get_unit_conversion_factor(self, unit: UnitEnum) -> float:
        """Get conversion factor to grams/ml."""
        conversion_factors = {
            UnitEnum.GRAM: 1.0,
            UnitEnum.MILLILITER: 1.0,
            UnitEnum.KILOGRAM: 1000.0,
            UnitEnum.LITER: 1000.0,
            UnitEnum.PIECE: 100.0,  # Assume 100g per piece
            UnitEnum.TABLESPOON: 15.0,  # Assume 15ml per tablespoon
            UnitEnum.TEASPOON: 5.0,  # Assume 5ml per teaspoon
            UnitEnum.CUP: 240.0,  # Assume 240ml per cup
            UnitEnum.OUNCE: 28.35,  # 1 oz ≈ 28.35g
            UnitEnum.POUND: 453.6,  # 1 lb ≈ 453.6g
        }

        factor = conversion_factors.get(unit)
        if factor is None:
            raise ValueError(f"Unit conversion not supported for: {unit}")

        return factor


class ProductService:
    """Service for product business logic."""

    def __init__(self, session: Session) -> None:
        """Initialize the service with a database session."""
        self.session = session
        self.repository = ProductRepository(session)
        self.ingredient_repository = IngredientRepository(session)

    def create_product(
        self,
        name: str,
        brand: Optional[str] = None,
        photo_data: Optional[bytes] = None,
        shop: Optional[str] = None,
        barcode: Optional[str] = None,
        calories_per_100g_or_ml: Optional[float] = None,
        macros_per_100g_or_ml: Optional[Macros] = None,
        package_size_g_or_ml: Optional[float] = None,
        ingredients: Optional[List[IngredientQuantity]] = None,
        tags: Optional[List[DietTagEnum]] = None,
    ) -> Product:
        """
        Create a new product with validation.

        Args:
            name: Product name
            brand: Optional brand name
            photo_data: Optional photo data
            shop: Optional shop where product was bought
            barcode: Optional product barcode
            calories_per_100g_or_ml: Optional calories per 100g or 100ml
            macros_per_100g_or_ml: Optional macronutrients per 100g or 100ml
            package_size_g_or_ml: Optional total package size
            ingredients: Optional list of ingredients with quantities
            tags: Optional list of diet tags

        Returns:
            Product: The created product

        Raises:
            ValueError: If validation fails
            DuplicateProductError: If product already exists
            DatabaseError: If database operation fails
        """
        # Validate input
        self._validate_product_data(
            name,
            calories_per_100g_or_ml,
            macros_per_100g_or_ml,
            package_size_g_or_ml,
            ingredients,
        )

        # Validate ingredients exist if provided
        if ingredients:
            for ingredient_quantity in ingredients:
                try:
                    self.ingredient_repository.get_by_id(
                        ingredient_quantity.ingredient.id
                    )
                except IngredientNotFoundError:
                    raise ValueError(
                        f"Ingredient with ID {ingredient_quantity.ingredient.id} not found"
                    )

        # Prepare data
        product_data = {
            "name": name.strip(),
            "brand": brand.strip() if brand else None,
            "photo_data": photo_data,
            "shop": shop.strip() if shop else None,
            "barcode": barcode.strip() if barcode else None,
            "calories_per_100g_or_ml": calories_per_100g_or_ml,
            "macros_per_100g_or_ml": macros_per_100g_or_ml,
            "package_size_g_or_ml": package_size_g_or_ml,
            "ingredients": ingredients or [],
            "tags": tags or [],
        }

        logger.info(f"Creating product: {name}")
        return self.repository.create(product_data)

    def get_product_by_id(self, product_id: uuid.UUID) -> Product:
        """
        Get a product by its ID.

        Args:
            product_id: The product ID

        Returns:
            Product: The found product

        Raises:
            ProductNotFoundError: If product not found
        """
        return self.repository.get_by_id(product_id)

    def get_product_by_barcode(self, barcode: str) -> Optional[Product]:
        """
        Get a product by its barcode.

        Args:
            barcode: The product barcode

        Returns:
            Product | None: The found product or None
        """
        if not barcode.strip():
            raise ValueError("Barcode cannot be empty")

        return self.repository.get_by_barcode(barcode.strip())

    def get_all_products(
        self,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        brand_filter: Optional[str] = None,
        shop_filter: Optional[str] = None,
        tag_filter: Optional[List[DietTagEnum]] = None,
    ) -> List[Product]:
        """
        Get all products with optional filtering.

        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            name_filter: Filter by product name (partial match)
            brand_filter: Filter by brand name (partial match)
            shop_filter: Filter by shop name (partial match)
            tag_filter: Filter by tags (product must have all specified tags)

        Returns:
            List[Product]: List of products
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError("Skip parameter must be non-negative")
        if limit <= 0 or limit > 1000:
            raise ValueError("Limit must be between 1 and 1000")

        return self.repository.get_all(
            skip=skip,
            limit=limit,
            name_filter=name_filter,
            brand_filter=brand_filter,
            shop_filter=shop_filter,
            tag_filter=tag_filter,
        )

    def update_product(
        self,
        product_id: uuid.UUID,
        name: Optional[str] = None,
        brand: Optional[str] = None,
        photo_data: Optional[bytes] = None,
        shop: Optional[str] = None,
        barcode: Optional[str] = None,
        calories_per_100g_or_ml: Optional[float] = None,
        macros_per_100g_or_ml: Optional[Macros] = None,
        package_size_g_or_ml: Optional[float] = None,
        ingredients: Optional[List[IngredientQuantity]] = None,
        tags: Optional[List[DietTagEnum]] = None,
    ) -> Product:
        """
        Update an existing product.

        Args:
            product_id: The product ID
            name: Optional new name
            brand: Optional new brand
            photo_data: Optional new photo data
            shop: Optional new shop
            barcode: Optional new barcode
            calories_per_100g_or_ml: Optional new calories
            macros_per_100g_or_ml: Optional new macros
            package_size_g_or_ml: Optional new package size
            ingredients: Optional new ingredients list
            tags: Optional new tags list

        Returns:
            Product: The updated product

        Raises:
            ProductNotFoundError: If product not found
            ValueError: If validation fails
            DatabaseError: If database operation fails
        """
        # Validate provided data
        if name is not None and not name.strip():
            raise ValueError("Product name cannot be empty")

        if calories_per_100g_or_ml is not None and calories_per_100g_or_ml < 0:
            raise ValueError("Calories must be non-negative")

        if macros_per_100g_or_ml is not None:
            if (
                macros_per_100g_or_ml.protein_g < 0
                or macros_per_100g_or_ml.carbohydrates_g < 0
                or macros_per_100g_or_ml.fat_g < 0
            ):
                raise ValueError("Macronutrient values must be non-negative")

        if package_size_g_or_ml is not None and package_size_g_or_ml <= 0:
            raise ValueError("Package size must be positive")

        # Validate ingredients exist if provided
        if ingredients is not None:
            for ingredient_quantity in ingredients:
                if ingredient_quantity.quantity <= 0:
                    raise InvalidQuantityError(ingredient_quantity.quantity)
                try:
                    self.ingredient_repository.get_by_id(
                        ingredient_quantity.ingredient.id
                    )
                except IngredientNotFoundError:
                    raise ValueError(
                        f"Ingredient with ID {ingredient_quantity.ingredient.id} not found"
                    )

        # Prepare update data
        update_data = {}
        if name is not None:
            update_data["name"] = name.strip()
        if brand is not None:
            update_data["brand"] = brand.strip() if brand else None
        if photo_data is not None:
            update_data["photo_data"] = photo_data
        if shop is not None:
            update_data["shop"] = shop.strip() if shop else None
        if barcode is not None:
            update_data["barcode"] = barcode.strip() if barcode else None
        if calories_per_100g_or_ml is not None:
            update_data["calories_per_100g_or_ml"] = calories_per_100g_or_ml
        if macros_per_100g_or_ml is not None:
            update_data["macros_per_100g_or_ml"] = macros_per_100g_or_ml
        if package_size_g_or_ml is not None:
            update_data["package_size_g_or_ml"] = package_size_g_or_ml
        if ingredients is not None:
            update_data["ingredients"] = ingredients
        if tags is not None:
            update_data["tags"] = tags

        if not update_data:
            # No changes to make, return current product
            return self.repository.get_by_id(product_id)

        logger.info(f"Updating product: {product_id}")
        return self.repository.update(product_id, update_data)

    def delete_product(self, product_id: uuid.UUID) -> bool:
        """
        Delete a product.

        Args:
            product_id: The product ID

        Returns:
            bool: True if deleted successfully

        Raises:
            ProductNotFoundError: If product not found
            DatabaseError: If database operation fails
        """
        logger.info(f"Deleting product: {product_id}")
        return self.repository.delete(product_id)

    def search_products(self, name_pattern: str, limit: int = 10) -> List[Product]:
        """
        Search products by name pattern.

        Args:
            name_pattern: Pattern to search for
            limit: Maximum number of results

        Returns:
            List[Product]: List of matching products
        """
        if not name_pattern.strip():
            raise ValueError("Search pattern cannot be empty")

        if limit <= 0 or limit > 100:
            raise ValueError("Limit must be between 1 and 100")

        return self.repository.search_by_name(name_pattern.strip(), limit)

    def get_products_by_tags(self, tags: List[DietTagEnum]) -> List[Product]:
        """
        Get products that have all specified tags.

        Args:
            tags: List of required tags

        Returns:
            List[Product]: List of products with all specified tags
        """
        if not tags:
            raise ValueError("At least one tag must be specified")

        return self.repository.get_all(tag_filter=tags)

    def calculate_product_total_nutrition(self, product: Product) -> Optional[dict]:
        """
        Calculate total nutrition for the entire product package.

        Args:
            product: The product

        Returns:
            dict | None: Total nutrition values or None if cannot calculate
        """
        if (
            product.calories_per_100g_or_ml is None
            or product.macros_per_100g_or_ml is None
            or product.package_size_g_or_ml is None
        ):
            return None

        ratio = product.package_size_g_or_ml / 100.0

        return {
            "total_calories": product.calories_per_100g_or_ml * ratio,
            "total_protein_g": product.macros_per_100g_or_ml.protein_g * ratio,
            "total_carbohydrates_g": product.macros_per_100g_or_ml.carbohydrates_g
            * ratio,
            "total_fat_g": product.macros_per_100g_or_ml.fat_g * ratio,
            "package_size_g_or_ml": product.package_size_g_or_ml,
        }

    def _validate_product_data(
        self,
        name: str,
        calories: Optional[float],
        macros: Optional[Macros],
        package_size: Optional[float],
        ingredients: Optional[List[IngredientQuantity]],
    ) -> None:
        """Validate product data."""
        if not name or not name.strip():
            raise ValueError("Product name is required and cannot be empty")

        if calories is not None and calories < 0:
            raise ValueError("Calories must be non-negative")

        if macros is not None:
            if macros.protein_g < 0 or macros.carbohydrates_g < 0 or macros.fat_g < 0:
                raise ValueError("Macronutrient values must be non-negative")

        if package_size is not None and package_size <= 0:
            raise ValueError("Package size must be positive")

        if ingredients:
            for ingredient_quantity in ingredients:
                if ingredient_quantity.quantity <= 0:
                    raise InvalidQuantityError(ingredient_quantity.quantity)

        # Basic sanity check
        if calories is not None and calories > 10000:
            logger.warning(f"Very high calorie value: {calories} for product: {name}")


# Convenience functions for dependency injection
def get_ingredient_service(session: Session) -> IngredientService:
    """Get an IngredientService instance."""
    return IngredientService(session)


def get_product_service(session: Session) -> ProductService:
    """Get a ProductService instance."""
    return ProductService(session)
