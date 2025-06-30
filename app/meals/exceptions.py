"""
Custom exceptions for the meals module.
"""


class MealNotFoundError(Exception):
    """Raised when a meal is not found."""

    pass


class MealValidationError(Exception):
    """Raised when meal data validation fails."""

    pass


class MealIngredientNotFoundError(Exception):
    """Raised when a meal ingredient/product is not found."""

    pass
