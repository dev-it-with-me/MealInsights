"""
Dependency injection providers for ingredients and products module.
Provides service instances and other dependencies for route handlers.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from .services import IngredientService, ProductService
from app.config import get_db_session


def get_ingredient_service(
    session: Session = Depends(get_db_session),
) -> IngredientService:
    """
    Get an IngredientService instance.

    Args:
        session: Database session

    Returns:
        IngredientService: Service instance for ingredient operations
    """
    return IngredientService(session)


def get_product_service(session: Session = Depends(get_db_session)) -> ProductService:
    """
    Get a ProductService instance.

    Args:
        session: Database session

    Returns:
        ProductService: Service instance for product operations
    """
    return ProductService(session)
