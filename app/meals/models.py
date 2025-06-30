"""
Models for meals and their components.
"""

from pydantic import BaseModel, Field
import uuid
from app.models import Macros
from app.enums import DietTagEnum, UnitEnum


class MealIngredient(BaseModel):
    """Represents an ingredient/product with quantity used in a meal."""

    item_id: uuid.UUID = Field(..., description="ID of the ingredient or product")
    item_type: str = Field(..., description="Type of item: 'ingredient' or 'product'")
    item_name: str = Field(
        ..., description="Name of the ingredient or product (for reference)"
    )
    quantity: float = Field(
        ..., gt=0, description="Quantity of the ingredient/product used"
    )
    unit: UnitEnum = Field(..., description="Unit of measurement for the quantity")

    model_config = {"extra": "forbid", "from_attributes": True}


class IngredientEquivalent(BaseModel):
    """Represents an equivalent ingredient/product for a meal ingredient."""

    original_item_id: uuid.UUID = Field(
        ..., description="ID of the original ingredient/product in the meal"
    )
    equivalent_item_id: uuid.UUID = Field(
        ..., description="ID of the equivalent ingredient/product"
    )
    equivalent_item_type: str = Field(
        ..., description="Type of equivalent item: 'ingredient' or 'product'"
    )
    equivalent_item_name: str = Field(
        ..., description="Name of the equivalent ingredient/product (for reference)"
    )
    conversion_ratio: float = Field(
        default=1.0,
        gt=0,
        description="Ratio for converting quantities (equivalent = original * ratio)",
    )

    model_config = {"extra": "forbid", "from_attributes": True}


class Meal(BaseModel):
    """Core model representing a meal with its composition and nutritional information."""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique identifier for the meal"
    )
    name: str = Field(..., min_length=1, max_length=150, description="Name of the meal")
    photo_data: bytes | None = Field(
        default=None, description="Binary data of the meal's photo"
    )
    recipe: str | None = Field(
        default=None, description="Recipe instructions for preparing the meal"
    )

    # Meal composition
    ingredients: list[MealIngredient] = Field(
        default_factory=list, description="List of ingredients/products with quantities"
    )
    equivalents: list[IngredientEquivalent] = Field(
        default_factory=list, description="List of equivalent ingredients/products"
    )

    # Nutritional information (can be calculated or manually overridden)
    calories_total: float | None = Field(
        default=None, ge=0, description="Total calories for the meal"
    )
    macros_total: Macros | None = Field(
        default=None, description="Total macronutrients for the meal"
    )
    is_nutrition_calculated: bool = Field(
        default=False,
        description="Whether nutrition values are auto-calculated from ingredients",
    )

    # Categorization
    tags: list[DietTagEnum] = Field(
        default_factory=list, description="Tags associated with the meal"
    )

    model_config = {"extra": "forbid", "from_attributes": True}
