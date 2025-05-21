# MealInsights Application

## Project Setup and Database Initialization

This guide will walk you through setting up the MealInsights application environment and initializing its PostgreSQL database.

### 1. Prerequisites

*   **Python 3.12+**
*   **PostgreSQL Server**: Ensure you have a PostgreSQL server running and accessible.
*   **uv**: This project uses `uv` for package management. If you don\'t have it, install it:
    ```bash
    pip install uv
    ```

### 2. Clone the Repository (if you haven\'t already)

```bash
git clone <repository_url>
cd MealInsights
```

### 3. Set Up Python Environment and Install Dependencies

This project uses `uv` to manage the virtual environment and dependencies.

```bash
# Create and activate a virtual environment (uv does this automatically)
# Sync dependencies from pyproject.toml and uv.lock
uv sync
```
This command will create a `.venv` directory in your project root if it doesn\'t exist, and install all necessary packages.

### 4. Configure Environment Variables for Database Connection

The application and database initialization script require database credentials and connection details to be set in an environment file.

1.  **Create a `.env` file** in the root of the project (`/home/devit/dev/MealInsights/.env`).
2.  **Add the following content** to the `.env` file, replacing placeholder values with your actual PostgreSQL details:

    ```env
    DB_HOST=localhost
    DB_NAME_ADMIN=postgres
    DB_USER_ADMIN=your_postgres_admin_username
    DB_PASSWORD_ADMIN=your_postgres_admin_password
    APP_DB_NAME=mealinsights_db
    APP_DB_USER=mealinsights_user
    APP_DB_PASSWORD=your_chosen_password_for_app_user
    ```

    *   `DB_HOST`: The hostname or IP address of your PostgreSQL server (usually `localhost`).
    *   `DB_NAME_ADMIN`: The default PostgreSQL administrative database (usually `postgres`).
    *   `DB_USER_ADMIN`: Your PostgreSQL superuser or a user with privileges to create databases and roles (e.g., `postgres`).
    *   `DB_PASSWORD_ADMIN`: The password for `DB_USER_ADMIN`.
    *   `APP_DB_NAME`: The name for the application\'s database (e.g., `mealinsights_db`). The script will create this.
    *   `APP_DB_USER`: The username for the application to connect to its database (e.g., `mealinsights_user`). The script will create this user.
    *   `APP_DB_PASSWORD`: The password for `APP_DB_USER`. Choose a strong password.

    **Important**: The `.env` file is listed in `.gitignore` and should not be committed to your repository as it contains sensitive credentials.

### 5. Run the Database Initialization Script

Once your `.env` file is configured, you can run the script to create the application database, user, ENUM types, and tables.

Execute the script from the root directory of the project:

```bash
python -m scripts.init_db.run_init_db
```

You should see output in your terminal indicating the progress of the script:
*   Connection attempts to the admin and application databases.
*   Creation of the database and user (if they don\'t already exist).
*   Creation of ENUM types (if they don\'t already exist).
*   Creation of tables (if they don\'t already exist).
*   A success message upon completion, or error messages if issues were encountered.

**Troubleshooting:**
*   **Password authentication failed**: Double-check the passwords in your `.env` file for both the admin user and the application user.
*   **Connection refused**: Ensure your PostgreSQL server is running and accessible on the specified `DB_HOST` and port. Check firewall settings if necessary.
*   **Database ... does not exist (for app DB)**: This might occur if the script failed to create the application database in the first step. Check the admin credentials and permissions.
*   **Import errors (e.g., `dotenv`, `sqlalchemy`, `psycopg2`)**: Ensure `uv sync` completed successfully and you are running the script within the activated virtual environment (uv usually handles this if you run `uv run python -m ...`).

### 6. Next Steps

After successful database initialization, you can proceed with running the main application (details to be added here once the main application entry point is developed).

