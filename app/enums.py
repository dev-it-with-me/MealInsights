import enum


class DietTagEnum(str, enum.Enum):
    """
    Enum for categorizing ingredients and meals based on dietary properties.
    """

    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    NUT_FREE = "nut_free"
    LOW_CARB = "low_carb"
    HIGH_PROTEIN = "high_protein"
    MEAT = "meat"
    FISH = "fish"
    FRUIT = "fruit"
    VEGETABLE = "vegetable"
    DAIRY = "dairy"
    FODMAP_FREE = "fodmap_free"
    LOW_FODMAP = "low_fodmap"
    HIGH_FODMAP = "high_fodmap"
    SUGAR_FREE = "sugar_free"
    LOW_SUGAR = "low_sugar"
    HIGH_SUGAR = "high_sugar"
    HEALTHY_FAT = "healthy_fat"
    LOW_FAT = "low_fat"
    # Add more tags as needed


class MealSlotEnum(str, enum.Enum):
    """
    Enum for defining specific meal times or slots in a diet plan.
    """

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK_AM = "snack_am"  # Morning snack
    SNACK_PM = "snack_pm"  # Afternoon snack
    SUPPER = "supper"  # Late evening meal


class UnitEnum(str, enum.Enum):
    """
    Enum for units of measurement for ingredients.
    """

    GRAM = "g"
    MILLILITER = "ml"
    PIECE = "piece"
    TABLESPOON = "tbsp"
    TEASPOON = "tsp"
    CUP = "cup"
    OUNCE = "oz"
    POUND = "lb"
    KILOGRAM = "kg"
    LITER = "l"
