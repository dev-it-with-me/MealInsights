"""
Custom exceptions for diet planning operations.
"""


class DietPlanningError(Exception):
    """Base exception for diet planning operations."""

    pass


class MealAssignmentNotFoundError(DietPlanningError):
    """Raised when a meal assignment is not found."""

    pass


class MealAssignmentValidationError(DietPlanningError):
    """Raised when meal assignment data validation fails."""

    pass


class MealNotFoundForAssignmentError(DietPlanningError):
    """Raised when trying to assign a meal that doesn't exist."""

    pass


class DuplicateMealAssignmentError(DietPlanningError):
    """Raised when trying to assign the same meal to the same date/time."""

    pass
