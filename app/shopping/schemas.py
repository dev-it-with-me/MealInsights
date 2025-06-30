"""Request and response schemas for shopping list API."""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import date

from .enums import ShoppingListSortBy
from .models import ShoppingListItem, ShoppingSummary


class ShoppingListGenerateRequest(BaseModel):
    """Request schema for generating a shopping list."""
    
    start_date: date = Field(..., description="Start date of the meal plan period")
    end_date: date = Field(..., description="End date of the meal plan period")
    exclude_meal_types: Optional[list[str]] = Field(
        default=None,
        description="Meal types to exclude from the shopping list"
    )
    sort_by: Optional[ShoppingListSortBy] = Field(
        default=ShoppingListSortBy.INGREDIENT_NAME,
        description="Sort order for the shopping list items"
    )
    
    model_config = {"from_attributes": True}


class ShoppingListResponse(BaseModel):
    """Response schema for the complete shopping list."""
    
    items: list[ShoppingListItem] = Field(default_factory=list, description="List of shopping items")
    summary: ShoppingSummary = Field(..., description="Summary information")
    generated_at: date = Field(..., description="Date when the list was generated")
    
    model_config = {"from_attributes": True}


class ShoppingListItemResponse(BaseModel):
    """Response schema for a shopping list item."""
    
    ingredient_id: int = Field(..., description="ID of the ingredient")
    ingredient_name: str = Field(..., description="Name of the ingredient")
    total_quantity: str = Field(..., description="Total quantity needed (aggregated)")
    unit: str = Field(..., description="Unit of measurement")
    category: Optional[str] = Field(None, description="Ingredient category")
    estimated_cost: Optional[float] = Field(None, description="Estimated cost for this item")
    notes: str = Field(default="", description="Additional notes")
    shop_suggestion: Optional[str] = Field(None, description="Suggested shop for purchase") 
    planned_meals: list[str] = Field(default_factory=list, description="List of meals using this ingredient")
    planned_dates: list[str] = Field(default_factory=list, description="List of dates when this ingredient is needed (ISO format)")


class ExportShoppingListRequest(BaseModel):
    """Request schema for exporting a shopping list."""
    
    format: str = Field(..., description="Export format (csv, pdf)", pattern="^(csv|pdf)$")
    shopping_list: ShoppingListResponse = Field(..., description="The shopping list to export")
