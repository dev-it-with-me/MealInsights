"""Shopping list generation exceptions."""


class ShoppingError(Exception):
    """Base exception for shopping-related errors."""
    pass


class ShoppingListGenerationError(ShoppingError):
    """Raised when shopping list generation fails."""
    pass


class NoMealPlansFoundError(ShoppingError):
    """Raised when no meal plans are found for the given date range."""
    pass


class EmptyShoppingListError(ShoppingError):
    """Raised when the generated shopping list is empty."""
    pass
