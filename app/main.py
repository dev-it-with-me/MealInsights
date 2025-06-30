"""
Main FastAPI application entry point.
Configures the application, middleware, and includes all route modules.
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings, create_all_tables
from app.ingredients_and_products.routes import router as ingredients_products_router
from app.meals.routes import router as meals_router
from app.diet_planning.routes import router as diet_planning_router
from app.ingredients_and_products.exceptions import (
    DatabaseError,
    DuplicateIngredientError,
    DuplicateProductError,
    IngredientNotFoundError,
    IngredientsProductsBaseException,
    InvalidQuantityError,
    ProductNotFoundError,
)
from app.meals.exceptions import (
    MealNotFoundError,
    MealValidationError,
    MealIngredientNotFoundError,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Manages startup and shutdown events.
    """
    # Startup
    logger.info("Starting MealInsights application...")

    try:
        # Create database tables
        create_all_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    logger.info("Application startup completed")

    yield

    # Shutdown
    logger.info("Shutting down MealInsights application...")
    logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="A comprehensive meal planning and nutrition tracking application",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
    if settings.debug
    else ["http://localhost:3000"],  # Adjust based on your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled exceptions.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": "InternalServerError",
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handler for HTTP exceptions.
    """
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_type": "HTTPException"},
    )


# Specific exception handlers for ingredients and products module
@app.exception_handler(IngredientNotFoundError)
async def ingredient_not_found_handler(request: Request, exc: IngredientNotFoundError):
    """Handle ingredient not found errors."""
    logger.warning(f"Ingredient not found: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "error_type": "IngredientNotFoundError"},
    )


@app.exception_handler(ProductNotFoundError)
async def product_not_found_handler(request: Request, exc: ProductNotFoundError):
    """Handle product not found errors."""
    logger.warning(f"Product not found: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "error_type": "ProductNotFoundError"},
    )


@app.exception_handler(DuplicateIngredientError)
async def duplicate_ingredient_handler(request: Request, exc: DuplicateIngredientError):
    """Handle duplicate ingredient errors."""
    logger.warning(f"Duplicate ingredient: {exc}")
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc), "error_type": "DuplicateIngredientError"},
    )


@app.exception_handler(DuplicateProductError)
async def duplicate_product_handler(request: Request, exc: DuplicateProductError):
    """Handle duplicate product errors."""
    logger.warning(f"Duplicate product: {exc}")
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc), "error_type": "DuplicateProductError"},
    )


@app.exception_handler(InvalidQuantityError)
async def invalid_quantity_handler(request: Request, exc: InvalidQuantityError):
    """Handle invalid quantity errors."""
    logger.warning(f"Invalid quantity: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc), "error_type": "InvalidQuantityError"},
    )


@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    """Handle database errors."""
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error_type": "DatabaseError"},
    )


@app.exception_handler(IngredientsProductsBaseException)
async def general_error_handler(
    request: Request, exc: IngredientsProductsBaseException
):
    """Handle general ingredients/products errors."""
    logger.error(f"General error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": "IngredientsProductsBaseException",
        },
    )


# Specific exception handlers for meals module
@app.exception_handler(MealNotFoundError)
async def meal_not_found_handler(request: Request, exc: MealNotFoundError):
    """Handle meal not found errors."""
    logger.warning(f"Meal not found: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "error_type": "MealNotFoundError"},
    )


@app.exception_handler(MealValidationError)
async def meal_validation_handler(request: Request, exc: MealValidationError):
    """Handle meal validation errors."""
    logger.warning(f"Meal validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "error_type": "MealValidationError"},
    )


@app.exception_handler(MealIngredientNotFoundError)
async def meal_ingredient_not_found_handler(
    request: Request, exc: MealIngredientNotFoundError
):
    """Handle meal ingredient not found errors."""
    logger.warning(f"Meal ingredient not found: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "error_type": "MealIngredientNotFoundError"},
    )


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    Returns the application status and basic information.
    """
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": "1.0.0",
        "environment": "development" if settings.debug else "production",
    }


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint.
    Returns basic API information.
    """
    return {
        "message": f"Welcome to {settings.app_name} API",
        "version": "1.0.0",
        "docs_url": "/docs"
        if settings.debug
        else "Documentation not available in production",
        "health_url": "/health",
    }


# Include routers
app.include_router(ingredients_products_router, prefix="/api/v1")

# Additional routers can be included here as they are implemented
app.include_router(diet_planning_router, prefix="/api/v1/diet-planning")
app.include_router(meals_router, prefix="/api/v1")
# app.include_router(shopping_router, prefix="/api/v1")
# app.include_router(symptoms_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting application in development mode...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
