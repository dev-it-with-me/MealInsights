"""
Pydantic schemas for diet planning API request/response validation.
"""

from pydantic import BaseModel, Field, field_validator
import uuid
from datetime import date, time


class MealAssignmentSchema(BaseModel):
    """Schema for meal assignment in requests/responses."""

    meal_id: uuid.UUID = Field(..., description="ID of the meal to assign")
    plan_date: date = Field(..., description="Date when the meal is planned")
    meal_type: str = Field(
        ..., description="Time category for the meal (breakfast, lunch, dinner, snack)"
    )
    specific_time: time | None = Field(
        default=None, description="Specific time for the meal (optional)"
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
        description="Optional notes about the meal assignment",
    )

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, v: str) -> str:
        allowed_types = ["breakfast", "lunch", "dinner", "snack"]
        if v.lower() not in allowed_types:
            raise ValueError(f"meal_type must be one of: {', '.join(allowed_types)}")
        return v.lower()

    model_config = {"extra": "forbid"}


class MealAssignmentResponseSchema(BaseModel):
    """Schema for meal assignment response."""

    id: uuid.UUID
    meal_id: uuid.UUID
    meal_name: str
    plan_date: date
    meal_type: str
    specific_time: time | None
    calories: float | None
    notes: str | None

    model_config = {"extra": "forbid", "from_attributes": True}


class UpdateMealAssignmentSchema(BaseModel):
    """Schema for updating meal assignment."""

    meal_id: uuid.UUID | None = None
    plan_date: date | None = None
    meal_type: str | None = None
    specific_time: time | None = None
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed_types = ["breakfast", "lunch", "dinner", "snack"]
        if v.lower() not in allowed_types:
            raise ValueError(f"meal_type must be one of: {', '.join(allowed_types)}")
        return v.lower()

    model_config = {"extra": "forbid"}


class DayPlanResponseSchema(BaseModel):
    """Schema for day plan response."""

    plan_date: date
    meal_assignments: list[MealAssignmentResponseSchema]
    total_calories: float
    total_macros: dict | None  # Simplified macros representation

    model_config = {"extra": "forbid", "from_attributes": True}


class DateRangeRequestSchema(BaseModel):
    """Schema for date range requests."""

    start_date: date = Field(..., description="Start date of the range")
    end_date: date = Field(..., description="End date of the range")

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date, info) -> date:
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("end_date must be greater than or equal to start_date")
        return v

    model_config = {"extra": "forbid"}
