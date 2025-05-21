"""
This module contains core data models shared across different modules of the application.
"""

from pydantic import BaseModel, Field


class Macros(BaseModel):
    """Represents the macronutrient composition."""

    protein_g: float = Field(..., ge=0, description="Protein in grams")
    carbohydrates_g: float = Field(..., ge=0, description="Carbohydrates in grams")
    fat_g: float = Field(..., ge=0, description="Fat in grams")

    model_config = {"extra": "forbid", "frozen": True, "from_attributes": True}
