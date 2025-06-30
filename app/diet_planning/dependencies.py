"""
Dependency injection for diet planning module.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import get_db_session
from app.diet_planning.repositories import DietPlanningRepository
from app.diet_planning.services import DietPlanningService
from app.meals.dependencies import get_meal_repository
from app.meals.repositories import MealRepository


def get_diet_planning_repository(
    session: Session = Depends(get_db_session),
) -> DietPlanningRepository:
    """Get diet planning repository instance."""
    return DietPlanningRepository(session)


def get_diet_planning_service(
    repository: DietPlanningRepository = Depends(get_diet_planning_repository),
    meal_repository: MealRepository = Depends(get_meal_repository),
) -> DietPlanningService:
    """Get diet planning service instance."""
    return DietPlanningService(repository, meal_repository)
