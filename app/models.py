"""
This module contains core data models shared across different modules of the application.
"""

from pydantic import BaseModel, Field


class Macros(BaseModel):
    """Represents the macronutrient composition."""

    # Accept alias keys 'protein', 'carbohydrates', 'fat' in request bodies
    protein_g: float = Field(..., alias="protein", ge=0, description="Protein in grams")
    carbohydrates_g: float = Field(
        ..., alias="carbohydrates", ge=0, description="Carbohydrates in grams"
    )
    fat_g: float = Field(..., alias="fat", ge=0, description="Fat in grams")

    model_config = {
        # Forbid unexpected fields and enforce aliases
        "extra": "forbid",
        # Enable populating via alias names
        "populate_by_name": True,
        # Immutable once created
        "frozen": True,
        # Allow construction from ORM/attribute objects
        "from_attributes": True,
    }
