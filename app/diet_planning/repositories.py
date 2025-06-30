"""
Repository layer for diet planning data access.
Handles all database operations for the diet_planning module using raw SQL.
"""

from typing import List, Any
import uuid
import logging
from datetime import date
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import Session

from .models import MealAssignment, DayPlan
from .exceptions import MealAssignmentNotFoundError, DuplicateMealAssignmentError

logger = logging.getLogger(__name__)


# Helper to convert RowProxy to dict
def row_to_dict(row) -> None | dict[str, Any]:
    """Convert database row to dictionary."""
    if row is None:
        return None
    return row._asdict() if hasattr(row, "_asdict") else dict(row)


class DietPlanningRepository:
    """Repository for diet planning data access operations using raw SQL queries."""

    def __init__(self, session: Session) -> None:
        """Initialize the repository with a database session."""
        self.session = session

    def _map_row_to_meal_assignment(
        self, row_dict: None | dict[str, Any]
    ) -> None | MealAssignment:
        """Converts a database row dictionary to a MealAssignment Pydantic model."""
        if not row_dict:
            return None

        return MealAssignment(
            id=row_dict["id"],
            meal_id=row_dict["meal_id"],
            meal_name=row_dict["meal_name"],
            assignment_date=row_dict["assignment_date"],
            meal_time=row_dict["meal_time"],
            specific_time=row_dict.get("specific_time"),
            calories=row_dict.get("calories"),
            notes=row_dict.get("notes"),
        )

    async def create_meal_assignment(
        self, assignment: MealAssignment
    ) -> MealAssignment:
        """Create a new meal assignment."""
        try:
            assignment_id = assignment.id or uuid.uuid4()

            sql_insert_assignment = text("""
                INSERT INTO meal_assignments (
                    id, meal_id, meal_name, assignment_date, meal_time, 
                    specific_time, calories, notes
                ) VALUES (
                    :id, :meal_id, :meal_name, :assignment_date, :meal_time,
                    :specific_time, :calories, :notes
                )
            """)

            params = {
                "id": assignment_id,
                "meal_id": assignment.meal_id,
                "meal_name": assignment.meal_name,
                "assignment_date": assignment.assignment_date,
                "meal_time": assignment.meal_time,
                "specific_time": assignment.specific_time,
                "calories": assignment.calories,
                "notes": assignment.notes,
            }

            self.session.execute(sql_insert_assignment, params)
            self.session.commit()

            # Fetch and return the created assignment
            created_assignment = await self.get_meal_assignment_by_id(assignment_id)
            if not created_assignment:
                raise MealAssignmentNotFoundError(
                    f"Failed to retrieve created assignment with id {assignment_id}"
                )
            return created_assignment

        except IntegrityError as e:
            self.session.rollback()
            logger.error(f"Database integrity error creating meal assignment: {e}")
            if "uq_meal_assignments_meal_date_time" in str(e).lower():
                raise DuplicateMealAssignmentError(
                    "Meal already assigned to this date and time"
                )
            raise MealAssignmentNotFoundError(
                "Meal assignment creation failed due to integrity constraint"
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(f"Database error creating meal assignment: {e}")
            raise MealAssignmentNotFoundError(
                f"Failed to create meal assignment: {str(e)}"
            )

    async def get_meal_assignment_by_id(
        self, assignment_id: uuid.UUID
    ) -> MealAssignment:
        """Get a meal assignment by its ID."""
        try:
            sql_select_assignment = text(
                "SELECT * FROM meal_assignments WHERE id = :id"
            )
            result = self.session.execute(
                sql_select_assignment, {"id": assignment_id}
            ).first()
            assignment_row_dict = row_to_dict(result)

            if not assignment_row_dict:
                raise MealAssignmentNotFoundError(
                    f"Meal assignment with id {assignment_id} not found"
                )

            assignment = self._map_row_to_meal_assignment(assignment_row_dict)
            if not assignment:
                raise MealAssignmentNotFoundError(
                    f"Failed to map meal assignment with id {assignment_id}"
                )
            return assignment

        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching meal assignment by ID {assignment_id}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to fetch meal assignment: {str(e)}"
            )

    async def get_meal_assignments_for_date(
        self, assignment_date: date
    ) -> List[MealAssignment]:
        """Get all meal assignments for a specific date."""
        try:
            sql_select_assignments = text("""
                SELECT * FROM meal_assignments 
                WHERE assignment_date = :assignment_date
                ORDER BY meal_time, specific_time
            """)
            results = self.session.execute(
                sql_select_assignments, {"assignment_date": assignment_date}
            ).fetchall()

            assignments = []
            for row in results:
                assignment_row_dict = row_to_dict(row)
                if assignment_row_dict:
                    assignment = self._map_row_to_meal_assignment(assignment_row_dict)
                    if assignment:
                        assignments.append(assignment)

            return assignments

        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching meal assignments for date {assignment_date}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to fetch meal assignments: {str(e)}"
            )

    async def get_meal_assignments_for_date_range(
        self, start_date: date, end_date: date
    ) -> List[MealAssignment]:
        """Get all meal assignments for a date range."""
        try:
            sql_select_assignments = text("""
                SELECT * FROM meal_assignments 
                WHERE assignment_date BETWEEN :start_date AND :end_date
                ORDER BY assignment_date, meal_time, specific_time
            """)
            results = self.session.execute(
                sql_select_assignments, {"start_date": start_date, "end_date": end_date}
            ).fetchall()

            assignments = []
            for row in results:
                assignment_row_dict = row_to_dict(row)
                if assignment_row_dict:
                    assignment = self._map_row_to_meal_assignment(assignment_row_dict)
                    if assignment:
                        assignments.append(assignment)

            return assignments

        except SQLAlchemyError as e:
            logger.error(
                f"Database error fetching meal assignments for range {start_date} to {end_date}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to fetch meal assignments: {str(e)}"
            )

    async def update_meal_assignment(
        self, assignment_id: uuid.UUID, assignment: MealAssignment
    ) -> MealAssignment:
        """Update an existing meal assignment."""
        try:
            # Check if assignment exists first
            existing_assignment = await self.get_meal_assignment_by_id(assignment_id)
            if not existing_assignment:
                raise MealAssignmentNotFoundError(
                    f"Meal assignment with id {assignment_id} not found"
                )

            sql_update_assignment = text("""
                UPDATE meal_assignments SET
                    meal_id = :meal_id,
                    meal_name = :meal_name,
                    assignment_date = :assignment_date,
                    meal_time = :meal_time,
                    specific_time = :specific_time,
                    calories = :calories,
                    notes = :notes
                WHERE id = :id
            """)

            params = {
                "id": assignment_id,
                "meal_id": assignment.meal_id,
                "meal_name": assignment.meal_name,
                "assignment_date": assignment.assignment_date,
                "meal_time": assignment.meal_time,
                "specific_time": assignment.specific_time,
                "calories": assignment.calories,
                "notes": assignment.notes,
            }

            self.session.execute(sql_update_assignment, params)
            self.session.commit()

            # Fetch and return the updated assignment
            return await self.get_meal_assignment_by_id(assignment_id)

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(
                f"Database error updating meal assignment {assignment_id}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to update meal assignment: {str(e)}"
            )

    async def delete_meal_assignment(self, assignment_id: uuid.UUID) -> None:
        """Delete a meal assignment."""
        try:
            # Check if assignment exists first
            existing_assignment = await self.get_meal_assignment_by_id(assignment_id)
            if not existing_assignment:
                raise MealAssignmentNotFoundError(
                    f"Meal assignment with id {assignment_id} not found"
                )

            sql_delete_assignment = text(
                "DELETE FROM meal_assignments WHERE id = :assignment_id"
            )
            self.session.execute(
                sql_delete_assignment, {"assignment_id": assignment_id}
            )
            self.session.commit()

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(
                f"Database error deleting meal assignment {assignment_id}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to delete meal assignment: {str(e)}"
            )

    async def delete_meal_assignments_for_date(self, assignment_date: date) -> None:
        """Delete all meal assignments for a specific date."""
        try:
            sql_delete_assignments = text(
                "DELETE FROM meal_assignments WHERE assignment_date = :assignment_date"
            )
            self.session.execute(
                sql_delete_assignments, {"assignment_date": assignment_date}
            )
            self.session.commit()

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.error(
                f"Database error deleting meal assignments for date {assignment_date}: {e}"
            )
            raise MealAssignmentNotFoundError(
                f"Failed to delete meal assignments: {str(e)}"
            )

    async def get_day_plan(self, plan_date: date) -> DayPlan:
        """Get a complete day plan with all assignments and calculated totals."""
        try:
            assignments = await self.get_meal_assignments_for_date(plan_date)

            # Calculate total calories
            total_calories = sum(
                assignment.calories
                for assignment in assignments
                if assignment.calories is not None
            )

            return DayPlan(
                plan_date=plan_date,
                meal_assignments=assignments,
                total_calories=total_calories,
                total_macros=None,  # TODO: Calculate total macros from meals
            )

        except Exception as e:
            logger.error(f"Error getting day plan for {plan_date}: {e}")
            raise MealAssignmentNotFoundError(f"Failed to get day plan: {str(e)}")
