"""Shopping list generation enums."""
from enum import Enum


class ShoppingListSortBy(str, Enum):
    """Options for sorting shopping list items."""
    INGREDIENT_NAME = "ingredient_name"
    QUANTITY = "quantity"
    SHOP_SUGGESTION = "shop_suggestion"
    MEAL_NAME = "meal_name"
    PLANNED_DATE = "planned_date"
