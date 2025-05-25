"""
API request/response schemas for ingredients and products endpoints.
These schemas are used for API validation and documentation.
"""

import uuid

from pydantic import BaseModel, Field

from app.models import Macros
from app.enums import DietTagEnum, UnitEnum
from .models import Ingredient, Product, IngredientQuantity


# Ingredient Schemas
class IngredientCreateSchema(BaseModel):
    """Schema for creating a new ingredient."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Name of the ingredient"
    )
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the ingredient's photo"
    )
    shop: None | str = Field(
        default=None,
        max_length=100,
        description="Shop where the ingredient can be bought",
    )
    calories_per_100g_or_ml: float = Field(
        ..., ge=0, description="Calories per 100g or 100ml of the ingredient"
    )
    macros_per_100g_or_ml: Macros = Field(
        ..., description="Macronutrients per 100g or 100ml of the ingredient"
    )
    tags: list[DietTagEnum] = Field(
        default_factory=list,
        description="Tags associated with the ingredient",
    )

    model_config = {"extra": "forbid"}


class IngredientUpdateSchema(BaseModel):
    """Schema for updating an existing ingredient."""

    name: None | str = Field(
        default=None, min_length=1, max_length=100, description="Name of the ingredient"
    )
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the ingredient's photo"
    )
    shop: None | str = Field(
        default=None,
        max_length=100,
        description="Shop where the ingredient can be bought",
    )
    calories_per_100g_or_ml: None | float = Field(
        default=None, ge=0, description="Calories per 100g or 100ml of the ingredient"
    )
    macros_per_100g_or_ml: None | Macros = Field(
        default=None, description="Macronutrients per 100g or 100ml of the ingredient"
    )
    tags: None | list[DietTagEnum] = Field(
        default=None,
        description="Tags associated with the ingredient",
    )

    model_config = {"extra": "forbid"}


class IngredientResponseSchema(BaseModel):
    """Schema for ingredient API responses."""

    id: uuid.UUID = Field(..., description="Unique identifier for the ingredient")
    name: str = Field(..., description="Name of the ingredient")
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the ingredient's photo"
    )
    shop: None | str = Field(
        default=None, description="Shop where the ingredient can be bought"
    )
    calories_per_100g_or_ml: float = Field(
        ..., description="Calories per 100g or 100ml of the ingredient"
    )
    macros_per_100g_or_ml: Macros = Field(
        ..., description="Macronutrients per 100g or 100ml of the ingredient"
    )
    tags: list[DietTagEnum] = Field(
        ..., description="Tags associated with the ingredient"
    )

    model_config = {"extra": "forbid", "from_attributes": True}


class IngredientsListSchema(BaseModel):
    """Schema for ingredient list responses."""

    ingredients: list[IngredientResponseSchema] = Field(
        ..., description="list of ingredients"
    )
    total: int = Field(..., description="Total number of ingredients")
    skip: int = Field(..., description="Number of ingredients skipped")
    limit: int = Field(..., description="Maximum number of ingredients returned")

    model_config = {"extra": "forbid"}


# Ingredient Quantity Schemas
class IngredientQuantityCreateSchema(BaseModel):
    """Schema for creating ingredient quantity."""

    ingredient_id: uuid.UUID = Field(..., description="ID of the ingredient")
    quantity: float = Field(..., ge=0, description="The amount of the ingredient")
    unit: UnitEnum = Field(..., description="The unit of measurement for the quantity")

    model_config = {"extra": "forbid"}


class IngredientQuantityResponseSchema(BaseModel):
    """Schema for ingredient quantity responses."""

    ingredient: IngredientResponseSchema = Field(
        ..., description="The ingredient itself"
    )
    quantity: float = Field(..., description="The amount of the ingredient")
    unit: UnitEnum = Field(..., description="The unit of measurement for the quantity")

    model_config = {"extra": "forbid", "from_attributes": True}


# Product Schemas
class ProductCreateSchema(BaseModel):
    """Schema for creating a new product."""

    name: str = Field(
        ..., min_length=1, max_length=150, description="Name of the product"
    )
    brand: None | str = Field(
        default=None, max_length=100, description="Brand name of the product"
    )
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the product's photo"
    )
    shop: None | str = Field(
        default=None, max_length=100, description="Shop where the product was bought"
    )
    barcode: None | str = Field(
        default=None,
        max_length=50,
        description="Barcode of the product (e.g., EAN, UPC)",
    )
    calories_per_100g_or_ml: None | float = Field(
        default=None, ge=0, description="Calories per 100g or 100ml"
    )
    macros_per_100g_or_ml: None | Macros = Field(
        default=None, description="Macronutrients per 100g or 100ml"
    )
    package_size_g_or_ml: None | float = Field(
        default=None,
        ge=0,
        description="Total size of the package in grams or milliliters",
    )
    ingredients: None | list[IngredientQuantityCreateSchema] = Field(
        default=None,
        description="list of ingredients and their quantities in this product",
    )
    tags: list[DietTagEnum] = Field(
        default_factory=list,
        description="Tags associated with the product",
    )

    model_config = {"extra": "forbid"}


class ProductUpdateSchema(BaseModel):
    """Schema for updating an existing product."""

    name: None | str = Field(
        default=None, min_length=1, max_length=150, description="Name of the product"
    )
    brand: None | str = Field(
        default=None, max_length=100, description="Brand name of the product"
    )
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the product's photo"
    )
    shop: None | str = Field(
        default=None, max_length=100, description="Shop where the product was bought"
    )
    barcode: None | str = Field(
        default=None,
        max_length=50,
        description="Barcode of the product (e.g., EAN, UPC)",
    )
    calories_per_100g_or_ml: None | float = Field(
        default=None, ge=0, description="Calories per 100g or 100ml"
    )
    macros_per_100g_or_ml: None | Macros = Field(
        default=None, description="Macronutrients per 100g or 100ml"
    )
    package_size_g_or_ml: None | float = Field(
        default=None,
        ge=0,
        description="Total size of the package in grams or milliliters",
    )
    ingredients: None | list[IngredientQuantityCreateSchema] = Field(
        default=None,
        description="list of ingredients and their quantities in this product",
    )
    tags: None | list[DietTagEnum] = Field(
        default=None,
        description="Tags associated with the product",
    )

    model_config = {"extra": "forbid"}


class ProductResponseSchema(BaseModel):
    """Schema for product API responses."""

    id: uuid.UUID = Field(..., description="Unique identifier for the product")
    name: str = Field(..., description="Name of the product")
    brand: None | str = Field(default=None, description="Brand name of the product")
    photo_data: None | bytes = Field(
        default=None, description="Binary data of the product's photo"
    )
    shop: None | str = Field(
        default=None, description="Shop where the product was bought"
    )
    barcode: None | str = Field(default=None, description="Barcode of the product")
    calories_per_100g_or_ml: None | float = Field(
        default=None, description="Calories per 100g or 100ml"
    )
    macros_per_100g_or_ml: None | Macros = Field(
        default=None, description="Macronutrients per 100g or 100ml"
    )
    package_size_g_or_ml: None | float = Field(
        default=None, description="Total size of the package in grams or milliliters"
    )
    ingredients: None | list[IngredientQuantityResponseSchema] = Field(
        default=None,
        description="list of ingredients and their quantities in this product",
    )
    tags: list[DietTagEnum] = Field(..., description="Tags associated with the product")

    model_config = {"extra": "forbid", "from_attributes": True}


class ProductsListSchema(BaseModel):
    """Schema for product list responses."""

    products: list[ProductResponseSchema] = Field(..., description="list of products")
    total: int = Field(..., description="Total number of products")
    skip: int = Field(..., description="Number of products skipped")
    limit: int = Field(..., description="Maximum number of products returned")

    model_config = {"extra": "forbid"}


# Search Schemas
class IngredientSearchSchema(BaseModel):
    """Schema for ingredient search parameters."""

    name_filter: None | str = Field(
        default=None, description="Filter ingredients by name"
    )
    shop_filter: None | str = Field(
        default=None, description="Filter ingredients by shop"
    )
    tag_filter: None | list[DietTagEnum] = Field(
        default=None, description="Filter ingredients by tags"
    )
    skip: int = Field(default=0, ge=0, description="Number of ingredients to skip")
    limit: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="Maximum number of ingredients to return",
    )

    model_config = {"extra": "forbid"}


class ProductSearchSchema(BaseModel):
    """Schema for product search parameters."""

    name_filter: None | str = Field(default=None, description="Filter products by name")
    brand_filter: None | str = Field(
        default=None, description="Filter products by brand"
    )
    shop_filter: None | str = Field(default=None, description="Filter products by shop")
    tag_filter: None | list[DietTagEnum] = Field(
        default=None, description="Filter products by tags"
    )
    skip: int = Field(default=0, ge=0, description="Number of products to skip")
    limit: int = Field(
        default=100, ge=1, le=1000, description="Maximum number of products to return"
    )

    model_config = {"extra": "forbid"}


# Error response schemas
class ErrorResponseSchema(BaseModel):
    """Schema for error responses."""

    detail: str = Field(..., description="Error message")
    error_type: str = Field(..., description="Type of error")

    model_config = {"extra": "forbid"}


class ValidationErrorResponseSchema(BaseModel):
    """Schema for validation error responses."""

    detail: list[dict] = Field(..., description="list of validation errors")

    model_config = {"extra": "forbid"}
