"""FastAPI routes for shopping list management."""

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..config import get_db_session
from .services import ShoppingService
from .repositories import ShoppingRepository
from .schemas import ShoppingListGenerateRequest, ShoppingListResponse
from .enums import ShoppingListSortBy
from .exceptions import (
    ShoppingListGenerationError,
    NoMealPlansFoundError,
    EmptyShoppingListError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/shopping", tags=["shopping"])


def get_shopping_service(
    db_session: Session = Depends(get_db_session),
) -> ShoppingService:
    """Dependency to get shopping service instance."""
    repository = ShoppingRepository(db_session)
    return ShoppingService(repository)


@router.post("/generate", response_model=ShoppingListResponse)
async def generate_shopping_list(
    request: ShoppingListGenerateRequest,
    service: ShoppingService = Depends(get_shopping_service),
) -> ShoppingListResponse:
    """Generate shopping list for the specified date range.

    Args:
        request: Shopping list generation parameters
        service: Shopping service dependency

    Returns:
        Complete shopping list with items and summary

    Raises:
        HTTPException: If shopping list generation fails
    """
    try:
        logger.info(
            f"Generating shopping list for {request.start_date} to {request.end_date}"
        )

        shopping_list = await service.generate_shopping_list(request)

        logger.info(
            f"Successfully generated shopping list with {len(shopping_list.items)} items"
        )
        return shopping_list

    except NoMealPlansFoundError as e:
        logger.warning(f"No meal plans found: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except EmptyShoppingListError as e:
        logger.warning(f"Empty shopping list: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except ShoppingListGenerationError as e:
        logger.error(f"Shopping list generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error generating shopping list: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate shopping list")


@router.get("/generate", response_model=ShoppingListResponse)
async def generate_shopping_list_get(
    start_date: date,
    end_date: date,
    exclude_meal_types: Optional[str] = Query(
        None, description="Comma-separated meal types to exclude"
    ),
    sort_by: Optional[ShoppingListSortBy] = Query(
        ShoppingListSortBy.INGREDIENT_NAME, description="Sort order"
    ),
    service: ShoppingService = Depends(get_shopping_service),
) -> ShoppingListResponse:
    """Generate shopping list using GET request with query parameters.

    Args:
        start_date: Start date of the meal plan period
        end_date: End date of the meal plan period
        exclude_meal_types: Comma-separated meal types to exclude
        sort_by: Sort order for shopping list items
        service: Shopping service dependency

    Returns:
        Complete shopping list with items and summary
    """
    try:
        # Parse exclude_meal_types if provided
        exclude_list = None
        if exclude_meal_types:
            exclude_list = [
                meal_type.strip() for meal_type in exclude_meal_types.split(",")
            ]

        # Create request object
        request = ShoppingListGenerateRequest(
            start_date=start_date,
            end_date=end_date,
            exclude_meal_types=exclude_list,
            sort_by=sort_by,
        )

        return await generate_shopping_list(request, service)

    except Exception as e:
        logger.error(f"Error in GET shopping list generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate shopping list")


@router.get("/preview")
async def get_shopping_list_preview(
    start_date: date,
    end_date: date,
    service: ShoppingService = Depends(get_shopping_service),
) -> dict:
    """Get a preview of meals that would be included in the shopping list.

    Args:
        start_date: Start date of the meal plan period
        end_date: End date of the meal plan period
        service: Shopping service dependency

    Returns:
        Preview data showing meal assignments for the date range
    """
    try:
        logger.info(f"Getting shopping list preview for {start_date} to {end_date}")

        preview = await service.get_shopping_list_preview(start_date, end_date)

        logger.info(f"Successfully generated preview for {preview['total_days']} days")
        return preview

    except ShoppingListGenerationError as e:
        logger.error(f"Preview generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error generating preview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate preview")


@router.post("/export/text", response_class=PlainTextResponse)
async def export_shopping_list_text(
    request: ShoppingListGenerateRequest,
    service: ShoppingService = Depends(get_shopping_service),
) -> str:
    """Export shopping list as formatted text.

    Args:
        request: Shopping list generation parameters
        service: Shopping service dependency

    Returns:
        Plain text formatted shopping list
    """
    try:
        logger.info(
            f"Exporting shopping list as text for {request.start_date} to {request.end_date}"
        )

        # Generate the shopping list
        shopping_list = await service.generate_shopping_list(request)

        # Export as text
        text_output = service.export_shopping_list_text(shopping_list)

        logger.info("Successfully exported shopping list as text")
        return text_output

    except (NoMealPlansFoundError, EmptyShoppingListError) as e:
        logger.warning(f"No data for export: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except ShoppingListGenerationError as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error exporting shopping list: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export shopping list")


@router.get("/export/text", response_class=PlainTextResponse)
async def export_shopping_list_text_get(
    start_date: date,
    end_date: date,
    exclude_meal_types: Optional[str] = Query(
        None, description="Comma-separated meal types to exclude"
    ),
    sort_by: Optional[ShoppingListSortBy] = Query(
        ShoppingListSortBy.INGREDIENT_NAME, description="Sort order"
    ),
    service: ShoppingService = Depends(get_shopping_service),
) -> str:
    """Export shopping list as formatted text using GET request.

    Args:
        start_date: Start date of the meal plan period
        end_date: End date of the meal plan period
        exclude_meal_types: Comma-separated meal types to exclude
        sort_by: Sort order for shopping list items
        service: Shopping service dependency

    Returns:
        Plain text formatted shopping list
    """
    try:
        # Parse exclude_meal_types if provided
        exclude_list = None
        if exclude_meal_types:
            exclude_list = [
                meal_type.strip() for meal_type in exclude_meal_types.split(",")
            ]

        # Create request object
        request = ShoppingListGenerateRequest(
            start_date=start_date,
            end_date=end_date,
            exclude_meal_types=exclude_list,
            sort_by=sort_by,
        )

        return await export_shopping_list_text(request, service)

    except Exception as e:
        logger.error(f"Error in GET shopping list export: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export shopping list")
