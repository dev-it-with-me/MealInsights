"""
Dependency injection providers for ingredients and products module.
Provides service instances and other dependencies for route handlers.
"""

from sqlalchemy.orm import Session

from .services import IngredientService, ProductService


def get_ingredient_service(session: Session) -> IngredientService:
    """
    Get an IngredientService instance.

    Args:
        session: Database session

    Returns:
        IngredientService: Service instance for ingredient operations
    """
    return IngredientService(session)


def get_product_service(session: Session) -> ProductService:
    """
    Get a ProductService instance.

    Args:
        session: Database session

    Returns:
        ProductService: Service instance for product operations
    """
    return ProductService(session)
