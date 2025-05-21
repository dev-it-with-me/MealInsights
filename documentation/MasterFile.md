# MealInsight Master Documentation File

This document outlines the main layouts and pages for the MealInsight application, following the structure defined in the MasterPlan.

## Layers of the Documentation
This file focuses on:
- **Layouts**: Defines common structural elements for pages.
- **Pages**: Describes individual user-facing views and their components.

For details on ID Naming, Types, and other conventions, please refer to the [Documentation - MasterPlan](/.github/prompts/Documentation%20-%20MasterPlan.prompt.md).

---

## Layouts

**Layout L0001.MainAppLayout**
Provides a consistent navigation structure for all pages. - ---

| ID    | Name             | Type   | Functionality                                        | Goal                                                 | Trigger | Link   |
| :---- | :--------------- | :----- | :--------------------------------------------------- | :--------------------------------------------------- | :------ | :----- |
| E3000 | NavigationMenu   | Ribbon | Displays links to all main pages of the application. | To allow users to navigate to different sections.    | ---     | ---    |

---

## Pages

### **Page P0100.ManageIngredientsPage**
Allows users to add, view, edit, and delete ingredients. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/ingredients/manage`

| ID    | Name                     | Type  | Functionality                                                                                      | Goal                                                      | Trigger                                     | Link      |
| :---- | :----------------------- | :---- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------ | :-------- |
| C1000 | AddEditIngredientForm    | Form  | Allows input/edit of ingredient details (name, photo, shop, calories, macros, tags).               | To create or update an ingredient.                        | `Button E3001 (On Add New)` / `Click C1001 Item (On Edit)` | [Link to C1000](./components/C1000.md#form-c1000addeditingredientform)  |
| E3001 | AddNewIngredientButton   | Button| Opens the AddEditIngredientForm for a new ingredient.                                              | To initiate adding a new ingredient.                      | ---                                         | ---       |
| C1001 | IngredientsList     | List of Dynamic Objects | Displays existing ingredients with options to edit or delete.                                      | To view and manage ingredients on this page.              | ---                                         | [Link to C1001](./components/C1001.md#listofdynamicobjects-c1001ingredientslist)  |

### **Page P0101.IngredientsListPage**
Displays a comprehensive list of all available ingredients. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/ingredients`

| ID    | Name                        | Type    | Functionality                                                                   | Goal                                                         | Trigger | Link      |
| :---- | :-------------------------- | :------ | :------------------------------------------------------------------------------ | :----------------------------------------------------------- | :------ | :-------- |
| C1002 | AllIngredientsList        | List of Dynamic Objects   | Displays all ingredients with details (name, photo, shop, calories, macros, tags). | To provide a browseable view of all ingredients.              | ---     | [Link to C1002](./components/C1002.md#listofdynamicobjects-c1002allingredientslist)  |
| C1003 | IngredientFilterSortPanel   | Panel   | Provides options to filter (e.g., by tag, shop) and sort the ingredients list.  | To help users find specific ingredients easily.              | ---     | [Link to C1003](./components/C1003.md#panel-c1003ingredientfiltersortpanel)  |

### **Page P0102.ManageMealsPage**
Allows users to create, view, edit, and delete meals. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/meals/manage`

| ID    | Name                 | Type   | Functionality                                                                                                | Goal                                        | Trigger                                   | Link      |
| :---- | :------------------- | :----- | :----------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :---------------------------------------- | :-------- |
| C1004 | AddEditMealForm      | Form   | Compose meals from ingredients, add description, photo, recipe. Manage equivalents and ready meal details. | To create or update a meal.                 | `Button E3003 (On Add New)` / `Click C1005 Item (On Edit)` | [Link to C1004](./components/C1004.md#form-c1004addeditmealform)  |
| E3003 | AddNewMealButton     | Button | Opens the AddEditMealForm for a new meal.                                                                    | To initiate adding a new meal.              | ---                                       | ---       |
| C1005 | MealsList       | List of Dynamic Objects  | Displays existing meals with options to edit or delete.                                                      | To view and manage existing meals.          | ---                                       | [Link to C1005](./components/C1005.md#listofdynamicobjects-c1005mealslist)  |

### **Page P0103.DietPlanningPage**
Allows users to plan meals for days in a calendar view and track calories. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/diet-plan`

| ID    | Name                   | Type      | Functionality                                                                          | Goal                                                              | Trigger                             | Link      |
| :---- | :--------------------- | :-------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :---------------------------------- | :-------- |
| C1006 | CalendarView           | Component | Displays a calendar to select days/ranges for meal planning. Shows daily/weekly calories. | To visually plan meals and track calorie intake.                  | ---                                 | [Link to C1006](./components/C1006.md#component-c1006calendarview)  |
| C1007 | MealAssignmentPanel    | Panel     | Allows users to assign meals to selected dates/times within the calendar.              | To populate the diet plan with specific meals.                    | `Click C1006 Item (On Day Select)`  | [Link to C1007](./components/C1007.md#panel-c1007mealassignmentpanel)  |
| C1008 | DateRangeSelector      | Component | Allows users to select a specific day or range of days to view or plan.                | To define the scope of the diet plan being worked on.             | ---                                 | [Link to C1008](./components/C1008.md#component-c1008daterangeselector)  |

### **Page P0104.SymptomTrackingPage**
Allows users to log symptoms and associate them with meals from the diet plan. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/symptoms/track`

| ID    | Name                 | Type   | Functionality                                                                                    | Goal                                                      | Trigger                             | Link      |
| :---- | :------------------- | :----- | :----------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :---------------------------------- | :-------- |
| C1009 | AddSymptomForm       | Form   | Input symptom details, date, time, notes. Links pre/post meals from diet plan.                   | To record symptom occurrences for analysis.               | `Button E3005 (On Add Symptom)`     | [Link to C1009](./components/C1009.md#form-c1009addsymptomform)  |
| E3005 | AddSymptomButton     | Button | Opens the AddSymptomForm.                                                                        | To initiate logging a new symptom.                        | ---                                 | ---       |
| C1010 | SymptomsLogTable     | Table  | Displays a log of recorded symptoms with details.                                                | To review past symptom entries.                           | ---                                 | [Link to C1010](./components/C1010.md#table-c1010symptomslogtable)  |

### **Page P0105.ShoppingListPage**
Generates a shopping list based on the meal plan for selected days. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/shopping-list`

| ID    | Name                            | Type      | Functionality                                                                   | Goal                                                              | Trigger                     | Link      |
| :---- | :------------------------------ | :-------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------- | :-------------------------- | :-------- |
| C1011 | DateRangeSelectorForShopping    | Component | Allows users to select days from the meal plan for the shopping list.           | To specify the period for the shopping list.                      | ---                         | [Link to C1011](./components/C1011.md#component-c1011daterangeselectorforshopping)  |
| E3006 | GenerateShoppingListButton      | Button    | Triggers generation of the shopping list based on selected dates.               | To create the shopping list.                                      | `Click C1011 (On Dates Set)`| ---       |
| C1012 | ShoppingListDisplay             | Component | Displays the aggregated list of ingredients to buy.                             | To present the shopping list to the user.                         | `Button E3006 (On Click)`   | [Link to C1012](./components/C1012.md#component-c1012shoppinglistdisplay)  |

### **Page P0106.DashboardPage**
Shows correlations between symptoms and food, and tracks last meal times. - [Layout L0001.MainAppLayout](#layout-l0001mainapplayout) - ---
URL: `/dashboard`

| ID    | Name                          | Type      | Functionality                                                                               | Goal                                                              | Trigger                     | Link      |
| :---- | :---------------------------- | :-------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------- | :-------------------------- | :-------- |
| C1013 | SymptomFoodCorrelationChart   | Component | Visualizes potential correlations between logged symptoms and consumed ingredients/meals.   | To help identify food triggers for symptoms.                      | ---                         | [Link to C1013](./components/C1013.md#component-c1013symptomfoodcorrelationchart)  |
| C1014 | LastMealTimeTracker           | Component | Allows users to record last meal time daily and displays trend.                             | To monitor eating patterns, specifically last meal timing.        | ---                         | [Link to C1014](./components/C1014.md#component-c1014lastmealtimetracker)  |
| E3007 | RecordLastMealButton          | Button    | Opens a modal (C1015) to input the last meal time for the current/selected day.             | To log the time of the last meal.                                 | ---                         | ---       |
| C1015 | RecordLastMealModal           | Modal     | Form to input date and time for the last meal.                                              | To capture the last meal time.                                    | `Button E3007 (On Click)`   | [Link to C1015](./components/C1015.md#modal-c1015recordlastmealmodal)  |

---
