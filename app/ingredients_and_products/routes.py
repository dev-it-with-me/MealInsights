"""
Routes for ingredients and products endpoints.
Handles HTTP requests and responses for the ingredients_and_products module.
"""

import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.config import get_db_session
from app.enums import DietTagEnum
from .schemas import (
    IngredientCreateSchema,
    IngredientUpdateSchema,
    IngredientResponseSchema,
    IngredientsListSchema,
    ProductCreateSchema,
    ProductUpdateSchema,
    ProductResponseSchema,
    ProductsListSchema,
)
from .dependencies import get_ingredient_service, get_product_service
from .exceptions import (
    IngredientNotFoundError,
    ProductNotFoundError,
)

logger = logging.getLogger(__name__)

# Create router for ingredients and products
router = APIRouter(prefix="/ingredients-products", tags=["ingredients", "products"])


# Exception handlers have been moved to main.py to avoid APIRouter limitation


# ========== INGREDIENT ENDPOINTS ==========


@router.post(
    "/ingredients",
    response_model=IngredientResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ingredient",
    description="Create a new ingredient with nutritional information and tags.",
)
async def create_ingredient(
    ingredient_data: IngredientCreateSchema, db: Session = Depends(get_db_session)
) -> IngredientResponseSchema:
    """Create a new ingredient."""
    try:
        logger.info(f"Creating ingredient: {ingredient_data.name}")

        ingredient_service = get_ingredient_service(db)
        ingredient = ingredient_service.create_ingredient(
            name=ingredient_data.name,
            calories_per_100g_or_ml=ingredient_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=ingredient_data.macros_per_100g_or_ml,
            photo_data=ingredient_data.photo_data,
            shops=ingredient_data.shops,
            tags=ingredient_data.tags,
        )

        logger.info(f"Ingredient created successfully: {ingredient.id}")
        return IngredientResponseSchema.model_validate(ingredient)

    except Exception as e:
        logger.error(f"Error creating ingredient: {e}")
        raise


@router.get(
    "/ingredients/{ingredient_id}",
    response_model=IngredientResponseSchema,
    summary="Get ingredient by ID",
    description="Retrieve a specific ingredient by its unique identifier.",
)
async def get_ingredient(
    ingredient_id: uuid.UUID, db: Session = Depends(get_db_session)
) -> IngredientResponseSchema:
    """Get a specific ingredient by ID."""
    try:
        logger.info(f"Retrieving ingredient: {ingredient_id}")

        ingredient_service = get_ingredient_service(db)
        ingredient = ingredient_service.get_ingredient_by_id(ingredient_id)

        return IngredientResponseSchema.model_validate(ingredient)

    except Exception as e:
        logger.error(f"Error retrieving ingredient {ingredient_id}: {e}")
        raise


@router.get(
    "/ingredients",
    response_model=IngredientsListSchema,
    summary="List ingredients",
    description="Get a list of ingredients with optional filtering and pagination.",
)
async def list_ingredients(
    skip: int = Query(0, ge=0, description="Number of ingredients to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of ingredients to return"
    ),
    name_filter: Optional[str] = Query(None, description="Filter by ingredient name"),
    shop_filter: Optional[str] = Query(None, description="Filter by shop name"),
    tag_filter: Optional[List[DietTagEnum]] = Query(None, description="Filter by tags"),
    db: Session = Depends(get_db_session),
) -> IngredientsListSchema:
    """List ingredients with filtering and pagination."""
    try:
        logger.info(f"Listing ingredients: skip={skip}, limit={limit}")

        ingredient_service = get_ingredient_service(db)
        ingredients = ingredient_service.get_all_ingredients(
            skip=skip,
            limit=limit,
            name_filter=name_filter,
            shop_filter=shop_filter,
            tag_filter=tag_filter,
        )

        # For total count, we would need another service method or modify the existing one
        # For now, returning the length of the results
        total = len(ingredients)

        return IngredientsListSchema(
            ingredients=[
                IngredientResponseSchema.model_validate(ing) for ing in ingredients
            ],
            total=total,
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logger.error(f"Error listing ingredients: {e}")
        raise


@router.put(
    "/ingredients/{ingredient_id}",
    response_model=IngredientResponseSchema,
    summary="Update ingredient",
    description="Update an existing ingredient's information.",
)
async def update_ingredient(
    ingredient_id: uuid.UUID,
    ingredient_data: IngredientUpdateSchema,
    db: Session = Depends(get_db_session),
) -> IngredientResponseSchema:
    """Update an existing ingredient."""
    try:
        logger.info(f"Updating ingredient: {ingredient_id}")

        ingredient_service = get_ingredient_service(db)
        ingredient = ingredient_service.update_ingredient(
            ingredient_id=ingredient_id,
            name=ingredient_data.name,
            calories_per_100g_or_ml=ingredient_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=ingredient_data.macros_per_100g_or_ml,
            photo_data=ingredient_data.photo_data,
            shops=ingredient_data.shops,
            tags=ingredient_data.tags,
        )
        if not ingredient:
            raise IngredientNotFoundError(str(ingredient_id))
        logger.info(f"Ingredient updated successfully: {ingredient.id}")
        return IngredientResponseSchema.model_validate(ingredient)

    except Exception as e:
        logger.error(f"Error updating ingredient {ingredient_id}: {e}")
        raise


@router.delete(
    "/ingredients/{ingredient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete ingredient",
    description="Delete an ingredient by its ID.",
)
async def delete_ingredient(
    ingredient_id: uuid.UUID, db: Session = Depends(get_db_session)
):
    """Delete an ingredient."""
    try:
        logger.info(f"Deleting ingredient: {ingredient_id}")

        ingredient_service = get_ingredient_service(db)
        success = ingredient_service.delete_ingredient(ingredient_id)

        if not success:
            raise IngredientNotFoundError(str(ingredient_id))

        logger.info(f"Ingredient deleted successfully: {ingredient_id}")

    except Exception as e:
        logger.error(f"Error deleting ingredient {ingredient_id}: {e}")
        raise


@router.get(
    "/ingredients/search",
    response_model=List[IngredientResponseSchema],
    summary="Search ingredients",
    description="Search ingredients by name pattern.",
)
async def search_ingredients(
    name_pattern: str = Query(
        ..., description="Pattern to search for in ingredient names"
    ),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db_session),
) -> List[IngredientResponseSchema]:
    """Search ingredients by name pattern."""
    try:
        logger.info(f"Searching ingredients: pattern='{name_pattern}', limit={limit}")

        ingredient_service = get_ingredient_service(db)
        ingredients = ingredient_service.search_ingredients(name_pattern, limit)

        return [IngredientResponseSchema.model_validate(ing) for ing in ingredients]

    except Exception as e:
        logger.error(f"Error searching ingredients: {e}")
        raise


@router.get(
    "/ingredients/by-tags",
    response_model=List[IngredientResponseSchema],
    summary="Get ingredients by tags",
    description="Retrieve ingredients that match specific tags.",
)
async def get_ingredients_by_tags(
    tags: List[DietTagEnum] = Query(..., description="List of tags to filter by"),
    db: Session = Depends(get_db_session),
) -> List[IngredientResponseSchema]:
    """Get ingredients by tags."""
    try:
        logger.info(f"Getting ingredients by tags: {tags}")

        ingredient_service = get_ingredient_service(db)
        ingredients = ingredient_service.get_ingredients_by_tags(tags)

        return [IngredientResponseSchema.model_validate(ing) for ing in ingredients]

    except Exception as e:
        logger.error(f"Error getting ingredients by tags: {e}")
        raise


# ========== PRODUCT ENDPOINTS ==========


@router.post(
    "/products",
    response_model=ProductResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product with nutritional information and ingredient composition.",
)
async def create_product(
    product_data: ProductCreateSchema,
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Create a new product."""
    try:
        logger.info(f"Creating product: {product_data.name}")

        product_service = get_product_service(db)
        product = product_service.create_product(
            name=product_data.name,
            brand=product_data.brand,
            photo_data=product_data.photo_data,
            shop=product_data.shop,
            calories_per_100g_or_ml=product_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=product_data.macros_per_100g_or_ml,
            package_size_g_or_ml=product_data.package_size_g_or_ml,
            ingredients=None,  # TODO: Handle ingredients conversion from IDs to Ingredient objects
            tags=product_data.tags,
        )

        logger.info(f"Product created successfully: {product.id}")
        return ProductResponseSchema.model_validate(product)

    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise


@router.get(
    "/products/{product_id}",
    response_model=ProductResponseSchema,
    summary="Get product by ID",
    description="Retrieve a specific product by its unique identifier.",
)
async def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Get a specific product by ID."""
    try:
        logger.info(f"Retrieving product: {product_id}")

        product_service = get_product_service(db)
        product = product_service.get_product_by_id(product_id)

        return ProductResponseSchema.model_validate(product)

    except Exception as e:
        logger.error(f"Error retrieving product {product_id}: {e}")
        raise


@router.get(
    "/products",
    response_model=ProductsListSchema,
    summary="List products",
    description="Get a list of products with optional filtering and pagination.",
)
async def list_products(
    skip: int = Query(0, ge=0, description="Number of products to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of products to return"
    ),
    name_filter: Optional[str] = Query(None, description="Filter by product name"),
    brand_filter: Optional[str] = Query(None, description="Filter by brand name"),
    shop_filter: Optional[str] = Query(None, description="Filter by shop name"),
    tag_filter: Optional[List[DietTagEnum]] = Query(None, description="Filter by tags"),
    db: Session = Depends(get_db_session),
) -> ProductsListSchema:
    """List products with filtering and pagination."""
    try:
        logger.info(f"Listing products: skip={skip}, limit={limit}")

        product_service = get_product_service(db)
        # Note: The service method signature will need to be adjusted based on the actual implementation
        products = product_service.get_all_products(
            skip=skip,
            limit=limit,
            name_filter=name_filter,
            brand_filter=brand_filter,
            shop_filter=shop_filter,
            tag_filter=tag_filter,
        )

        # For total count, we would need another service method or modify the existing one
        total = len(products)

        return ProductsListSchema(
            products=[ProductResponseSchema.model_validate(prod) for prod in products],
            total=total,
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logger.error(f"Error listing products: {e}")
        raise


@router.put(
    "/products/{product_id}",
    response_model=ProductResponseSchema,
    summary="Update product",
    description="Update an existing product's information.",
)
async def update_product(
    product_id: uuid.UUID,
    product_data: ProductUpdateSchema,
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Update an existing product."""
    try:
        logger.info(f"Updating product: {product_id}")

        product_service = get_product_service(db)
        product = product_service.update_product(
            product_id=product_id,
            name=product_data.name,
            brand=product_data.brand,
            photo_data=product_data.photo_data,
            shop=product_data.shop,
            calories_per_100g_or_ml=product_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=product_data.macros_per_100g_or_ml,
            package_size_g_or_ml=product_data.package_size_g_or_ml,
            ingredients=None,  # TODO: Handle ingredients conversion from IDs to Ingredient objects
            tags=product_data.tags,
        )
        if product is None:
            raise ProductNotFoundError(str(product_id))
        logger.info(f"Product updated successfully: {product.id}")
        return ProductResponseSchema.model_validate(product)

    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete product",
    description="Delete a product by its ID.",
)
async def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db_session),
):
    """Delete a product."""
    try:
        logger.info(f"Deleting product: {product_id}")

        product_service = get_product_service(db)
        success = product_service.delete_product(product_id)

        if not success:
            raise ProductNotFoundError(str(product_id))

        logger.info(f"Product deleted successfully: {product_id}")

    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise


@router.get(
    "/products/search",
    response_model=List[ProductResponseSchema],
    summary="Search products",
    description="Search products by name pattern.",
)
async def search_products(
    name_pattern: str = Query(
        ..., description="Pattern to search for in product names"
    ),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db_session),
) -> List[ProductResponseSchema]:
    """Search products by name pattern."""
    try:
        logger.info(f"Searching products: pattern='{name_pattern}', limit={limit}")

        product_service = get_product_service(db)
        products = product_service.search_products(name_pattern, limit)

        return [ProductResponseSchema.model_validate(prod) for prod in products]

    except Exception as e:
        logger.error(f"Error searching products: {e}")
        raise


@router.get(
    "/products/by-barcode/{barcode}",
    response_model=ProductResponseSchema,
    summary="Get product by barcode",
    description="Retrieve a product by its barcode.",
)
async def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Get a product by barcode."""
    try:
        logger.info(f"Retrieving product by barcode: {barcode}")

        product_service = get_product_service(db)
        product = product_service.get_product_by_barcode(barcode)

        return ProductResponseSchema.model_validate(product)

    except Exception as e:
        logger.error(f"Error retrieving product by barcode {barcode}: {e}")
        raise
