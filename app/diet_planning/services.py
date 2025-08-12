"""
Service layer for diet planning business logic.
"""

from typing import List
import uuid
from datetime import date, timedelta
from app.meals.repositories import MealRepository
from .models import MealAssignment, WeekPlan
from .repositories import DietPlanningRepository
from .schemas import (
    MealAssignmentSchema,
    MealAssignmentResponseSchema,
    UpdateMealAssignmentSchema,
    DayPlanResponseSchema,
    DateRangeRequestSchema,
)
from .exceptions import (
    MealNotFoundForAssignmentError,
)


class DietPlanningService:
    """Service class for diet planning business logic."""

    def __init__(
        self,
        diet_planning_repository: DietPlanningRepository,
        meal_repository: MealRepository,
    ):
        self.diet_planning_repository = diet_planning_repository
        self.meal_repository = meal_repository

    def _schema_to_meal_assignment(
        self,
        schema: MealAssignmentSchema,
        meal_name: str,
        calories: float | None = None,
    ) -> MealAssignment:
        """Convert schema to model."""
        return MealAssignment(
            meal_id=schema.meal_id,
            meal_name=meal_name,
            assignment_date=schema.plan_date,
            meal_time=schema.meal_type,
            specific_time=schema.specific_time,
            calories=calories,
            notes=schema.notes,
        )

    def _meal_assignment_to_response_schema(
        self, assignment: MealAssignment
    ) -> MealAssignmentResponseSchema:
        """Convert model to response schema."""
        return MealAssignmentResponseSchema(
            id=assignment.id,
            meal_id=assignment.meal_id,
            meal_name=assignment.meal_name,
            plan_date=assignment.assignment_date,
            meal_type=assignment.meal_time,
            specific_time=assignment.specific_time,
            calories=assignment.calories,
            notes=assignment.notes,
        )

    async def create_meal_assignment(
        self, assignment_data: MealAssignmentSchema
    ) -> MealAssignmentResponseSchema:
        """Create a new meal assignment."""
        # Validate that the meal exists
        try:
            meal = await self.meal_repository.get_meal_by_id(assignment_data.meal_id)
        except Exception:
            raise MealNotFoundForAssignmentError(
                f"Meal with id {assignment_data.meal_id} not found"
            )

        # Convert schema to model
        assignment = self._schema_to_meal_assignment(
            assignment_data, meal.name, meal.calories_total
        )

        # Create the assignment
        created_assignment = await self.diet_planning_repository.create_meal_assignment(
            assignment
        )

        return self._meal_assignment_to_response_schema(created_assignment)

    async def get_meal_assignment_by_id(
        self, assignment_id: uuid.UUID
    ) -> MealAssignmentResponseSchema:
        """Get a meal assignment by its ID."""
        assignment = await self.diet_planning_repository.get_meal_assignment_by_id(
            assignment_id
        )
        return self._meal_assignment_to_response_schema(assignment)

    async def get_day_plan(self, plan_date: date) -> DayPlanResponseSchema:
        """Get a complete day plan with all assignments."""
        day_plan = await self.diet_planning_repository.get_day_plan(plan_date)

        # Convert assignments to response schemas
        assignment_responses = [
            self._meal_assignment_to_response_schema(assignment)
            for assignment in day_plan.meal_assignments
        ]

        return DayPlanResponseSchema(
            plan_date=day_plan.plan_date,
            meal_assignments=assignment_responses,
            total_calories=day_plan.total_calories,
            total_macros=None,  # TODO: Calculate from meal data
        )

    async def get_meal_assignments_for_date_range(
        self, date_range: DateRangeRequestSchema
    ) -> List[MealAssignmentResponseSchema]:
        """Get all meal assignments for a date range."""
        assignments = (
            await self.diet_planning_repository.get_meal_assignments_for_date_range(
                date_range.start_date, date_range.end_date
            )
        )

        return [
            self._meal_assignment_to_response_schema(assignment)
            for assignment in assignments
        ]

    async def get_week_plan(self, start_date: date) -> WeekPlan:
        """Get a week plan starting from the given date."""
        end_date = start_date + timedelta(days=6)

        daily_plans = []
        total_weekly_calories = 0

        for i in range(7):
            current_date = start_date + timedelta(days=i)
            day_plan = await self.diet_planning_repository.get_day_plan(current_date)
            daily_plans.append(day_plan)
            total_weekly_calories += day_plan.total_calories

        return WeekPlan(
            start_date=start_date,
            end_date=end_date,
            daily_plans=daily_plans,
            total_weekly_calories=total_weekly_calories,
        )

    async def update_meal_assignment(
        self, assignment_id: uuid.UUID, update_data: UpdateMealAssignmentSchema
    ) -> MealAssignmentResponseSchema:
        """Update an existing meal assignment."""
        # Get the existing assignment
        existing_assignment = (
            await self.diet_planning_repository.get_meal_assignment_by_id(assignment_id)
        )

        # Validate new meal if meal_id is being updated
        meal_name = existing_assignment.meal_name
        calories = existing_assignment.calories

        if update_data.meal_id is not None:
            try:
                meal = await self.meal_repository.get_meal_by_id(update_data.meal_id)
                meal_name = meal.name
                calories = meal.calories_total
            except Exception:
                raise MealNotFoundForAssignmentError(
                    f"Meal with id {update_data.meal_id} not found"
                )

        # Create updated assignment with merged data
        updated_assignment = MealAssignment(
            id=existing_assignment.id,
            meal_id=update_data.meal_id or existing_assignment.meal_id,
            meal_name=meal_name,
            assignment_date=update_data.plan_date
            or existing_assignment.assignment_date,
            meal_time=update_data.meal_type or existing_assignment.meal_time,
            specific_time=update_data.specific_time
            if update_data.specific_time is not None
            else existing_assignment.specific_time,
            calories=calories,
            notes=update_data.notes
            if update_data.notes is not None
            else existing_assignment.notes,
        )

        # Update the assignment
        updated_assignment = await self.diet_planning_repository.update_meal_assignment(
            assignment_id, updated_assignment
        )

        return self._meal_assignment_to_response_schema(updated_assignment)

    async def delete_meal_assignment(self, assignment_id: uuid.UUID) -> None:
        """Delete a meal assignment."""
        await self.diet_planning_repository.delete_meal_assignment(assignment_id)

    async def delete_day_plan(self, plan_date: date) -> None:
        """Delete all meal assignments for a specific date."""
        await self.diet_planning_repository.delete_meal_assignments_for_date(plan_date)

    async def get_daily_calories_for_range(
        self, date_range: DateRangeRequestSchema
    ) -> dict[date, float]:
        """Get daily calorie totals for a date range."""
        calories_by_date = {}

        current_date = date_range.start_date
        while current_date <= date_range.end_date:
            day_plan = await self.diet_planning_repository.get_day_plan(current_date)
            calories_by_date[current_date] = day_plan.total_calories
            current_date += timedelta(days=1)

        return calories_by_date
