"""
Dependency injection providers for the meals module.
"""

from sqlalchemy.orm import Session
from app.ingredients_and_products.repositories import (
    IngredientRepository,
    ProductRepository,
)
from .repositories import MealRepository
from .services import MealService


def get_meal_service(session: Session) -> MealService:
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
