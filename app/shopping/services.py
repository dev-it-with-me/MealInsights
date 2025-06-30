"""Shopping list services for meal plan aggregation."""

import logging
from datetime import date
from typing import Any

from .exceptions import ShoppingListGenerationError
from .models import ShoppingListItem, ShoppingSummary
from .repositories import ShoppingRepository
from .schemas import ShoppingListGenerateRequest, ShoppingListResponse

logger = logging.getLogger(__name__)


class ShoppingService:
    """Service for shopping list operations."""

    def __init__(self, repository: ShoppingRepository):
        self.repository = repository

    async def generate_shopping_list(
        self, request: ShoppingListGenerateRequest
    ) -> ShoppingListResponse:
        """Generate shopping list for the specified date range."""
        try:
            logger.info(
                f"Generating shopping list for date range: {request.start_date} to {request.end_date}"
            )

            # Get aggregated ingredients from meal assignments
            aggregated_ingredients = await self.repository.get_aggregated_ingredients_for_date_range(
                start_date=request.start_date,
                end_date=request.end_date,
                exclude_meal_types=request.exclude_meal_types or [],
            )

            # Convert to shopping list items
            shopping_items = []
            for ingredient_data in aggregated_ingredients:
                item = ShoppingListItem(
                    ingredient_id=ingredient_data["ingredient_id"],
                    ingredient_name=ingredient_data["ingredient_name"],
                    total_quantity=ingredient_data["total_quantity"],
                    unit=ingredient_data["unit"],
                    category=ingredient_data["category"],
                    estimated_cost=ingredient_data.get("estimated_cost"),
                    notes=ingredient_data.get("notes", ""),
                )
                shopping_items.append(item)

            # Calculate summary
            total_items = len(shopping_items)
            total_cost = sum(
                item.estimated_cost or 0 for item in shopping_items
            )
            categories = list(set(item.category for item in shopping_items if item.category))

            summary = ShoppingSummary(
                total_items=total_items,
                total_estimated_cost=total_cost if total_cost > 0 else None,
                categories=categories,
                date_range_start=request.start_date,
                date_range_end=request.end_date,
            )

            logger.info(
                f"Generated shopping list with {total_items} items, "
                f"estimated cost: ${total_cost:.2f}"
            )

            return ShoppingListResponse(
                items=shopping_items,
                summary=summary,
                generated_at=date.today(),
            )

        except Exception as e:
            logger.error(f"Error generating shopping list: {str(e)}")
            raise ShoppingListGenerationError(
                f"Failed to generate shopping list: {str(e)}"
            ) from e

    async def get_shopping_list_preview(
        self, start_date: date, end_date: date
    ) -> dict[str, Any]:
        """Get a preview of what would be included in the shopping list."""
        try:
            # Get meal assignments for the date range
            meal_assignments = await self.repository.get_meal_assignments_for_date_range(
                start_date=start_date, end_date=end_date
            )

            # Group by date and meal type
            preview_data = {}
            for assignment in meal_assignments:
                date_str = assignment["assignment_date"].isoformat()
                if date_str not in preview_data:
                    preview_data[date_str] = {}

                meal_type = assignment["meal_type"]
                if meal_type not in preview_data[date_str]:
                    preview_data[date_str][meal_type] = []

                preview_data[date_str][meal_type].append({
                    "meal_id": assignment["meal_id"],
                    "meal_name": assignment["meal_name"],
                    "servings": assignment["servings"],
                    "ingredient_count": assignment.get("ingredient_count", 0),
                })

            return {
                "date_range": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
                "meal_assignments": preview_data,
                "total_days": (end_date - start_date).days + 1,
            }

        except Exception as e:
            logger.error(f"Error generating shopping list preview: {str(e)}")
            raise ShoppingListGenerationError(
                f"Failed to generate shopping list preview: {str(e)}"
            ) from e
