"""Shopping list services for meal plan aggregation."""

import logging
from datetime import date
from typing import Any

from .exceptions import ShoppingListGenerationError
from .models import ShoppingListItem, ShoppingSummary
from .repositories import ShoppingRepository
from .schemas import ShoppingListGenerateRequest, ShoppingListResponse
from .enums import ShoppingListSortBy

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
            aggregated_ingredients = (
                await self.repository.get_aggregated_ingredients_for_date_range(
                    start_date=request.start_date,
                    end_date=request.end_date,
                    exclude_meal_types=request.exclude_meal_types or [],
                )
            )

            # Convert to shopping list items
            shopping_items = []
            for ingredient_data in aggregated_ingredients:
                item = ShoppingListItem(
                    ingredient_id=ingredient_data["ingredient_id"],
                    ingredient_name=ingredient_data["ingredient_name"],
                    total_quantity=ingredient_data["total_quantity"],
                    unit=ingredient_data["unit"],
                    category=None,  # Since category is not available in the ingredients table
                    estimated_cost=None,  # Since cost is not available in the ingredients table
                    notes=ingredient_data.get("notes", ""),
                    shop_suggestion=ingredient_data.get(
                        "shop_suggestion"
                    ),  # Add this field
                    planned_meals=[],  # Will be empty for aggregated view
                    planned_dates=[],  # Will be empty for aggregated view
                )
                shopping_items.append(item)

            # Sort items if sort_by is specified
            if request.sort_by:
                shopping_items = self._sort_shopping_items(
                    shopping_items, request.sort_by
                )

            # Calculate summary
            total_items = len(shopping_items)
            total_cost = sum(item.estimated_cost or 0 for item in shopping_items)
            categories = list(
                set(item.category for item in shopping_items if item.category)
            )

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
            meal_assignments = (
                await self.repository.get_meal_assignments_summary_for_date_range(
                    start_date=start_date, end_date=end_date
                )
            )

            # Group by date and meal type
            preview_data: dict[str, dict[str, list[dict[str, Any]]]] = {}
            for assignment in meal_assignments:
                date_str = assignment["assignment_date"].isoformat()
                if date_str not in preview_data:
                    preview_data[date_str] = {}

                meal_time = assignment["meal_time"]
                if meal_time not in preview_data[date_str]:
                    preview_data[date_str][meal_time] = []

                preview_data[date_str][meal_time].append(
                    {
                        "meal_id": assignment["meal_id"],
                        "meal_name": assignment["meal_name"],
                        "ingredient_count": assignment.get("ingredient_count", 0),
                    }
                )

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

    def _sort_shopping_items(
        self, items: list[ShoppingListItem], sort_by: ShoppingListSortBy
    ) -> list[ShoppingListItem]:
        """Sort shopping list items based on specified criteria.

        Args:
            items: List of shopping list items to sort
            sort_by: Sort criteria

        Returns:
            Sorted list of shopping items
        """
        if sort_by == ShoppingListSortBy.INGREDIENT_NAME:
            return sorted(items, key=lambda x: x.ingredient_name.lower())
        elif sort_by == ShoppingListSortBy.SHOP_SUGGESTION:
            return sorted(
                items,
                key=lambda x: (x.shop_suggestion or "zzz", x.ingredient_name.lower()),
            )
        elif sort_by == ShoppingListSortBy.QUANTITY:
            # Try to sort by numeric quantity, fallback to string sort
            try:
                return sorted(
                    items, key=lambda x: float(x.total_quantity), reverse=True
                )
            except (ValueError, TypeError):
                return sorted(items, key=lambda x: x.total_quantity)
        elif sort_by == ShoppingListSortBy.MEAL_NAME:
            # Sort by first planned meal name
            return sorted(
                items, key=lambda x: (x.planned_meals[0] if x.planned_meals else "zzz")
            )
        elif sort_by == ShoppingListSortBy.PLANNED_DATE:
            # Sort by first planned date
            return sorted(
                items,
                key=lambda x: (x.planned_dates[0] if x.planned_dates else date.max),
            )

        # Default fallback
        return items

    def export_shopping_list_text(self, shopping_list: ShoppingListResponse) -> str:
        """Export shopping list as formatted text.

        Args:
            shopping_list: Shopping list response to export

        Returns:
            Formatted text representation of the shopping list
        """
        text_lines = [
            f"Shopping List - {shopping_list.summary.date_range_start} to {shopping_list.summary.date_range_end}",
            f"Generated on: {shopping_list.generated_at}",
            f"Total Items: {shopping_list.summary.total_items}",
            "",
        ]

        if shopping_list.summary.total_estimated_cost:
            text_lines.append(
                f"Estimated Total Cost: ${shopping_list.summary.total_estimated_cost:.2f}"
            )
            text_lines.append("")

        # Group by category if available
        if shopping_list.summary.categories:
            for category in sorted(shopping_list.summary.categories):
                category_items = [
                    item for item in shopping_list.items if item.category == category
                ]
                if category_items:
                    text_lines.append(f"--- {category.upper()} ---")
                    for item in category_items:
                        line = f"• {item.ingredient_name}: {item.total_quantity} {item.unit}"
                        if item.shop_suggestion:
                            line += f" (at {item.shop_suggestion})"
                        text_lines.append(line)
                    text_lines.append("")

            # Items without category
            uncategorized = [item for item in shopping_list.items if not item.category]
            if uncategorized:
                text_lines.append("--- OTHER ---")
                for item in uncategorized:
                    line = (
                        f"• {item.ingredient_name}: {item.total_quantity} {item.unit}"
                    )
                    if item.shop_suggestion:
                        line += f" (at {item.shop_suggestion})"
                    text_lines.append(line)
        else:
            # Simple list without categories
            for item in shopping_list.items:
                line = f"• {item.ingredient_name}: {item.total_quantity} {item.unit}"
                if item.shop_suggestion:
                    line += f" (at {item.shop_suggestion})"
                text_lines.append(line)

        return "\n".join(text_lines)
