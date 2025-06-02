"""
Business logic layer for ingredients and products.
Orchestrates operations and handles business rules.
"""

import logging
import uuid
from sqlalchemy.orm import Session

from app.models import Macros
from app.enums import DietTagEnum
from .models import Ingredient, Product
from .repositories import IngredientRepository, ProductRepository
from .exceptions import (
    IngredientNotFoundError,
    ProductNotFoundError,
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
        photo_data: None | bytes = None,
        shops: None | list[str] = None,
        tags: None | list[DietTagEnum] = None,
    ) -> Ingredient:
        """
        Create a new ingredient with validation.

        Args:
            name: Ingredient name
            calories_per_100g_or_ml: Calories per 100g or 100ml
            macros_per_100g_or_ml: Macronutrients per 100g or 100ml
            photo_data: None | photo data
            shops: None | list of shops where ingredient can be bought
            tags: None | list of diet tags

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

        # Clean and process shops list
        cleaned_shops = []
        if shops:
            cleaned_shops = [shop.strip() for shop in shops if shop and shop.strip()]

        # Instantiate Ingredient model instead of raw dict
        ingredient = Ingredient(
            name=name.strip(),
            calories_per_100g_or_ml=calories_per_100g_or_ml,
            macros_per_100g_or_ml=macros_per_100g_or_ml,
            photo_data=photo_data,
            shops=cleaned_shops,
            tags=tags or [],
        )
        logger.info(f"Creating ingredient: {name}")
        return self.repository.create(ingredient)

    def get_ingredient_by_id(self, ingredient_id: uuid.UUID) -> Ingredient | None:
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
        name_filter: None | str = None,
        shop_filter: None | str = None,
        tag_filter: None | list[DietTagEnum] = None,
    ) -> list[Ingredient]:
        """
        Get all ingredients with optional filtering.

        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            name_filter: Filter by ingredient name (partial match)
            shop_filter: Filter by shop name (partial match)
            tag_filter: Filter by tags (ingredient must have all specified tags)

        Returns:
            list[Ingredient]: list of ingredients
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
        name: None | str = None,
        calories_per_100g_or_ml: None | float = None,
        macros_per_100g_or_ml: None | Macros = None,
        photo_data: None | bytes = None,
        shops: None | list[str] = None,
        tags: None | list[DietTagEnum] = None,
    ) -> Ingredient | None:
        """
        Update an existing ingredient.

        Args:
            ingredient_id: The ingredient ID
            name: None | new name
            calories_per_100g_or_ml: None | new calories
            macros_per_100g_or_ml: None | new macros
            photo_data: None | new photo data
            shops: None | new list of shops
            tags: None | new tags list

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

        # Fetch existing ingredient
        existing = self.repository.get_by_id(ingredient_id)
        if not existing:
            raise IngredientNotFoundError(str(ingredient_id))

        # Clean and process shops list if provided
        cleaned_shops = existing.shops
        if shops is not None:
            cleaned_shops = [shop.strip() for shop in shops if shop and shop.strip()]

        # Build updated Ingredient model
        updated = Ingredient(
            id=ingredient_id,
            name=name.strip() if name is not None else existing.name,
            calories_per_100g_or_ml=(
                calories_per_100g_or_ml
                if calories_per_100g_or_ml is not None
                else existing.calories_per_100g_or_ml
            ),
            macros_per_100g_or_ml=(
                macros_per_100g_or_ml
                if macros_per_100g_or_ml is not None
                else existing.macros_per_100g_or_ml
            ),
            photo_data=photo_data if photo_data is not None else existing.photo_data,
            shops=cleaned_shops,
            tags=tags if tags is not None else existing.tags,
        )
        logger.info(f"Updating ingredient: {ingredient_id}")
        return self.repository.update(updated)

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
    ) -> list[Ingredient]:
        """
        Search ingredients by name pattern.

        Args:
            name_pattern: Pattern to search for
            limit: Maximum number of results

        Returns:
            list[Ingredient]: list of matching ingredients
        """
        if not name_pattern.strip():
            raise ValueError("Search pattern cannot be empty")

        if limit <= 0 or limit > 100:
            raise ValueError("Limit must be between 1 and 100")

        return self.repository.search_by_name(name_pattern.strip(), limit)

    def get_ingredients_by_tags(self, tags: list[DietTagEnum]) -> list[Ingredient]:
        """
        Get ingredients that have all specified tags.

        Args:
            tags: list of required tags

        Returns:
            list[Ingredient]: list of ingredients with all specified tags
        """
        if not tags:
            raise ValueError("At least one tag must be specified")

        return self.repository.get_all(tag_filter=tags)

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
        brand: None | str = None,
        photo_data: None | bytes = None,
        shop: None | str = None,
        barcode: None | str = None,
        calories_per_100g_or_ml: None | float = None,
        macros_per_100g_or_ml: None | Macros = None,
        package_size_g_or_ml: None | float = None,
        ingredients: None | list[Ingredient] = None,
        tags: None | list[DietTagEnum] = None,
    ) -> Product:
        """
        Create a new product with validation.

        Args:
            name: Product name
            brand: None |  brand name
            photo_data: None |  photo data
            shop: None |  shop where product was bought
            barcode: None |  product barcode
            calories_per_100g_or_ml: None |  calories per 100g or 100ml
            macros_per_100g_or_ml: None |  macronutrients per 100g or 100ml
            package_size_g_or_ml: None |  total package size
            ingredients: None |  list of ingredients with quantities
            tags: None |  list of diet tags

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
        tags_from_ingredients: list[DietTagEnum] = []
        # Validate ingredients exist if provided
        if ingredients:
            for ingredient in ingredients:
                try:
                    # Validate that the ingredient exists
                    existing_ingredient: Ingredient | None = (
                        self.ingredient_repository.get_by_id(ingredient.id)
                    )
                    if existing_ingredient is not None:
                        tags_from_ingredients.extend(existing_ingredient.tags)
                except IngredientNotFoundError:
                    raise ValueError(f"Ingredient with ID {ingredient.id} not found")
        if tags is not None:
            tags.extend(tags_from_ingredients)
            # Remove duplicates
            tags = list(set(tags))
        else:
            tags = list(set(tags_from_ingredients))
        # Instantiate Product model instead of raw dict
        product = Product(
            name=name.strip(),
            brand=brand.strip() if brand else None,
            photo_data=photo_data,
            shop=shop.strip() if shop else None,
            barcode=barcode.strip() if barcode else None,
            calories_per_100g_or_ml=calories_per_100g_or_ml,
            macros_per_100g_or_ml=macros_per_100g_or_ml,
            package_size_g_or_ml=package_size_g_or_ml,
            ingredients=ingredients or [],
            tags=tags or [],
        )
        logger.info(f"Creating product: {name}")
        return self.repository.create(product)

    def get_product_by_id(self, product_id: uuid.UUID) -> Product | None:
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

    def get_product_by_barcode(self, barcode: str) -> None | Product:
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
        name_filter: None | str = None,
        brand_filter: None | str = None,
        shop_filter: None | str = None,
        tag_filter: None | list[DietTagEnum] = None,
    ) -> list[Product]:
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
            listProduct: list of products
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
        name: None | str = None,
        brand: None | str = None,
        photo_data: None | bytes = None,
        shop: None | str = None,
        barcode: None | str = None,
        calories_per_100g_or_ml: None | float = None,
        macros_per_100g_or_ml: None | Macros = None,
        package_size_g_or_ml: None | float = None,
        ingredients: None | list[Ingredient] = None,
        tags: None | list[DietTagEnum] = None,
    ) -> Product | None:
        """
        Update an existing product.

        Args:
            product_id: The product ID
            name: None |  new name
            brand: None |  new brand
            photo_data: None |  new photo data
            shop: None |  new shop
            barcode: None |  new barcode
            calories_per_100g_or_ml: None |  new calories
            macros_per_100g_or_ml: None |  new macros
            package_size_g_or_ml: None |  new package size
            ingredients: None |  new ingredients list
            tags: None |  new tags list

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

        tags_from_ingredients: list[DietTagEnum] = []
        # Validate ingredients exist if provided
        if ingredients is not None:
            for ingredient in ingredients:
                try:
                    # Validate that the ingredient exists
                    existing_ingredient: Ingredient | None = (
                        self.ingredient_repository.get_by_id(ingredient.id)
                    )
                    if existing_ingredient is not None:
                        tags_from_ingredients.extend(existing_ingredient.tags)
                except IngredientNotFoundError:
                    raise ValueError(f"Ingredient with ID {ingredient.id} not found")

        # Fetch existing product
        existing = self.repository.get_by_id(product_id)
        if not existing:
            raise ProductNotFoundError(str(product_id))

        if tags is not None:
            tags.extend(tags_from_ingredients)
            # Remove duplicates
            tags = list(set(tags))
        else:
            tags = list(set(tags_from_ingredients))
        # Build updated Product model
        updated = Product(
            id=product_id,
            name=name.strip() if name is not None else existing.name,
            brand=brand.strip() if brand is not None else existing.brand,
            photo_data=photo_data if photo_data is not None else existing.photo_data,
            shop=shop.strip() if shop is not None else existing.shop,
            barcode=barcode.strip() if barcode is not None else existing.barcode,
            calories_per_100g_or_ml=(
                calories_per_100g_or_ml
                if calories_per_100g_or_ml is not None
                else existing.calories_per_100g_or_ml
            ),
            macros_per_100g_or_ml=(
                macros_per_100g_or_ml
                if macros_per_100g_or_ml is not None
                else existing.macros_per_100g_or_ml
            ),
            package_size_g_or_ml=(
                package_size_g_or_ml
                if package_size_g_or_ml is not None
                else existing.package_size_g_or_ml
            ),
            ingredients=ingredients
            if ingredients is not None
            else existing.ingredients,
            tags=tags if tags is not None else existing.tags,
        )
        logger.info(f"Updating product: {product_id}")
        return self.repository.update(updated)

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

    def search_products(self, name_pattern: str, limit: int = 10) -> list[Product]:
        """
        Search products by name pattern.

        Args:
            name_pattern: Pattern to search for
            limit: Maximum number of results

        Returns:
            list[Product]: list of matching products
        """
        if not name_pattern.strip():
            raise ValueError("Search pattern cannot be empty")

        if limit <= 0 or limit > 100:
            raise ValueError("Limit must be between 1 and 100")

        return self.repository.search_by_name(name_pattern.strip(), limit)

    def get_products_by_tags(self, tags: list[DietTagEnum]) -> list[Product]:
        """
        Get products that have all specified tags.

        Args:
            tags: list of required tags

        Returns:
            listProduct: list of products with all specified tags
        """
        if not tags:
            raise ValueError("At least one tag must be specified")

        return self.repository.get_all(tag_filter=tags)

    def calculate_product_total_nutrition(self, product: Product) -> None | dict:
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
        calories: None | float,
        macros: None | Macros,
        package_size: None | float,
        ingredients: None | list[Ingredient],
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

        # Note: Ingredient validation simplified since we no longer have quantities per ingredient
        # Individual ingredient validation is handled elsewhere

        # Basic sanity check
        if calories is not None and calories > 10000:
            logger.warning(f"Very high calorie value: {calories} for product: {name}")
