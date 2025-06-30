"""
Models for diet planning and meal assignments.
"""

from pydantic import BaseModel, Field
import uuid
from datetime import date, time
from app.models import Macros


class MealAssignment(BaseModel):
    """Represents a meal assigned to a specific date and time."""

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        description="Unique identifier for the meal assignment",
    )
    meal_id: uuid.UUID = Field(..., description="ID of the assigned meal")
    meal_name: str = Field(..., description="Name of the assigned meal (for reference)")
    assignment_date: date = Field(..., description="Date when the meal is planned")
    meal_time: str = Field(
        ..., description="Time category for the meal (breakfast, lunch, dinner, snack)"
    )
    specific_time: time | None = Field(
        default=None, description="Specific time for the meal (optional)"
    )
    calories: float | None = Field(
        default=None, ge=0, description="Calories for this meal"
    )
    notes: str | None = Field(
        default=None, description="Optional notes about the meal assignment"
    )

    model_config = {"extra": "forbid", "from_attributes": True}


class DayPlan(BaseModel):
    """Represents all meal assignments for a specific day."""

    plan_date: date = Field(..., description="Date of the meal plan")
    meal_assignments: list[MealAssignment] = Field(
        default_factory=list, description="List of meals assigned to this day"
    )
    total_calories: float = Field(
        default=0, ge=0, description="Total calories for the day"
    )
    total_macros: Macros | None = Field(
        default=None, description="Total macronutrients for the day"
    )

    model_config = {"extra": "forbid", "from_attributes": True}


class WeekPlan(BaseModel):
    """Represents meal plans for a week."""

    start_date: date = Field(..., description="Start date of the week")
    end_date: date = Field(..., description="End date of the week")
    daily_plans: list[DayPlan] = Field(
        default_factory=list, description="Daily meal plans for the week"
    )
    total_weekly_calories: float = Field(
        default=0, ge=0, description="Total calories for the week"
    )

    model_config = {"extra": "forbid", "from_attributes": True}
