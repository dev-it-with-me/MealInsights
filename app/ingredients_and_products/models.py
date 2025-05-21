"""
This module contains the models for the ingredients and products.
"""

from pydantic import BaseModel, Field
import uuid
from app.models import Macros
from app.enums import DietTagEnum, UnitEnum  # Re-added UnitEnum


class Ingredient(BaseModel):
    """Core model representing an ingredient."""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique identifier for the ingredient"
    )
    name: str = Field(
        ..., min_length=1, max_length=100, description="Name of the ingredient"
    )
    photo_data: bytes | None = Field(
        default=None, description="Binary data of the ingredient's photo"
    )  # Changed from photo_url: HttpUrl | None
    shop: str | None = Field(
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
        description="Tags associated with the ingredient, using DietTagEnum",
    )

    model_config = {"extra": "forbid", "from_attributes": True}


class IngredientQuantity(BaseModel):
    """Represents a specific quantity of a given ingredient."""
    ingredient: Ingredient = Field(..., description="The ingredient itself")
    quantity: float = Field(..., ge=0, description="The amount of the ingredient")
    unit: UnitEnum = Field(..., description="The unit of measurement for the quantity")

    model_config = {
        "extra": "forbid",
        "from_attributes": True
    }


class Product(BaseModel):
    """Core model representing a product (e.g., a packaged item from a shop)."""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique identifier for the product"
    )
    name: str = Field(
        ..., min_length=1, max_length=150, description="Name of the product"
    )
    brand: str | None = Field(
        default=None, max_length=100, description="Brand name of the product"
    )
    photo_data: bytes | None = Field(
        default=None, description="Binary data of the product's photo"
    )  # Changed from photo_url: HttpUrl | None
    shop: str | None = Field(
        default=None, max_length=100, description="Shop where the product was bought"
    )
    barcode: str | None = Field(
        default=None,
        max_length=50,
        description="Barcode of the product (e.g., EAN, UPC)",
    )

    # Nutritional information can be per 100g/ml or per serving/package
    calories_per_100g_or_ml: float | None = Field(
        default=None, ge=0, description="Calories per 100g or 100ml"
    )
    macros_per_100g_or_ml: Macros | None = Field(
        default=None, description="Macronutrients per 100g or 100ml"
    )

    package_size_g_or_ml: float | None = Field(
        default=None,
        ge=0,
        description="Total size of the package in grams or milliliters",
    )

    # If the product's composition is known in terms of ingredients
    ingredients: list[IngredientQuantity] | None = Field(
        default=None,
        description="List of ingredients and their quantities in this product",
    )
    # For now, keeping it simple. Ingredient composition can be a future enhancement.

    tags: list[DietTagEnum] = Field(
        default_factory=list,
        description="Tags associated with the product, using DietTagEnum",
    )

    model_config = {"extra": "forbid", "from_attributes": True}
