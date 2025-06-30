"""
Pydantic schemas for meal API request/response validation.
"""

from pydantic import BaseModel, Field, field_validator
import uuid
from app.enums import DietTagEnum, UnitEnum
from app.models import Macros


class MealIngredientSchema(BaseModel):
    """Schema for meal ingredient in requests/responses."""

    item_id: uuid.UUID
    item_type: str
    item_name: str
    quantity: float = Field(..., gt=0)
    unit: UnitEnum

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, v: str) -> str:
        if v not in ["ingredient", "product"]:
            raise ValueError('item_type must be either "ingredient" or "product"')
        return v

    model_config = {"extra": "forbid"}


class IngredientEquivalentSchema(BaseModel):
    """Schema for ingredient equivalent in requests/responses."""

    original_item_id: uuid.UUID
    equivalent_item_id: uuid.UUID
    equivalent_item_type: str
    equivalent_item_name: str
    conversion_ratio: float = Field(default=1.0, gt=0)

    @field_validator("equivalent_item_type")
    @classmethod
    def validate_equivalent_item_type(cls, v: str) -> str:
        if v not in ["ingredient", "product"]:
            raise ValueError(
                'equivalent_item_type must be either "ingredient" or "product"'
            )
        return v

    model_config = {"extra": "forbid"}


class CreateMealSchema(BaseModel):
    """Schema for creating a new meal."""

    name: str = Field(..., min_length=1, max_length=150)
    photo_data: bytes | None = None
    recipe: str | None = None
    ingredients: list[MealIngredientSchema] = Field(default_factory=list)
    equivalents: list[IngredientEquivalentSchema] = Field(default_factory=list)
    calories_total: float | None = Field(default=None, ge=0)
    macros_total: Macros | None = None
    is_nutrition_calculated: bool = False
    tags: list[DietTagEnum] = Field(default_factory=list)

    model_config = {"extra": "forbid"}


class UpdateMealSchema(BaseModel):
    """Schema for updating an existing meal."""

    name: str | None = Field(default=None, min_length=1, max_length=150)
    photo_data: bytes | None = None
    recipe: str | None = None
    ingredients: list[MealIngredientSchema] | None = None
    equivalents: list[IngredientEquivalentSchema] | None = None
    calories_total: float | None = Field(default=None, ge=0)
    macros_total: Macros | None = None
    is_nutrition_calculated: bool | None = None
    tags: list[DietTagEnum] | None = None

    model_config = {"extra": "forbid"}


class MealResponseSchema(BaseModel):
    """Schema for meal responses."""

    id: uuid.UUID
    name: str
    photo_data: bytes | None
    recipe: str | None
    ingredients: list[MealIngredientSchema]
    equivalents: list[IngredientEquivalentSchema]
    calories_total: float | None
    macros_total: Macros | None
    is_nutrition_calculated: bool
    tags: list[DietTagEnum]

    model_config = {"extra": "forbid", "from_attributes": True}


class MealListResponseSchema(BaseModel):
    """Schema for meal list responses (simplified for listing)."""

    id: uuid.UUID
    name: str
    photo_data: bytes | None
    calories_total: float | None
    tags: list[DietTagEnum]
    ingredient_count: int = Field(..., description="Number of ingredients in the meal")

    model_config = {"extra": "forbid"}
