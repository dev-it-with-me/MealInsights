"""Repository layer for shopping list data access."""
from datetime import date
from sqlalchemy import text, Engine
import logging

from .models import ShoppingListItem
from .exceptions import NoMealPlansFoundError

logger = logging.getLogger(__name__)


class ShoppingRepository:
    """Repository for shopping list data operations."""
    
    def __init__(self, db_engine: Engine):
        """Initialize repository with database engine.
        
        Args:
            db_engine: SQLAlchemy database engine
        """
        self.db_engine = db_engine

    def get_meal_assignments_for_range(
        self, 
        start_date: date, 
        end_date: date
    ) -> list[dict]:
        """Get all meal assignments for the specified date range.
        
        Args:
            start_date: Start date of the range
            end_date: End date of the range
            
        Returns:
            List of meal assignment records with meal and ingredient details
            
        Raises:
            NoMealPlansFoundError: If no meal plans found for the date range
        """
        query = text("""
            SELECT DISTINCT
                ma.planned_date,
                ma.meal_type,
                ma.specific_time,
                ma.notes,
                m.id as meal_id,
                m.name as meal_name,
                m.description as meal_description,
                mi.ingredient_id,
                i.name as ingredient_name,
                mi.quantity,
                mi.unit,
                i.preferred_shop
            FROM meal_assignments ma
            JOIN meals m ON ma.meal_id = m.id
            JOIN meal_ingredients mi ON m.id = mi.meal_id
            JOIN ingredients i ON mi.ingredient_id = i.id
            WHERE ma.planned_date >= :start_date 
            AND ma.planned_date <= :end_date
            ORDER BY ma.planned_date, ma.meal_type, m.name, i.name
        """)
        
        with self.db_engine.connect() as conn:
            result = conn.execute(query, {
                "start_date": start_date,
                "end_date": end_date
            })
            
            rows = result.fetchall()
            
            if not rows:
                logger.warning(f"No meal assignments found for date range {start_date} to {end_date}")
                raise NoMealPlansFoundError(
                    f"No meal plans found for the period from {start_date} to {end_date}"
                )
            
            # Convert rows to dictionaries
            assignments = []
            for row in rows:
                assignments.append({
                    "planned_date": row.planned_date,
                    "meal_type": row.meal_type,
                    "specific_time": row.specific_time,
                    "notes": row.notes,
                    "meal_id": row.meal_id, 
                    "meal_name": row.meal_name,
                    "meal_description": row.meal_description,
                    "ingredient_id": row.ingredient_id,
                    "ingredient_name": row.ingredient_name,
                    "quantity": row.quantity,
                    "unit": row.unit,
                    "preferred_shop": row.preferred_shop
                })
            
            logger.info(f"Found {len(assignments)} meal-ingredient assignments for date range")
            return assignments
    
    def aggregate_shopping_items(self, assignments: list[dict]) -> list[ShoppingListItem]:
        """Aggregate ingredients from meal assignments into shopping list items.
        
        Args:
            assignments: List of meal assignment records
            
        Returns:
            List of aggregated shopping list items
        """
        # Dictionary to aggregate ingredients by name and unit
        aggregated = {}
        
        for assignment in assignments:
            ingredient_key = f"{assignment['ingredient_name']}_{assignment['unit']}"
            
            if ingredient_key not in aggregated:
                aggregated[ingredient_key] = {
                    "ingredient_name": assignment["ingredient_name"],
                    "unit": assignment["unit"],
                    "total_quantity": 0.0,
                    "shop_suggestion": assignment["preferred_shop"],
                    "planned_meals": set(),
                    "planned_dates": set()
                }
            
            # Aggregate quantity (assuming it's numeric)
            try:
                quantity = float(assignment["quantity"])
                aggregated[ingredient_key]["total_quantity"] += quantity
            except (ValueError, TypeError):
                # If quantity is not numeric, keep as string
                pass
            
            # Add meal and date to sets
            aggregated[ingredient_key]["planned_meals"].add(assignment["meal_name"])
            aggregated[ingredient_key]["planned_dates"].add(assignment["planned_date"])
        
        # Convert to ShoppingListItem objects
        shopping_items = []
        for item_data in aggregated.values():
            shopping_items.append(ShoppingListItem(
                ingredient_name=item_data["ingredient_name"],
                total_quantity=str(item_data["total_quantity"]) if isinstance(item_data["total_quantity"], float) else item_data["total_quantity"],
                unit=item_data["unit"],
                shop_suggestion=item_data["shop_suggestion"],
                planned_meals=list(item_data["planned_meals"]),
                planned_dates=list(item_data["planned_dates"])
            ))
        
        logger.info(f"Aggregated into {len(shopping_items)} unique shopping items")
        return shopping_items
    
    async def get_aggregated_ingredients_for_date_range(
        self,
        start_date: date,
        end_date: date,
        exclude_meal_types: list[str] | None = None,
    ) -> list[dict]:
        """Get aggregated ingredients for the specified date range.
        
        Args:
            start_date: Start date of the range
            end_date: End date of the range
            exclude_meal_types: Meal types to exclude from aggregation
            
        Returns:
            List of aggregated ingredient data dictionaries
        """
        exclude_clause = ""
        params = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        if exclude_meal_types:
            placeholders = ",".join([f":exclude_{i}" for i in range(len(exclude_meal_types))])
            exclude_clause = f"AND ma.meal_type NOT IN ({placeholders})"
            for i, meal_type in enumerate(exclude_meal_types):
                params[f"exclude_{i}"] = meal_type

        query = text(f"""
            SELECT 
                i.id as ingredient_id,
                i.name as ingredient_name,
                SUM(CAST(mi.quantity AS DECIMAL(10,2)) * ma.servings) as total_quantity,
                mi.unit,
                i.category,
                i.estimated_cost_per_unit * SUM(CAST(mi.quantity AS DECIMAL(10,2)) * ma.servings) as estimated_cost,
                STRING_AGG(DISTINCT m.name, ', ') as notes
            FROM meal_assignments ma
            JOIN meals m ON ma.meal_id = m.id
            JOIN meal_ingredients mi ON m.id = mi.meal_id
            JOIN ingredients i ON mi.ingredient_id = i.id
            WHERE ma.planned_date >= :start_date 
            AND ma.planned_date <= :end_date
            {exclude_clause}
            GROUP BY i.id, i.name, mi.unit, i.category, i.estimated_cost_per_unit
            ORDER BY i.name
        """)
        
        with self.db_engine.connect() as conn:
            result = conn.execute(query, params)
            rows = result.fetchall()
            
            aggregated_ingredients = []
            for row in rows:
                aggregated_ingredients.append({
                    "ingredient_id": row.ingredient_id,
                    "ingredient_name": row.ingredient_name,
                    "total_quantity": str(row.total_quantity) if row.total_quantity else "0",
                    "unit": row.unit,
                    "category": row.category,
                    "estimated_cost": float(row.estimated_cost) if row.estimated_cost else None,
                    "notes": row.notes or "",
                })
            
            logger.info(f"Aggregated {len(aggregated_ingredients)} unique ingredients")
            return aggregated_ingredients

    async def get_meal_assignments_for_date_range(
        self, start_date: date, end_date: date
    ) -> list[dict]:
        """Get meal assignments for the specified date range with counts.
        
        Args:
            start_date: Start date of the range
            end_date: End date of the range
            
        Returns:
            List of meal assignment data
        """
        query = text("""
            SELECT 
                ma.planned_date as assignment_date,
                ma.meal_type,
                ma.meal_id,
                m.name as meal_name,
                ma.servings,
                COUNT(mi.ingredient_id) as ingredient_count
            FROM meal_assignments ma
            JOIN meals m ON ma.meal_id = m.id
            LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
            WHERE ma.planned_date >= :start_date 
            AND ma.planned_date <= :end_date
            GROUP BY ma.planned_date, ma.meal_type, ma.meal_id, m.name, ma.servings
            ORDER BY ma.planned_date, ma.meal_type
        """)
        
        with self.db_engine.connect() as conn:
            result = conn.execute(query, {
                "start_date": start_date,
                "end_date": end_date
            })
            
            rows = result.fetchall()
            
            assignments = []
            for row in rows:
                assignments.append({
                    "assignment_date": row.assignment_date,
                    "meal_type": row.meal_type,
                    "meal_id": row.meal_id,
                    "meal_name": row.meal_name,
                    "servings": row.servings,
                    "ingredient_count": row.ingredient_count,
                })
            
            return assignments
