"""
Database configuration parameters.
Loads sensitive information from .env file.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Admin connection details (for creating the app database and user)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME_ADMIN = os.getenv("DB_NAME_ADMIN", "postgres")
DB_USER_ADMIN = os.getenv("DB_USER_ADMIN", "postgres")
DB_PASSWORD_ADMIN = os.getenv("DB_PASSWORD_ADMIN")

# Application database connection details
APP_DB_NAME = os.getenv("APP_DB_NAME", "mealinsights_db")
APP_DB_USER = os.getenv("APP_DB_USER", "mealinsights_user")
APP_DB_PASSWORD = os.getenv("APP_DB_PASSWORD")

# --- Input Validation for Critical Variables ---
if DB_PASSWORD_ADMIN is None:
    raise ValueError("DB_PASSWORD_ADMIN not found in .env file. Please set it.")
if APP_DB_PASSWORD is None:
    raise ValueError("APP_DB_PASSWORD not found in .env file. Please set it.")

# SQLAlchemy Database URL for the application
# postgresql+psycopg2://user:password@host:port/dbname
APP_DB_URL = (
    f"postgresql+psycopg2://{APP_DB_USER}:{APP_DB_PASSWORD}@{DB_HOST}/{APP_DB_NAME}"
)
ADMIN_DB_URL_TEMPLATE = (
    f"postgresql+psycopg2://{{user}}:{{password}}@{DB_HOST}/{{dbname}}"
)


def get_admin_db_url(
    user=DB_USER_ADMIN, password=DB_PASSWORD_ADMIN, dbname=DB_NAME_ADMIN
):
    """Returns the SQLAlchemy URL for the admin database."""
    return ADMIN_DB_URL_TEMPLATE.format(user=user, password=password, dbname=dbname)


def get_app_db_url(
    user=APP_DB_USER, password=APP_DB_PASSWORD, dbname=APP_DB_NAME, host=DB_HOST
):
    """Returns the SQLAlchemy URL for the application database."""
    return f"postgresql+psycopg2://{user}:{password}@{host}/{dbname}"


def get_database_engine():
    """Returns a SQLAlchemy Engine for the application database."""
    from sqlalchemy import create_engine

    return create_engine(APP_DB_URL, echo=True, future=True)
