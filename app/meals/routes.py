"""
API routes for meals management.
"""

from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.config import get_db_session
from .dependencies import get_meal_service
from .schemas import (
    CreateMealSchema,
    UpdateMealSchema,
    MealResponseSchema,
    MealListResponseSchema,
)
from .exceptions import MealNotFoundError, MealValidationError

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("/", response_model=MealResponseSchema)
async def create_meal(
    meal_data: CreateMealSchema, db: Session = Depends(get_db_session)
) -> MealResponseSchema:
    """Create a new meal."""
    try:
        meal_service = get_meal_service(db)
        return await meal_service.create_meal(meal_data)
    except MealValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meal: {str(e)}")


@router.get("/", response_model=List[MealListResponseSchema])
async def get_all_meals(
    skip: int = Query(0, ge=0, description="Number of meals to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of meals to return"
    ),
    db: Session = Depends(get_db_session),
) -> List[MealListResponseSchema]:
    """Get all meals with pagination."""
    try:
        meal_service = get_meal_service(db)
        return await meal_service.get_all_meals(skip, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meals: {str(e)}")


@router.get("/search", response_model=List[MealListResponseSchema])
async def search_meals(
    q: str = Query(..., min_length=1, description="Search query for meal names"),
    skip: int = Query(0, ge=0, description="Number of meals to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of meals to return"
    ),
    db: Session = Depends(get_db_session),
) -> List[MealListResponseSchema]:
    """Search meals by name."""
    try:
        meal_service = get_meal_service(db)
        return await meal_service.search_meals(q, skip, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search meals: {str(e)}")


@router.get("/{meal_id}", response_model=MealResponseSchema)
async def get_meal(
    meal_id: uuid.UUID, db: Session = Depends(get_db_session)
) -> MealResponseSchema:
    """Get a meal by ID."""
    try:
        meal_service = get_meal_service(db)
        return await meal_service.get_meal(meal_id)
    except MealNotFoundError:
        raise HTTPException(status_code=404, detail="Meal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meal: {str(e)}")


@router.put("/{meal_id}", response_model=MealResponseSchema)
async def update_meal(
    meal_id: uuid.UUID,
    meal_data: UpdateMealSchema,
    db: Session = Depends(get_db_session),
) -> MealResponseSchema:
    """Update an existing meal."""
    try:
        meal_service = get_meal_service(db)
        return await meal_service.update_meal(meal_id, meal_data)
    except MealNotFoundError:
        raise HTTPException(status_code=404, detail="Meal not found")
    except MealValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update meal: {str(e)}")


@router.delete("/{meal_id}")
async def delete_meal(
    meal_id: uuid.UUID, db: Session = Depends(get_db_session)
) -> dict[str, str]:
    """Delete a meal."""
    try:
        meal_service = get_meal_service(db)
        await meal_service.delete_meal(meal_id)
        return {"message": "Meal deleted successfully"}
    except MealNotFoundError:
        raise HTTPException(status_code=404, detail="Meal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete meal: {str(e)}")
