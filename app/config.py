"""
Application configuration module.
Handles database connections, settings, and environment configuration.
"""

import logging
from typing import Generator
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class DatabaseSettings(BaseModel):
    """Database configuration settings."""

    host: str = Field(default="localhost")
    name: str = Field(...)
    user: str = Field(...)
    password: str = Field(...)
    port: int = Field(default=5432)

    @property
    def url(self) -> str:
        """Generate SQLAlchemy database URL."""
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    model_config = {"extra": "forbid", "frozen": True}


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database settings
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_name: str = Field(default="mealinsights_db", alias="APP_DB_NAME")
    db_user: str = Field(default="mealinsights_user", alias="APP_DB_USER")
    db_password: str = Field(default="", alias="APP_DB_PASSWORD")
    db_port: int = Field(default=5432, alias="DB_PORT")

    # Application settings
    app_name: str = Field(default="MealInsights")
    debug: bool = Field(default=True)
    log_level: str = Field(default="INFO")

    @property
    def database(self) -> DatabaseSettings:
        """Get database configuration."""
        return DatabaseSettings(
            host=self.db_host,
            name=self.db_name,
            user=self.db_user,
            password=self.db_password,
            port=self.db_port,
        )

    model_config = {"extra": "forbid", "env_file": ".env", "env_file_encoding": "utf-8"}


# Global settings instance
settings = Settings()

# SQLAlchemy engine configuration
engine = create_engine(
    settings.database.url,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=settings.debug,  # Log SQL queries in debug mode
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Metadata for table definitions
metadata = MetaData()


def get_db_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields:
        Session: SQLAlchemy database session

    Example:
        ```python
        def some_function(db: Session = Depends(get_db_session)):
            # Use db session here
            pass
        ```
    """
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {e}")
        session.rollback()
        raise
    finally:
        session.close()


def create_all_tables() -> None:
    """Create all database tables. Use for development/testing only."""
    metadata.create_all(bind=engine)
    logger.info("All database tables created")


def drop_all_tables() -> None:
    """Drop all database tables. Use for development/testing only."""
    metadata.drop_all(bind=engine)
    logger.warning("All database tables dropped")
