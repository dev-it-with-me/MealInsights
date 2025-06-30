"""
Dependency injection providers for the meals module.
"""

from fastapi import Depends
from sqlalchemy.orm import Session
from app.config import get_db_session
from app.ingredients_and_products.repositories import (
    IngredientRepository,
    ProductRepository,
)
from .repositories import MealRepository
from .services import MealService


def get_meal_repository(session: Session = Depends(get_db_session)) -> MealRepository:
    """Get a MealRepository instance."""
    return MealRepository(session)


def get_meal_service(session: Session = Depends(get_db_session)) -> MealService:
    """
    Get a MealService instance.

    Args:
        session: Database session

    Returns:
        MealService: Service instance for meal operations
    """
    meal_repository = MealRepository(session)
    ingredient_repository = IngredientRepository(session)
    product_repository = ProductRepository(session)

    return MealService(
        meal_repository=meal_repository,
        ingredient_repository=ingredient_repository,
        product_repository=product_repository,
    )
