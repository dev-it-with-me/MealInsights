"""
Utility functions for the meals module.
"""

from typing import List
from app.enums import DietTagEnum
from .models import Meal, MealIngredient


def aggregate_meal_tags(ingredients: List[MealIngredient]) -> List[DietTagEnum]:
    """
    Aggregate diet tags from meal ingredients.
    This can be used to suggest tags for a meal based on its ingredients.
    """
    # In a real implementation, this would look up the actual ingredient/product tags
    # For now, return an empty list as a placeholder
    return []


def calculate_meal_difficulty(meal: Meal) -> str:
    """
    Calculate meal difficulty based on number of ingredients and recipe complexity.
    Returns: "Easy", "Medium", or "Hard"
    """
    ingredient_count = len(meal.ingredients)
    recipe_length = len(meal.recipe) if meal.recipe else 0

    if ingredient_count <= 3 and recipe_length <= 200:
        return "Easy"
    elif ingredient_count <= 6 and recipe_length <= 500:
        return "Medium"
    else:
        return "Hard"


def format_meal_summary(meal: Meal) -> str:
    """
    Create a summary description of the meal.
    """
    ingredient_count = len(meal.ingredients)
    calories = meal.calories_total or 0

    summary = f"{meal.name}: {ingredient_count} ingredients"
    if calories > 0:
        summary += f", {calories:.0f} calories"

    if meal.tags:
        tag_names = [tag.value for tag in meal.tags[:3]]  # First 3 tags
        summary += f" ({', '.join(tag_names)})"

    return summary
