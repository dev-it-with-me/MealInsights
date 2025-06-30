"""
Diet planning API routes for meal assignments and plan management.
"""

from datetime import date
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.diet_planning.dependencies import get_diet_planning_service
from app.diet_planning.exceptions import (
    MealAssignmentNotFoundError,
    MealAssignmentValidationError,
)
from app.diet_planning.schemas import (
    MealAssignmentSchema,
    MealAssignmentResponseSchema,
    UpdateMealAssignmentSchema,
    DayPlanResponseSchema,
    DateRangeRequestSchema,
)
from app.diet_planning.services import DietPlanningService

router = APIRouter()


@router.post(
    "/assignments", response_model=MealAssignmentResponseSchema, status_code=201
)
async def create_meal_assignment(
    assignment_data: MealAssignmentSchema,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Create a new meal assignment for a specific date and meal type."""
    try:
        assignment = await service.create_meal_assignment(assignment_data)
        return assignment
    except MealAssignmentValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create meal assignment: {str(e)}"
        )


@router.get("/assignments/{assignment_id}", response_model=MealAssignmentResponseSchema)
async def get_meal_assignment(
    assignment_id: UUID,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get a specific meal assignment by ID."""
    try:
        assignment = await service.get_meal_assignment_by_id(assignment_id)
        return assignment
    except MealAssignmentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve meal assignment: {str(e)}"
        )


@router.put("/assignments/{assignment_id}", response_model=MealAssignmentResponseSchema)
async def update_meal_assignment(
    assignment_id: UUID,
    assignment_data: UpdateMealAssignmentSchema,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Update an existing meal assignment."""
    try:
        assignment = await service.update_meal_assignment(
            assignment_id, assignment_data
        )
        return assignment
    except MealAssignmentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except MealAssignmentValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update meal assignment: {str(e)}"
        )


@router.delete("/assignments/{assignment_id}", status_code=204)
async def delete_meal_assignment(
    assignment_id: UUID,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> None:
    """Delete a meal assignment."""
    try:
        await service.delete_meal_assignment(assignment_id)
    except MealAssignmentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete meal assignment: {str(e)}"
        )


@router.get("/assignments", response_model=list[MealAssignmentResponseSchema])
async def get_meal_assignments(
    start_date: date = Query(..., description="Start date for filtering assignments"),
    end_date: date = Query(..., description="End date for filtering assignments"),
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get meal assignments within a date range."""
    try:
        date_range = DateRangeRequestSchema(start_date=start_date, end_date=end_date)
        assignments = await service.get_meal_assignments_for_date_range(date_range)
        return assignments
    except MealAssignmentValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve meal assignments: {str(e)}"
        )


@router.get("/plans/day/{plan_date}", response_model=DayPlanResponseSchema)
async def get_day_plan(
    plan_date: date,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get the complete meal plan for a specific day."""
    try:
        day_plan = await service.get_day_plan(plan_date)
        return day_plan
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve day plan: {str(e)}"
        )


@router.get("/plans/week", response_model=dict)
async def get_week_plan(
    start_date: date = Query(..., description="Start date of the week"),
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get the complete meal plan for a week starting from the specified date."""
    try:
        week_plan = await service.get_week_plan(start_date)
        return week_plan
    except MealAssignmentValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve week plan: {str(e)}"
        )


@router.get(
    "/assignments/day/{plan_date}", response_model=list[MealAssignmentResponseSchema]
)
async def get_assignments_for_day(
    plan_date: date,
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get all meal assignments for a specific day."""
    try:
        day_plan = await service.get_day_plan(plan_date)
        return day_plan.meal_assignments if day_plan.meal_assignments else []
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve assignments for day: {str(e)}"
        )


@router.get("/calories/range", response_model=dict)
async def get_daily_calories_for_range(
    start_date: date = Query(..., description="Start date for calorie calculation"),
    end_date: date = Query(..., description="End date for calorie calculation"),
    service: DietPlanningService = Depends(get_diet_planning_service),
) -> Any:
    """Get daily calorie totals for a date range."""
    try:
        date_range = DateRangeRequestSchema(start_date=start_date, end_date=end_date)
        calories_data = await service.get_daily_calories_for_range(date_range)
        return calories_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve daily calories: {str(e)}"
        )
