"""
Custom exceptions for the ingredients and products module.
"""


class IngredientsProductsBaseException(Exception):
    """Base exception for ingredients and products module."""

    pass


class IngredientNotFoundError(IngredientsProductsBaseException):
    """Raised when an ingredient is not found."""

    def __init__(self, ingredient_id: str | None = None) -> None:
        if ingredient_id:
            message = f"Ingredient with ID '{ingredient_id}' not found"
        else:
            message = "Ingredient not found"
        super().__init__(message)


class ProductNotFoundError(IngredientsProductsBaseException):
    """Raised when a product is not found."""

    def __init__(self, product_id: str | None = None) -> None:
        if product_id:
            message = f"Product with ID '{product_id}' not found"
        else:
            message = "Product not found"
        super().__init__(message)


class DuplicateIngredientError(IngredientsProductsBaseException):
    """Raised when attempting to create a duplicate ingredient."""

    def __init__(self, ingredient_name: str | None = None) -> None:
        if ingredient_name:
            message = f"Ingredient with name '{ingredient_name}' already exists"
        else:
            message = "Duplicate ingredient"
        super().__init__(message)


class DuplicateProductError(IngredientsProductsBaseException):
    """Raised when attempting to create a duplicate product."""

    def __init__(
        self, product_name: str | None = None, barcode: str | None = None
    ) -> None:
        if barcode:
            message = f"Product with barcode '{barcode}' already exists"
        elif product_name:
            message = f"Product with name '{product_name}' already exists"
        else:
            message = "Duplicate product"
        super().__init__(message)


class InvalidQuantityError(IngredientsProductsBaseException):
    """Raised when an invalid quantity is provided."""

    def __init__(self, quantity: float | None = None) -> None:
        if quantity is not None:
            message = f"Invalid quantity: {quantity}. Quantity must be positive"
        else:
            message = "Invalid quantity provided"
        super().__init__(message)


class DatabaseError(IngredientsProductsBaseException):
    """Raised when a database operation fails."""

    def __init__(
        self, operation: str | None = None, details: str | None = None
    ) -> None:
        if operation and details:
            message = f"Database error during {operation}: {details}"
        elif operation:
            message = f"Database error during {operation}"
        else:
            message = "Database operation failed"
        super().__init__(message)
