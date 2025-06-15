"""
Routes for ingredients and products endpoints.
Handles HTTP requests and responses for the ingredients_and_products module.
"""

import logging
import uuid
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
    UploadFile,
    File,
    Form,
    HTTPException,
)
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
from .models import Ingredient

logger = logging.getLogger(__name__)

# Create router for ingredients and products
router = APIRouter(prefix="/ingredients-products", tags=["ingredients", "products"])


# Exception handlers have been moved to main.py to avoid APIRouter limitation


def convert_ingredient_ids_to_objects(
    ingredient_ids: list[uuid.UUID], db: Session
) -> list[Ingredient]:
    """
    Convert a list of ingredient IDs to Ingredient objects.

    Args:
        ingredient_ids: List of ingredient UUIDs
        db: Database session

    Returns:
        list[Ingredient]: List of Ingredient objects

    Raises:
        IngredientNotFoundError: If any ingredient ID is not found
    """
    print("Converting ingredient IDs to objects:", ingredient_ids)
    if not ingredient_ids:
        return []

    ingredient_service = get_ingredient_service(db)
    ingredients = []

    for ingredient_id in ingredient_ids:
        ingredient = ingredient_service.get_ingredient_by_id(ingredient_id)
        if ingredient is None:
            raise IngredientNotFoundError(str(ingredient_id))
        ingredients.append(ingredient)

    return ingredients


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

        # Convert ingredient IDs to Ingredient objects
        ingredients = None
        if product_data.ingredients:
            ingredients = convert_ingredient_ids_to_objects(
                product_data.ingredients, db
            )

        product_service = get_product_service(db)
        product = product_service.create_product(
            name=product_data.name,
            brand=product_data.brand,
            photo_data=product_data.photo_data,
            shop=product_data.shop,
            calories_per_100g_or_ml=product_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=product_data.macros_per_100g_or_ml,
            package_size_g_or_ml=product_data.package_size_g_or_ml,
            ingredients=ingredients,
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
        logger.info(f"Product data received: {product_data}")

        # Convert ingredient IDs to Ingredient objects
        ingredients = None
        if product_data.ingredients is not None:
            ingredients = convert_ingredient_ids_to_objects(
                product_data.ingredients, db
            )

        product_service = get_product_service(db)

        # Check if this is a photo removal request by looking at the model_dump
        model_dict = product_data.model_dump(exclude_unset=True)
        should_update_photo = "photo_data" in model_dict

        if should_update_photo:
            photo_data_to_pass = product_data.photo_data
        else:
            photo_data_to_pass = None

        product = product_service.update_product(
            product_id=product_id,
            name=product_data.name,
            brand=product_data.brand,
            photo_data=photo_data_to_pass,
            shop=product_data.shop,
            calories_per_100g_or_ml=product_data.calories_per_100g_or_ml,
            macros_per_100g_or_ml=product_data.macros_per_100g_or_ml,
            package_size_g_or_ml=product_data.package_size_g_or_ml,
            ingredients=ingredients,
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


# ========== FILE UPLOAD ENDPOINTS ==========


@router.post(
    "/ingredients/with-photo",
    response_model=IngredientResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create ingredient with photo upload",
    description="Create a new ingredient with photo upload support via multipart form data.",
)
async def create_ingredient_with_photo(
    name: str = Form(...),
    shops: str = Form("[]"),  # JSON string
    calories_per_100g_or_ml: float = Form(...),
    macros_protein: float = Form(...),
    macros_carbohydrates: float = Form(...),
    macros_fat: float = Form(...),
    macros_sugar: float = Form(...),
    macros_fiber: float = Form(...),
    macros_saturated_fat: float = Form(...),
    tags: str = Form("[]"),  # JSON string
    photo: UploadFile = File(None),
    db: Session = Depends(get_db_session),
) -> IngredientResponseSchema:
    """Create a new ingredient with optional photo upload."""
    import json
    from app.models import Macros

    try:
        logger.info(f"Creating ingredient with photo: {name}")
        logger.info(f"Photo received: {photo.filename if photo else 'None'}")
        logger.info(f"Photo size: {photo.size if photo else 'N/A'}")
        logger.info(f"Photo content type: {photo.content_type if photo else 'N/A'}")

        # Parse JSON fields
        shops_list = json.loads(shops) if shops else []
        tags_list = json.loads(tags) if tags else []

        # Handle photo upload
        photo_data = None
        if photo and photo.filename:
            logger.info("Reading photo data...")
            photo_data = await photo.read()
            logger.info(f"Photo data read successfully, size: {len(photo_data)} bytes")
        else:
            logger.info("No photo provided or empty filename")

        # Create macros object
        macros = Macros(
            protein=macros_protein,
            carbohydrates=macros_carbohydrates,
            fat=macros_fat,
            sugar=macros_sugar,
            fiber=macros_fiber,
            saturated_fat=macros_saturated_fat,
        )

        ingredient_service = get_ingredient_service(db)
        ingredient = ingredient_service.create_ingredient(
            name=name,
            calories_per_100g_or_ml=calories_per_100g_or_ml,
            macros_per_100g_or_ml=macros,
            photo_data=photo_data,
            shops=shops_list,
            tags=tags_list,
        )

        logger.info(f"Ingredient created successfully: {ingredient.id}")
        return IngredientResponseSchema.model_validate(ingredient)

    except Exception as e:
        logger.error(f"Error creating ingredient: {e}")
        raise


@router.post(
    "/products/with-photo",
    response_model=ProductResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create product with photo upload",
    description="Create a new product with photo upload support via multipart form data.",
)
async def create_product_with_photo(
    name: str = Form(...),
    brand: str = Form(""),
    shop: str = Form(""),
    calories_per_100g_or_ml: float = Form(0),
    macros_protein: float = Form(0),
    macros_carbohydrates: float = Form(0),
    macros_fat: float = Form(0),
    macros_sugar: float = Form(0),
    macros_fiber: float = Form(0),
    macros_saturated_fat: float = Form(0),
    package_size_g_or_ml: float = Form(0),
    ingredients: str = Form("[]"),  # JSON string with ingredient IDs
    tags: str = Form("[]"),  # JSON string
    photo: UploadFile = File(None),
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Create a new product with optional photo upload."""
    import json
    from app.models import Macros

    try:
        logger.info(f"Creating product with photo: {name}")

        # Parse JSON fields
        tags_list = json.loads(tags) if tags else []
        ingredient_ids = json.loads(ingredients) if ingredients else []

        # Handle photo upload
        photo_data = None
        if photo:
            photo_data = await photo.read()

        # Create macros object if values are provided
        macros = None
        if any(
            [
                macros_protein,
                macros_carbohydrates,
                macros_fat,
                macros_sugar,
                macros_fiber,
                macros_saturated_fat,
            ]
        ):
            macros = Macros(
                protein=macros_protein,
                carbohydrates=macros_carbohydrates,
                fat=macros_fat,
                sugar=macros_sugar,
                fiber=macros_fiber,
                saturated_fat=macros_saturated_fat,
            )

        # Convert ingredient IDs to Ingredient objects
        ingredients_list = None
        if ingredient_ids:
            ingredients_list = convert_ingredient_ids_to_objects(ingredient_ids, db)

        product_service = get_product_service(db)
        product = product_service.create_product(
            name=name,
            brand=brand if brand else None,
            photo_data=photo_data,
            shop=shop if shop else None,
            calories_per_100g_or_ml=calories_per_100g_or_ml
            if calories_per_100g_or_ml > 0
            else None,
            macros_per_100g_or_ml=macros,
            package_size_g_or_ml=package_size_g_or_ml
            if package_size_g_or_ml > 0
            else None,
            ingredients=ingredients_list,
            tags=tags_list,
        )

        logger.info(f"Product created successfully: {product.id}")
        return ProductResponseSchema.model_validate(product)

    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise


@router.put(
    "/ingredients/{ingredient_id}/with-photo",
    response_model=IngredientResponseSchema,
    summary="Update ingredient with photo upload",
    description="Update an existing ingredient with photo upload support via multipart form data.",
)
async def update_ingredient_with_photo(
    ingredient_id: uuid.UUID,
    name: str = Form(...),
    shops: str = Form("[]"),  # JSON string
    calories_per_100g_or_ml: float = Form(...),
    macros_protein: float = Form(...),
    macros_carbohydrates: float = Form(...),
    macros_fat: float = Form(...),
    macros_sugar: float = Form(...),
    macros_fiber: float = Form(...),
    macros_saturated_fat: float = Form(...),
    tags: str = Form("[]"),  # JSON string
    photo: UploadFile = File(None),
    db: Session = Depends(get_db_session),
) -> IngredientResponseSchema:
    """Update an existing ingredient with optional photo upload."""
    import json
    from app.models import Macros

    try:
        logger.info(f"Updating ingredient with photo: {ingredient_id}")
        logger.info(f"Photo received: {photo.filename if photo else 'None'}")
        logger.info(f"Photo size: {photo.size if photo else 'N/A'}")
        logger.info(f"Photo content type: {photo.content_type if photo else 'N/A'}")

        # Parse JSON fields
        shops_list = json.loads(shops) if shops else []
        tags_list = json.loads(tags) if tags else []

        # Handle photo upload
        photo_data = None
        if photo and photo.filename:
            logger.info("Reading photo data...")
            photo_data = await photo.read()
            logger.info(f"Photo data read successfully, size: {len(photo_data)} bytes")
        else:
            logger.info("No photo provided for update")

        # Create macros object
        macros = Macros(
            protein=macros_protein,
            carbohydrates=macros_carbohydrates,
            fat=macros_fat,
            sugar=macros_sugar,
            fiber=macros_fiber,
            saturated_fat=macros_saturated_fat,
        )

        ingredient_service = get_ingredient_service(db)
        ingredient = ingredient_service.update_ingredient(
            ingredient_id=ingredient_id,
            name=name,
            calories_per_100g_or_ml=calories_per_100g_or_ml,
            macros_per_100g_or_ml=macros,
            photo_data=photo_data,
            shops=shops_list,
            tags=tags_list,
        )

        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )

        logger.info(f"Ingredient updated successfully: {ingredient.id}")
        return IngredientResponseSchema.model_validate(ingredient)

    except Exception as e:
        logger.error(f"Error updating ingredient: {e}")
        raise


@router.put(
    "/products/{product_id}/with-photo",
    response_model=ProductResponseSchema,
    summary="Update product with photo upload",
    description="Update an existing product with photo upload support via multipart form data. All fields are optional except name.",
)
async def update_product_with_photo(
    product_id: uuid.UUID,
    name: str = Form(...),  # Name is required for an update here
    brand: Optional[str] = Form(None),
    shop: Optional[str] = Form(None),
    calories_per_100g_or_ml: Optional[float] = Form(None),
    macros_protein: Optional[float] = Form(None),
    macros_carbohydrates: Optional[float] = Form(None),
    macros_fat: Optional[float] = Form(None),
    macros_sugar: Optional[float] = Form(None),
    macros_fiber: Optional[float] = Form(None),
    macros_saturated_fat: Optional[float] = Form(None),
    package_size_g_or_ml: Optional[float] = Form(None),
    ingredients: Optional[str] = Form(
        None
    ),  # JSON string with ingredient IDs, None if not to be changed
    tags: Optional[str] = Form(None),  # JSON string, None if not to be changed
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db_session),
) -> ProductResponseSchema:
    """Update an existing product with optional photo upload."""
    import json
    from app.models import (
        Macros,
    )  # Ensure this is the correct import for your Macros Pydantic model

    try:
        logger.info(f"Updating product {product_id} with photo option.")

        photo_bytes: Optional[bytes] = None
        if photo and photo.filename:
            logger.info(
                f"New photo received for product {product_id}: {photo.filename}, size: {photo.size}, type: {photo.content_type}"
            )
            photo_bytes = await photo.read()
        elif photo:
            logger.info(
                f"Photo field was present for product {product_id} but no filename, treating as no new photo."
            )
        else:
            logger.info(f"No new photo provided for product {product_id}.")

        parsed_tags: Optional[List[DietTagEnum]] = None
        if tags is not None:
            try:
                parsed_tags = json.loads(tags)
                if not isinstance(parsed_tags, list):  # Basic validation
                    raise ValueError("Tags must be a JSON list.")
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON format for tags.",
                )
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
                )

        parsed_ingredient_ids: Optional[List[uuid.UUID]] = None
        if ingredients is not None:
            try:
                parsed_ingredient_ids = [
                    uuid.UUID(id_str) for id_str in json.loads(ingredients)
                ]
                if not isinstance(
                    json.loads(ingredients), list
                ):  # Check original structure
                    raise ValueError("Ingredients must be a JSON list of UUID strings.")
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON format for ingredients.",
                )
            except ValueError:  # Catches UUID conversion errors or custom ValueError
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid UUID format in ingredients list.",
                )

        macros_obj: Optional[Macros] = None
        # Collect provided macro values
        active_macros_values = {
            "protein": macros_protein,
            "carbohydrates": macros_carbohydrates,
            "fat": macros_fat,
            "sugar": macros_sugar,
            "fiber": macros_fiber,
            "saturated_fat": macros_saturated_fat,
        }
        # Filter out None values to see if any macro component was actually sent
        provided_macros = {
            k: v for k, v in active_macros_values.items() if v is not None
        }

        if provided_macros:  # If at least one macro component was provided
            macros_obj = Macros(
                protein=provided_macros.get(
                    "protein", 0
                ),  # Default to 0 if a component is missing but others are present
                carbohydrates=provided_macros.get("carbohydrates", 0),
                fat=provided_macros.get("fat", 0),
                sugar=provided_macros.get("sugar", 0),
                fiber=provided_macros.get("fiber", 0),
                saturated_fat=provided_macros.get("saturated_fat", 0),
            )

        ingredients_list_for_service: Optional[List[Ingredient]] = None
        if (
            parsed_ingredient_ids is not None
        ):  # If ingredients JSON was provided (even if "[]")
            ingredients_list_for_service = convert_ingredient_ids_to_objects(
                parsed_ingredient_ids, db
            )

        product_service = get_product_service(db)
        updated_product = product_service.update_product(
            product_id=product_id,
            name=name,  # Name is required by Form(...)
            brand=brand,
            photo_data=photo_bytes,  # Pass the bytes, or None if no new photo
            shop=shop,
            calories_per_100g_or_ml=calories_per_100g_or_ml,
            macros_per_100g_or_ml=macros_obj,
            package_size_g_or_ml=package_size_g_or_ml,
            ingredients=ingredients_list_for_service,
            tags=parsed_tags,
        )

        if updated_product is None:
            raise ProductNotFoundError(str(product_id))

        logger.info(f"Product {product_id} updated successfully.")
        return ProductResponseSchema.model_validate(updated_product)

    except ProductNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    except IngredientNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ingredient ID provided: {str(e)}",
        )
    except HTTPException:  # Re-raise HTTPExceptions directly
        raise
    except Exception as e:
        logger.error(
            f"Error updating product {product_id} with photo: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the product.",
        )
