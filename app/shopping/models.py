"""Shopping list data models."""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import date
import uuid


class ShoppingListItem(BaseModel):
    """Represents a single item in the shopping list."""

    ingredient_id: uuid.UUID = Field(..., description="ID of the ingredient")
    ingredient_name: str = Field(..., description="Name of the ingredient")
    total_quantity: str = Field(..., description="Total quantity needed (aggregated)")
    unit: str = Field(..., description="Unit of measurement")
    category: Optional[str] = Field(None, description="Ingredient category")
    estimated_cost: Optional[float] = Field(
        None, description="Estimated cost for this item"
    )
    notes: str = Field(default="", description="Additional notes")
    shop_suggestion: Optional[str] = Field(
        None, description="Suggested shop for purchase"
    )
    planned_meals: list[str] = Field(
        default_factory=list, description="List of meals using this ingredient"
    )
    planned_dates: list[str] = Field(
        default_factory=list,
        description="List of dates when this ingredient is needed (ISO format)",
    )

    model_config = {"from_attributes": True}


class ShoppingSummary(BaseModel):
    """Summary information for a shopping list."""

    total_items: int = Field(..., description="Total number of unique ingredients")
    total_estimated_cost: Optional[float] = Field(
        None, description="Total estimated cost"
    )
    categories: list[str] = Field(
        default_factory=list, description="List of ingredient categories"
    )
    date_range_start: date = Field(..., description="Start date of the period")
    date_range_end: date = Field(..., description="End date of the period")

    model_config = {"from_attributes": True}


class ShoppingList(BaseModel):
    """Complete shopping list for a date range."""

    start_date: date = Field(..., description="Start date of the meal plan period")
    end_date: date = Field(..., description="End date of the meal plan period")
    items: list[ShoppingListItem] = Field(
        default_factory=list, description="List of shopping items"
    )
    total_items: int = Field(..., description="Total number of unique ingredients")
    generated_at: str = Field(
        ..., description="ISO timestamp when the list was generated"
    )

    model_config = {"from_attributes": True}
