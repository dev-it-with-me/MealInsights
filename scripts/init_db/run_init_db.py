"""
This script initializes the database schema for the MealInsight application.

It creates necessary ENUM types and tables if they don't already exist.
This script is intended for initial setup or development environments.
For production, consider using a migration tool like Alembic.
"""

import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sqlalchemy
from sqlalchemy import (
    create_engine,
    text,
    MetaData,
    Table,
    Column,
    String,
    REAL,
    ForeignKey,
    JSON,
    Boolean,
    Text,
    Date,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ENUM as PG_ENUM
from sqlalchemy.exc import SQLAlchemyError

# --- Import Database Configuration ---
try:
    # Try relative import first (when script is run as a module)
    from .db_config import (
        DB_HOST,
        DB_NAME_ADMIN,
        DB_USER_ADMIN,
        DB_PASSWORD_ADMIN,
        APP_DB_NAME,
        APP_DB_USER,
        APP_DB_PASSWORD,
        APP_DB_URL as SQLALCHEMY_DATABASE_URL_APP,  # Use APP_DB_URL directly
        # get_admin_db_url # This can be imported if/when engine_admin is used
    )
except ImportError:
    # Fallback to direct import when script is run directly
    from db_config import (
        DB_HOST,
        DB_NAME_ADMIN,
        DB_USER_ADMIN,
        DB_PASSWORD_ADMIN,
        APP_DB_NAME,
        APP_DB_USER,
        APP_DB_PASSWORD,
        APP_DB_URL as SQLALCHEMY_DATABASE_URL_APP,  # Use APP_DB_URL directly
        # get_admin_db_url # This can be imported if/when engine_admin is used
    )

# SQLAlchemy metadata object
metadata = MetaData()

# --- ENUM Definitions (for SQLAlchemy) ---
diet_tag_enum_values = (
    "vegetarian",
    "vegan",
    "gluten_free",
    "dairy_free",
    "nut_free",
    "low_carb",
    "high_protein",
    "meat",
    "fish",
    "fruit",
    "vegetable",
    "dairy",
    "fodmap_free",
    "low_fodmap",
    "high_fodmap",
    "sugar_free",
    "low_sugar",
    "high_sugar",
    "healthy_fat",
    "low_fat",
)
unit_enum_values = ("g", "ml", "piece", "tbsp", "tsp", "cup", "oz", "lb", "kg", "l")

diet_tag_enum_pg = PG_ENUM(
    *diet_tag_enum_values, name="diet_tag_enum", create_type=False
)
unit_enum_pg = PG_ENUM(*unit_enum_values, name="unit_enum", create_type=False)


# --- Table Definitions (SQLAlchemy Core) ---
ingredients_table = Table(
    "ingredients",
    metadata,
    Column(
        "id",
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    ),
    Column("name", String(100), nullable=False),
    Column("photo_data", sqlalchemy.LargeBinary, nullable=True),
    Column("shops", JSON, nullable=True, server_default=text("'[]'::json")),
    Column("calories_per_100g_or_ml", REAL, nullable=False, server_default=text("0")),
    Column(
        "macros_protein_g_per_100g_or_ml",
        REAL,
        nullable=False,
        server_default=text("0"),
    ),
    Column(
        "macros_carbohydrates_g_per_100g_or_ml",
        REAL,
        nullable=False,
        server_default=text("0"),
    ),
    Column(
        "macros_fat_g_per_100g_or_ml", REAL, nullable=False, server_default=text("0")
    ),
    Column(
        "macros_sugar_g_per_100g_or_ml",
        REAL,
        nullable=False,
        server_default=text("0"),
    ),
    Column(
        "macros_fiber_g_per_100g_or_ml",
        REAL,
        nullable=False,
        server_default=text("0"),
    ),
    Column(
        "macros_saturated_fat_g_per_100g_or_ml",
        REAL,
        nullable=False,
        server_default=text("0"),
    ),
    sqlalchemy.CheckConstraint(
        "calories_per_100g_or_ml >= 0", name="ck_ingredients_calories"
    ),
    sqlalchemy.CheckConstraint(
        "macros_protein_g_per_100g_or_ml >= 0", name="ck_ingredients_protein"
    ),
    sqlalchemy.CheckConstraint(
        "macros_carbohydrates_g_per_100g_or_ml >= 0", name="ck_ingredients_carbs"
    ),
    sqlalchemy.CheckConstraint(
        "macros_fat_g_per_100g_or_ml >= 0", name="ck_ingredients_fat"
    ),
    sqlalchemy.CheckConstraint(
        "macros_sugar_g_per_100g_or_ml >= 0", name="ck_ingredients_sugar"
    ),
    sqlalchemy.CheckConstraint(
        "macros_fiber_g_per_100g_or_ml >= 0", name="ck_ingredients_fiber"
    ),
    sqlalchemy.CheckConstraint(
        "macros_saturated_fat_g_per_100g_or_ml >= 0",
        name="ck_ingredients_saturated_fat",
    ),
)

ingredient_tags_table = Table(
    "ingredient_tags",
    metadata,
    Column(
        "ingredient_id",
        PG_UUID(as_uuid=True),
        ForeignKey("ingredients.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("tag", diet_tag_enum_pg, primary_key=True),
)

products_table = Table(
    "products",
    metadata,
    Column(
        "id",
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    ),
    Column("name", String(150), nullable=False),
    Column("brand", String(100), nullable=True),
    Column("photo_data", sqlalchemy.LargeBinary, nullable=True),
    Column("shop", String(100), nullable=True),
    Column("calories_per_100g_or_ml", REAL, nullable=True),
    Column("macros_protein_g_per_100g_or_ml", REAL, nullable=True),
    Column("macros_carbohydrates_g_per_100g_or_ml", REAL, nullable=True),
    Column("macros_fat_g_per_100g_or_ml", REAL, nullable=True),
    Column("macros_sugar_g_per_100g_or_ml", REAL, nullable=True),
    Column("macros_fiber_g_per_100g_or_ml", REAL, nullable=True),
    Column("macros_saturated_fat_g_per_100g_or_ml", REAL, nullable=True),
    Column("package_size_g_or_ml", REAL, nullable=True),
    sqlalchemy.CheckConstraint(
        "calories_per_100g_or_ml IS NULL OR calories_per_100g_or_ml >= 0",
        name="ck_products_calories",
    ),
    sqlalchemy.CheckConstraint(
        "macros_protein_g_per_100g_or_ml IS NULL OR macros_protein_g_per_100g_or_ml >= 0",
        name="ck_products_protein",
    ),
    sqlalchemy.CheckConstraint(
        "macros_carbohydrates_g_per_100g_or_ml IS NULL OR macros_carbohydrates_g_per_100g_or_ml >= 0",
        name="ck_products_carbs",
    ),
    sqlalchemy.CheckConstraint(
        "macros_fat_g_per_100g_or_ml IS NULL OR macros_fat_g_per_100g_or_ml >= 0",
        name="ck_products_fat",
    ),
    sqlalchemy.CheckConstraint(
        "macros_sugar_g_per_100g_or_ml IS NULL OR macros_sugar_g_per_100g_or_ml >= 0",
        name="ck_products_sugar",
    ),
    sqlalchemy.CheckConstraint(
        "macros_fiber_g_per_100g_or_ml IS NULL OR macros_fiber_g_per_100g_or_ml >= 0",
        name="ck_products_fiber",
    ),
    sqlalchemy.CheckConstraint(
        "macros_saturated_fat_g_per_100g_or_ml IS NULL OR macros_saturated_fat_g_per_100g_or_ml >= 0",
        name="ck_products_saturated_fat",
    ),
    sqlalchemy.CheckConstraint(
        "package_size_g_or_ml IS NULL OR package_size_g_or_ml >= 0",
        name="ck_products_package_size",
    ),
)

product_tags_table = Table(
    "product_tags",
    metadata,
    Column(
        "product_id",
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("tag", diet_tag_enum_pg, primary_key=True),
)

product_ingredients_table = Table(
    "product_ingredients",
    metadata,
    Column(
        "product_id",
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "ingredient_id",
        PG_UUID(as_uuid=True),
        ForeignKey("ingredients.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)

# --- Meals Tables ---
meals_table = Table(
    "meals",
    metadata,
    Column(
        "id",
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    ),
    Column("name", String(150), nullable=False),
    Column("photo_data", sqlalchemy.LargeBinary, nullable=True),
    Column("recipe", Text, nullable=True),
    Column("calories_total", REAL, nullable=True),
    Column("macros_protein_g", REAL, nullable=True),
    Column("macros_carbohydrates_g", REAL, nullable=True),
    Column("macros_sugar_g", REAL, nullable=True),
    Column("macros_fat_g", REAL, nullable=True),
    Column("macros_fiber_g", REAL, nullable=True),
    Column("macros_saturated_fat_g", REAL, nullable=True),
    Column(
        "is_nutrition_calculated", Boolean, nullable=False, server_default=text("false")
    ),
    sqlalchemy.CheckConstraint(
        "calories_total IS NULL OR calories_total >= 0", name="ck_meals_calories"
    ),
    sqlalchemy.CheckConstraint(
        "macros_protein_g IS NULL OR macros_protein_g >= 0", name="ck_meals_protein"
    ),
    sqlalchemy.CheckConstraint(
        "macros_carbohydrates_g IS NULL OR macros_carbohydrates_g >= 0",
        name="ck_meals_carbs",
    ),
    sqlalchemy.CheckConstraint(
        "macros_sugar_g IS NULL OR macros_sugar_g >= 0", name="ck_meals_sugar"
    ),
    sqlalchemy.CheckConstraint(
        "macros_fat_g IS NULL OR macros_fat_g >= 0", name="ck_meals_fat"
    ),
    sqlalchemy.CheckConstraint(
        "macros_fiber_g IS NULL OR macros_fiber_g >= 0", name="ck_meals_fiber"
    ),
    sqlalchemy.CheckConstraint(
        "macros_saturated_fat_g IS NULL OR macros_saturated_fat_g >= 0",
        name="ck_meals_saturated_fat",
    ),
)

meal_ingredients_table = Table(
    "meal_ingredients",
    metadata,
    Column(
        "meal_id",
        PG_UUID(as_uuid=True),
        ForeignKey("meals.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("item_id", PG_UUID(as_uuid=True), primary_key=True),
    Column("item_type", String(20), nullable=False, primary_key=True),
    Column("item_name", String(150), nullable=False),
    Column("quantity", REAL, nullable=False),
    Column("unit", unit_enum_pg, nullable=False),
    sqlalchemy.CheckConstraint("quantity > 0", name="ck_meal_ingredients_quantity"),
    sqlalchemy.CheckConstraint(
        "item_type IN ('ingredient', 'product')", name="ck_meal_ingredients_item_type"
    ),
)

meal_ingredient_equivalents_table = Table(
    "meal_ingredient_equivalents",
    metadata,
    Column(
        "meal_id",
        PG_UUID(as_uuid=True),
        ForeignKey("meals.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("original_item_id", PG_UUID(as_uuid=True), primary_key=True),
    Column("equivalent_item_id", PG_UUID(as_uuid=True), primary_key=True),
    Column("equivalent_item_type", String(20), nullable=False),
    Column("equivalent_item_name", String(150), nullable=False),
    Column("conversion_ratio", REAL, nullable=False, server_default=text("1.0")),
    sqlalchemy.CheckConstraint(
        "conversion_ratio > 0", name="ck_meal_equivalents_ratio"
    ),
    sqlalchemy.CheckConstraint(
        "equivalent_item_type IN ('ingredient', 'product')",
        name="ck_meal_equivalents_item_type",
    ),
)

meal_tags_table = Table(
    "meal_tags",
    metadata,
    Column(
        "meal_id",
        PG_UUID(as_uuid=True),
        ForeignKey("meals.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("tag", diet_tag_enum_pg, primary_key=True),
)

# --- Diet Planning Tables ---
meal_assignments_table = Table(
    "meal_assignments",
    metadata,
    Column(
        "id",
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    ),
    Column(
        "meal_id",
        PG_UUID(as_uuid=True),
        ForeignKey("meals.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("meal_name", String(150), nullable=False),
    Column("assignment_date", Date, nullable=False),
    Column("meal_time", String(20), nullable=False),
    Column("specific_time", Time, nullable=True),
    Column("calories", REAL, nullable=True),
    Column("notes", Text, nullable=True),
    sqlalchemy.CheckConstraint(
        "meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')",
        name="ck_meal_assignments_meal_time",
    ),
    sqlalchemy.CheckConstraint(
        "calories IS NULL OR calories >= 0", name="ck_meal_assignments_calories"
    ),
    # Unique constraint to prevent duplicate assignments
    sqlalchemy.UniqueConstraint(
        "meal_id",
        "assignment_date",
        "meal_time",
        name="uq_meal_assignments_meal_date_time",
    ),
)


def get_db_connection(dbname, user, password, host=DB_HOST):
    """Establishes a connection to the PostgreSQL database (using psycopg2)."""
    try:
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        print(f"Successfully connected to database '{dbname}' as user '{user}'.")
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to database '{dbname}' as user '{user}': {e}")
        # Depending on the error, you might want to check specific parts of the connection string
        if "password authentication failed" in str(e):
            print("Hint: Check the password.")
        elif "Connection refused" in str(e):
            print(f"Hint: Is the PostgreSQL server running at {host} and accessible?")
        elif "database" in str(e) and "does not exist" in str(e):
            print(f"Hint: Database '{dbname}' might not exist.")
        return None


def execute_query(conn, query, params=None, fetch=False):
    """Executes a given SQL query (using psycopg2)."""
    try:
        with conn.cursor() as cur:
            if isinstance(query, str):
                print(
                    f"Executing query: {query[:100]}... with params: {params}"
                )  # Log query (truncated)
                cur.execute(query, params)
            elif isinstance(query, sql.Composed):
                # For sql.SQL objects, psycopg2 handles them directly
                # We can get the string representation for logging if needed, but it might be complex
                # For simplicity, just log that it's a Composed object
                print(f"Executing SQL Composed query with params: {params}")
                cur.execute(query, params)
            else:
                raise ValueError("Query must be a string or sql.Composed object")

            conn.commit()
            print("Query executed and committed successfully.")
            if fetch:
                return cur.fetchall()
            return True  # Indicate success for non-fetch queries
    except psycopg2.Error as e:
        print(f"Error executing query: {e}")
        conn.rollback()  # Rollback on error
        return False  # Indicate failure


def create_database_and_user(conn_admin_psycopg2):
    """Creates the application database and user if they don't exist (using psycopg2)."""
    print("\n--- Creating Database and User (if not exist) ---")
    with conn_admin_psycopg2.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_roles WHERE rolname=%s;", (APP_DB_USER,))
        if not cur.fetchone():
            execute_query(
                conn_admin_psycopg2,
                sql.SQL("CREATE USER {} WITH PASSWORD %s;").format(
                    sql.Identifier(APP_DB_USER)
                ),
                (APP_DB_PASSWORD,),
            )
        else:
            print(f"User {APP_DB_USER} already exists.")

        cur.execute("SELECT 1 FROM pg_database WHERE datname=%s;", (APP_DB_NAME,))
        if not cur.fetchone():
            original_isolation_level = conn_admin_psycopg2.isolation_level
            conn_admin_psycopg2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            try:
                execute_query(
                    conn_admin_psycopg2,
                    sql.SQL("CREATE DATABASE {} OWNER {};").format(
                        sql.Identifier(APP_DB_NAME), sql.Identifier(APP_DB_USER)
                    ),
                )
            finally:
                conn_admin_psycopg2.set_isolation_level(original_isolation_level)
            execute_query(
                conn_admin_psycopg2,
                sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {};").format(
                    sql.Identifier(APP_DB_NAME), sql.Identifier(APP_DB_USER)
                ),
            )
        else:
            print(f"Database {APP_DB_NAME} already exists.")
    print("--- Database and User setup complete ---")


def create_enum_types_sqlalchemy(engine_app):
    """Creates custom ENUM types in the application database using SQLAlchemy."""
    print("\n--- Creating ENUM Types (SQLAlchemy - if not exist) ---")
    enums_to_create = {
        "diet_tag_enum": diet_tag_enum_values,
        "unit_enum": unit_enum_values,
    }
    with engine_app.connect() as connection:
        for enum_name, enum_values_tuple in enums_to_create.items():
            result = connection.execute(
                text("SELECT 1 FROM pg_type WHERE typname = :typname"),
                {"typname": enum_name},
            )
            if not result.scalar_one_or_none():
                values_sql = ", ".join([f"'{val}'" for val in enum_values_tuple])
                create_enum_sql = text(
                    f"CREATE TYPE {enum_name} AS ENUM ({values_sql});"
                )
                connection.execute(create_enum_sql)
                print(f"ENUM type {enum_name} created.")
            else:
                print(f"ENUM type {enum_name} already exists.")
        connection.commit()
    print("--- ENUM Types creation (SQLAlchemy) complete ---")


def create_tables_sqlalchemy(engine_app):
    """Creates tables in the application database using SQLAlchemy Core."""
    print("\n--- Creating Tables (SQLAlchemy - if not exist) ---")
    with engine_app.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))
        connection.commit()
    metadata.create_all(engine_app, checkfirst=True)
    print("--- Table creation (SQLAlchemy) complete ---")


def main():
    """Main function to orchestrate database initialization."""
    psycopg2_conn_admin = None
    engine_app = None  # Initialize to None

    try:
        print("Connecting to admin database (psycopg2) for DB/User creation...")
        psycopg2_conn_admin = get_db_connection(
            DB_NAME_ADMIN, DB_USER_ADMIN, DB_PASSWORD_ADMIN
        )
        if psycopg2_conn_admin:
            create_database_and_user(psycopg2_conn_admin)
        else:
            print(
                "Failed to connect to admin database with psycopg2. Skipping DB/User creation."
            )
            # Optionally, decide if the script should exit if admin connection fails
            # For now, it will proceed to try and connect to the app DB if it exists

        # Attempt to connect to the app database with SQLAlchemy for ENUMs and Tables
        # This will only succeed if the database and user were created (or already existed)
        # and the credentials in db_config.py for APP_DB_URL are correct.
        print(
            f"\nAttempting to connect to application database ({APP_DB_NAME}) with SQLAlchemy..."
        )
        engine_app = create_engine(SQLALCHEMY_DATABASE_URL_APP)

        # Test connection before proceeding
        with engine_app.connect() as connection:
            connection.execute(text("SELECT 1;"))
            print(f"Successfully connected to {APP_DB_NAME} with SQLAlchemy.")

        create_enum_types_sqlalchemy(engine_app)
        create_tables_sqlalchemy(engine_app)

        print("\nDatabase initialization script finished successfully!")

    except psycopg2.Error as e:
        print(f"A psycopg2 database error occurred: {e}")
    except SQLAlchemyError as e:
        print(f"A SQLAlchemy error occurred: {e}")
        if (
            "password authentication failed" in str(e).lower()
            and APP_DB_USER.lower() in str(e).lower()
        ):  # Ensure APP_DB_USER is also lowercased for comparison
            print(
                f"Hint: Check the password for user '{APP_DB_USER}' in your db_config.py or environment variables."
            )
        elif (
            "database" in str(e).lower()
            and f'"{APP_DB_NAME}"'.lower() in str(e).lower()
            and "does not exist" in str(e).lower()
        ):  # Corrected f-string and added .lower()
            print(
                f"Hint: Database '{APP_DB_NAME}' might not exist. Ensure it was created successfully in the previous step."
            )
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if psycopg2_conn_admin:
            psycopg2_conn_admin.close()
            print("\nClosed psycopg2 admin database connection.")
        if engine_app:
            engine_app.dispose()
            print("Disposed SQLAlchemy app engine.")
        print("\nScript finished.")


if __name__ == "__main__":
    main()
