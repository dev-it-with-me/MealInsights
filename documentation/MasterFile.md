# MealInsight Master Documentation File

This document outlines the main layouts, pages, and components for the MealInsight application, following the structure defined in the [ApplicationCodeDocumentation.md](/.github/ApplicationCodeDocumentation.md).

## Legend
For details on ID Naming, Types, and other conventions, please refer to the [ApplicationCodeDocumentation.md](/.github/ApplicationCodeDocumentation.md).

---

## Layouts

**Layout L0001.MainAppLayout**
Provides a consistent navigation structure for all pages.

| ID                               | Name           | Type   | Functionality                                        | Goal                                              | Trigger | Tickets | Current Version                    |
| :------------------------------- | :------------- | :----- | :--------------------------------------------------- | :------------------------------------------------ | :------ | :------ | :--------------------------------- |
| E3000 [↗](#e3000-navigationmenu) | NavigationMenu | Ribbon | Displays links to all main pages of the application. | To allow users to navigate to different sections. | ---     | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Element E3000.NavigationMenu {#e3000-navigationmenu}
Displays links to all main pages of the application. This ribbon is part of `L0001.MainAppLayout`.
(No further sub-elements defined for E3000 in this context)

---

## Pages

**Page P0100.ManageItemsPage**
Allows users to add, view, edit, and delete both ingredients and products in a unified interface. Provides comprehensive management and viewing capabilities for all items. - Based on [L0001.MainAppLayout [↗](#l0001-mainapplayout)](#l0001-mainapplayout)
URL: `/ingredients`

| ID                                             | Name                     | Type                    | Functionality                                                                                      | Goal                                                      | Trigger                                              | Tickets | Current Version                    |
| :--------------------------------------------- | :----------------------- | :---------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------- | :------ | :--------------------------------- |
| C1000 [↗](#c1000-addeditingredientform)        | AddEditIngredientForm    | Form                    | Allows input/edit of ingredient details (name, photo, shop, calories, macros, tags).               | To create or update an ingredient.                        | `Button E3001 (On Add New)` / `Click C1025 Item (On Edit)` | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1024 [↗](#c1024-addeditproductform)           | AddEditProductForm       | Form                    | Allows input/edit of product details (name, brand, package size, calories, macros, tags). | To create or update a product.                            | `Button E3002 (On Add New)` / `Click C1025 Item (On Edit)` | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3001                                          | AddNewIngredientButton   | Button                  | Opens the AddEditIngredientForm for a new ingredient.                                              | To initiate adding a new ingredient.                      | ---                                                  | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3002                                          | AddNewProductButton      | Button                  | Opens the AddEditProductForm for a new product.                                                    | To initiate adding a new product.                         | ---                                                  | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1025 [↗](#c1025-unifieditemslist)             | UnifiedItemsList         | List of Dynamic Objects | Displays both ingredients and products with unified filtering and management capabilities.           | To view and manage all items in one interface.            | ---                                                  | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0100.ManageItemsPage {#p0100-manageitemspage}
This page allows users to manage both ingredients and products. It provides forms for adding/editing items and a unified list for viewing and managing them. It is based on `L0001.MainAppLayout`.

## Form C1000.AddEditIngredientForm {#c1000-addeditingredientform}
Allows input/edit of ingredient details (name, photo, shop, calories, macros, tags). This form is part of `P0100.ManageItemsPage`.
Key fields and controls within this form are:
- **NameField (Text Input):** Input for ingredient name. Goal: To capture the ingredient's name.
- **PhotoUploadField (File Input):** Input for ingredient photo. Goal: To upload an image for the ingredient.
- **ShopField (Text Input):** Input for the shop where ingredient was bought. Goal: To record the source of the ingredient.
- **CaloriesField (Number Input):** Input for ingredient calories. Goal: To capture calorie information.
- **MacrosProteinField (Number Input):** Input for ingredient protein amount (grams). Goal: To capture protein macro information.
- **MacrosCarbsField (Number Input):** Input for ingredient carbohydrate amount (grams). Goal: To capture carbohydrate macro information.
- **MacrosSugarField (Number Input):** Input for ingredient sugar amount (grams). Goal: To capture sugar macro information.
- **MacrosFatField (Number Input):** Input for ingredient fat amount (grams). Goal: To capture fat macro information.
- **MacrosFiberField (Number Input):** Input for ingredient fiber amount (grams). Goal: To capture fiber macro information.
- **MacrosSaturatedFatField (Number Input):** Input for ingredient saturated fat amount (grams). Goal: To capture saturated fat macro information.
- **TagsField (Tag Input):** Input for assigning tags (e.g., vege, meat, diet). Goal: To categorize the ingredient.
- **SubmitIngredientButton (Button):** Submits the form to add/update the ingredient. Goal: To save the ingredient details.
- **CancelButton (Button):** Cancels the form and closes it. Goal: To discard changes and close the form.

## Form C1024.AddEditProductForm {#c1024-addeditproductform}
AddEditProductForm is a modal-based form component for creating and editing product entries with product-specific fields and validation. This form is part of `P0100.ManageItemsPage`.
Purpose:
- Create new product entries
- Edit existing product information
- Validate product data using Zod schemas
- Handle product-specific fields (brand, package size, ingredients composition)

Key Fields/Features:
- Basic Information: Name (required), Brand (optional),  Package size in g or ml (optional)
- Nutritional Information (per 100g): Calories, Protein, Carbohydrates, Fat, Fiber
- Classification: Diet tags (multi-select), Ingredients composition (textarea)
- Modal Interface, Zod schema validation, Dual Mode (Create/Edit)

Beside all of the fields from `C1000.AddEditIngredientForm`, it includes:
- **BrandField (Text Input):** Input for product brand. Goal: To capture the brand of the product.
- **Add Ingredients:** Button to add ingredients to the product. Goal: To associate ingredients with the product. - It add the field in form that allows to add ingredients to the product - you can search for ingredients by name and select them, and they will be added to the product's ingredients composition. It Ingredient does not have to be in the system, user can also add it from here.

## List of Dynamic Objects C1025.UnifiedItemsList {#c1025-unifieditemslist}
UnifiedItemsList is a comprehensive component that displays both ingredients and products in a unified interface with filtering, sorting, and management capabilities. This list is part of `P0100.ManageItemsPage`.
Purpose:
- Display ingredients and products in a single unified list
- Provide filtering by name, type (ingredient/product), and tags
- Enable management actions (edit/delete) when appropriate handlers are provided
- Support adding new ingredients and products through action buttons

Key Features:
- Unified Display: Shows both ingredients and products with type indicators
- Advanced Filtering: Filter by name, type, and diet tags
- Management Actions: Edit and delete functionality
- Add Buttons: Separate buttons for adding ingredients and products
- Data Structure: Uses `UnifiedItem` (id, name, type, tags, additionalInfo)

---

**Page P0102.ManageMealsPage**
Allows users to create, view, edit, and delete meals. - Based on [L0001.MainAppLayout [↗](#l0001-mainapplayout)](#l0001-mainapplayout)
URL: `/meals/manage`

| ID                                       | Name               | Type                    | Functionality                                                                                                | Goal                                        | Trigger                                     | Tickets | Current Version                    |
| :--------------------------------------- | :----------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :------------------------------------------ | :------ | :--------------------------------- |
| C1004 [↗](#c1004-addeditmealform)        | AddEditMealForm    | Form                    | Compose meals from ingredients, add description, photo, recipe. Manage equivalents and ready meal details. | To create or update a meal.                 | `Button E3003 (On Add New)` / `Click C1005 Item (On Edit)` | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3003                                    | AddNewMealButton   | Button                  | Opens the AddEditMealForm for a new meal.                                                                    | To initiate adding a new meal.              | ---                                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1005 [↗](#c1005-mealslist)              | MealsList          | List of Dynamic Objects | Displays existing meals with options to edit or delete.                                                      | To view and manage existing meals.          | ---                                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0102.ManageMealsPage {#p0102-managemealspage}
This page allows users to manage their meals, including creation, editing, and viewing. It is based on `L0001.MainAppLayout`.

## Form C1004.AddEditMealForm {#c1004-addeditmealform}
Compose meals from ingredients, add description, photo, recipe. Manage equivalents and ready meal details. This form is part of `P0102.ManageMealsPage`.
Key elements of this form include:
- **MealNameField (Text Input):** Input for meal name. Goal: To capture the meal's name.
- **MealPhotoUploadField (File Input):** Input for meal photo. Goal: To upload an image for the meal.
- **MealRecipeEditor (Rich Text Editor):** Input for meal recipe using a basic text editor. Goal: To write down the preparation steps for the meal.
- **C1020 IngredientSelectorForMeal [↗](#c1020-ingredientselectorformeal) (Component):** Allows selecting ingredients/products and specifying quantities for the meal. Goal: To compose the meal from available ingredients and products.
- **C1021 IngredientEquivalentsManager [↗](#c1021-ingredientequivalentsmanager) (Component):** For each ingredient/product in the meal, allows specifying equivalent ingredients/products. Goal: To offer flexibility in meal preparation.
- **CalculateCaloriesAndMacrosButton (Button):** Calculates total calories and macros for the meal based on selected ingredients. Goal: To auto-calculate nutritional values for the meal.
- **MealCaloriesField (Number Input):** Input for total meal calories (can be auto-calculated or manually overridden). Goal: To set/view the meal's total calorie count.
- **MealMacrosProteinField (Number Input):** Input for meal protein (can be auto-calculated or manually overridden). Goal: To set/view the meal's total protein.
- **MealMacrosCarbsField (Number Input):** Input for meal carbs (can be auto-calculated or manually overridden). Goal: To set/view the meal's total carbs.
- **MealMacrosSugarField (Number Input):** Input for meal sugar (can be auto-calculated or manually overridden). Goal: To set/view the meal's total sugar.
- **MealMacrosFatField (Number Input):** Input for meal fat (can be auto-calculated or manually overridden). Goal: To set/view the meal's total fat.
- **MealMacrosFiberField (Number Input):** Input for meal fiber (can be auto-calculated or manually overridden). Goal: To set/view the meal's total fiber.
- **MealMacrosSaturatedFatField (Number Input):** Input for meal saturated fat (can be auto-calculated or manually overridden). Goal: To set/view the meal's total saturated fat.
- **MealTagsField (Tag Input):** Input for assigning/modifying tags for the meal. Goal: To categorize the meal (inherits from ingredients, can be modified).
- **SubmitMealButton (Button):** Submits the form to add/update the meal. Goal: To save the meal details.
- **CancelMealButton (Button):** Cancels the form and closes it. Goal: To discard changes and close the form.

## Component C1020.IngredientSelectorForMeal {#c1020-ingredientselectorformeal}
Allows selecting ingredients and products and specifying quantities for the meal. This component is part of `C1004.AddEditMealForm`.
It includes:
- **IngredientSearchField (Text Input/Search):** Allows searching for available ingredients/products by name. Goal: To quickly find ingredients/products to add to the meal.
- **C1024 SearchResultsList (List):** Displays ingredients and products matching the search query. Goal: To present selectable ingredients and products to the user.
- **QuantityInput (Number Input):** Input for specifying the quantity of the selected ingredient/product (e.g., grams, pcs). Goal: To define how much of an ingredient/product is used in the meal.
- **UnitSelector (Dropdown/Select):** Allows selecting the unit for the quantity (e.g., g, ml, piece). Goal: To specify the measurement unit for the ingredient/product quantity.
- **AddIngredientToMealButton (Button):** Adds the selected ingredient/product with specified quantity to the current meal's list. Goal: To include the ingredient/product in the meal composition.
- **C1025 SelectedIngredientsForMeal (Table/List):** Displays ingredients and products already added to the meal, with quantities and options to remove. Goal: To show the current composition of the meal and allow modifications.
*Note: C1024 and C1025 within C1020 are local list components, not the page-level C1024/C1025.*

## Component C1021.IngredientEquivalentsManager {#c1021-ingredientequivalentsmanager}
For each ingredient/product in the meal, allows specifying equivalent ingredients/products. This component is part of `C1004.AddEditMealForm`.
Key elements are:
- **MealIngredientDropdown (Dropdown/Select):** Selects an ingredient/product from the current meal to manage its equivalents. Goal: To choose which meal ingredient/product to define alternatives for. (Trigger: `Changes in C1025 (SelectedIngredientsForMeal)`)
- **C1026 EquivalentIngredientSearch (Component):** Allows searching and selecting ingredients/products that can be used as equivalents. Goal: To find and add alternative ingredients/products. (Trigger: `Selection in MealIngredientDropdown`)
- **AddEquivalentButton (Button):** Adds the selected ingredient/product from C1026 as an equivalent. Goal: To list an alternative for the chosen meal ingredient/product. (Trigger: `Selection in C1026 and MealIngredientDropdown`)
- **C1027 CurrentEquivalentsList (List):** Displays the list of equivalents for the meal ingredient/product selected in MealIngredientDropdown. Goal: To show currently defined alternatives for a specific ingredient/product. (Trigger: `Selection in MealIngredientDropdown / Click AddEquivalentButton`)
*Note: C1026 and C1027 within C1021 are local list/component, not page-level components.*

## List of Dynamic Objects C1005.MealsList {#c1005-mealslist}
Displays existing meals with options to edit or delete. This list is part of `P0102.ManageMealsPage`.
Each item in the list (typically a meal card) includes:
- **NameColumn (Meal Card Property):** Displays the name of the meal. Goal: To show meal names.
- **PhotoColumn (Meal Card Property):** Displays the photo of the meal. Goal: To visually identify meals.
- **DescriptionColumn (Meal Card Property):** Displays a short description of the meal. Goal: To provide a brief overview of the meal.
- **CaloriesColumn (Meal Card Property):** Displays the total calories of the meal. Goal: To show meal's caloric content.
- **TagsColumn (Meal Card Property):** Displays tags associated with the meal. Goal: To show meal categories.
- **ActionsColumn (Meal Card Property):** Contains action buttons:
    - **EditMealButton (Button):** Opens `C1004.AddEditMealForm` populated with the selected meal's data. Goal: To allow editing of an existing meal.
    - **DeleteMealButton (Button):** Prompts for confirmation and then deletes the selected meal. Goal: To allow removal of a meal.

---

**Page P0103.DietPlanningPage**
Allows users to plan meals for days in a calendar view and track calories. - Based on [L0001.MainAppLayout [↗](#l0001-mainapplayout)](#l0001-mainapplayout)
URL: `/diet-plan`

| ID                                                   | Name                   | Type      | Functionality                                                                          | Goal                                                              | Trigger                             | Tickets | Current Version                    |
| :--------------------------------------------------- | :--------------------- | :-------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :---------------------------------- | :------ | :--------------------------------- |
| C1006 [↗](#c1006-calendarview)                       | CalendarView           | Component | Displays a calendar to select days/ranges for meal planning. Shows daily/weekly calories. | To visually plan meals and track calorie intake.                  | ---                                 | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1007 [↗](#c1007-mealassignmentpanel)                | MealAssignmentPanel    | Panel     | Allows users to assign meals to selected dates/times within the calendar.              | To populate the diet plan with specific meals.                    | `Click C1006 Item (On Day Select)`  | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1008 [↗](#c1008-daterangeselector)                  | DateRangeSelector      | Component | Allows users to select a specific day or range of days to view or plan.                | To define the scope of the diet plan being worked on.             | ---                                 | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0103.DietPlanningPage {#p0103-dietplanningpage}
This page enables users to plan their meals using a calendar interface and monitor calorie intake. It is based on `L0001.MainAppLayout`.

## Component C1006.CalendarView {#c1006-calendarview}
Displays a calendar to select days/ranges for meal planning. Shows daily/weekly calories. This component is part of `P0103.DietPlanningPage`.
Key features and elements:
- **E3070 PreviousMonthButton (Button):** Navigates the calendar to the previous month. Goal: To change the displayed month.
- **E3071 NextMonthButton (Button):** Navigates the calendar to the next month. Goal: To change the displayed month.
- **E3072 MonthYearDisplay (Text):** Shows the current month and year being viewed. Goal: To inform the user of the current calendar view.
- **DayCell (Calendar Cell):** Represents a single day. Displays planned meals and total calories for the day. Goal: To show planned meals and allow selection for detailed planning.
- **E3073 WeeklyCaloriesSummary (Text):** Displays total calories for the visible week(s). Goal: To provide a weekly overview of calorie intake.

## Panel C1007.MealAssignmentPanel {#c1007-mealassignmentpanel}
Allows users to assign meals to selected dates/times within the calendar. This panel is part of `P0103.DietPlanningPage`.
It includes:
- **E3080 SelectedDateDisplay (Text):** Shows the date(s) selected in `C1006.CalendarView` for meal assignment. Goal: To confirm the target date for meal planning. (Trigger: `Click C1006 Item (On Day Select)`)
- **C1022 MealSearchSelect [↗](#c1022-mealsearchselect) (Component):** Allows searching and selecting an existing meal to assign. Goal: To choose a meal for the selected date/time.
- **E3081 MealTimeInput (Time Input/Select):** Allows specifying the time for the meal (e.g., Breakfast, Lunch, Dinner, Snack). Goal: To schedule the meal at a specific time of day.
- **E3082 AssignMealButton (Button):** Assigns the selected meal from C1022 to the selected date/time. Goal: To add the meal to the diet plan.
- **C1023 PlannedMealsListForDay [↗](#c1023-plannedmealslistforday) (List):** Displays meals already planned for the selected day, with options to remove. Goal: To view and manage meals for the currently selected day. (Trigger: `Click C1006 Item (On Day Select)`)

## Component C1022.MealSearchSelect {#c1022-mealsearchselect}
Allows searching and selecting an existing meal to assign. This component is part of `C1007.MealAssignmentPanel`.
Its elements are:
- **E3190 MealSearchInput (Text Input/Search):** Allows searching for existing meals by name or tags. Goal: To quickly find a meal to assign to the diet plan.
- **C1028 MealSearchResultsList (List):** Displays meals matching the search query, with brief details (e.g., calories). Goal: To present selectable meals to the user for diet planning.
- **E3191 SelectMealButton (Button in row):** Selects a meal from the C1028 list for assignment. Goal: To confirm the meal choice for adding to the plan.
*Note: C1028 within C1022 is a local list component.*

## List C1023.PlannedMealsListForDay {#c1023-plannedmealslistforday}
Displays meals already planned for the selected day, with options to remove. This list is part of `C1007.MealAssignmentPanel`.
Each item in the list typically includes:
- **MealNameDisplay (Text - List Item):** Displays the name of a planned meal. Goal: To identify the meal in the daily plan.
- **MealTimeDisplay (Text - List Item):** Displays the planned time for the meal. Goal: To show when the meal is scheduled.
- **RemoveMealFromPlanButton (Button in row):** Removes the specific meal from the selected day's plan. Goal: To allow users to unassign a meal from their diet plan for the day.
- **MealDetailsLink (Link - List Item):** (Optional) Links to the meal's full details. Goal: To provide quick access to more information about the planned meal.
(All triggered by: `Click C1006 Item (On Day Select)`)

## Component C1008.DateRangeSelector {#c1008-daterangeselector}
Allows users to select a specific day or range of days to view or plan. This component is part of `P0103.DietPlanningPage`.
It consists of:
- **E3090 StartDateField (Date Input):** Input for the start date of the range. Goal: To define the beginning of the period.
- **E3091 EndDateField (Date Input):** Input for the end date of the range. Goal: To define the end of the period.
- **E3092 ApplyDateRangeButton (Button):** Applies the selected date range to the calendar view. Goal: To update `C1006.CalendarView` to show the selected range.
- **E3093 ViewDayButton (Radio/Button):** Selects 'Day' view mode for the calendar. Goal: To switch calendar to single day planning focus.
- **E3094 ViewWeekButton (Radio/Button):** Selects 'Week' view mode for the calendar. Goal: To switch calendar to weekly planning focus.
- **E3095 ViewRangeButton (Radio/Button):** Selects 'Range' view mode for the calendar. Goal: To switch calendar to custom range planning focus.

---

**Page P0104.SymptomTrackingPage**
Allows users to log symptoms and associate them with meals from the diet plan. - Based on [L0001.MainAppLayout [↗](#l0001-mainapplayout)](#l0001-mainapplayout)
URL: `/symptoms/track`

| ID                                           | Name                 | Type   | Functionality                                                                                    | Goal                                                      | Trigger                             | Tickets | Current Version                    |
| :------------------------------------------- | :------------------- | :----- | :----------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :---------------------------------- | :------ | :--------------------------------- |
| C1009 [↗](#c1009-addsymptomform)             | AddSymptomForm       | Form   | Input symptom details, date, time, notes. Links pre/post meals from diet plan.                   | To record symptom occurrences for analysis.               | `Button E3005 (On Add Symptom)`     | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3005                                        | AddSymptomButton     | Button | Opens the AddSymptomForm.                                                                        | To initiate logging a new symptom.                        | ---                                 | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1010 [↗](#c1010-symptomslogtable)           | SymptomsLogTable     | Table  | Displays a log of recorded symptoms with details.                                                | To review past symptom entries.                           | ---                                 | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0104.SymptomTrackingPage {#p0104-symptomtrackingpage}
This page allows users to log their symptoms and associate them with meals, aiding in identifying potential food triggers. It is based on `L0001.MainAppLayout`.

## Form C1009.AddSymptomForm {#c1009-addsymptomform}
Input symptom details, date, time, notes. Links pre/post meals from diet plan. This form is part of `P0104.SymptomTrackingPage`.
Key fields are:
- **SymptomNameField (Text Input):** Input for the name or description of the symptom. Goal: To record what the symptom is.
- **SymptomDateField (Date Input):** Input for the date the symptom occurred. Goal: To record when the symptom occurred.
- **SymptomTimeField (Time Input):** Input for the time the symptom occurred. Goal: To record the precise time of the symptom.
- **MealBeforeSymptomSelector (Select):** Automatically suggests/allows selecting meal eaten before symptom from plan. Goal: To link symptom to a preceding meal.
- **MealAfterSymptomSelector (Select):** Automatically suggests/allows selecting meal eaten after symptom from plan. Goal: To link symptom to a subsequent meal.
- **SymptomNotesField (Text Area):** Input for any additional notes about the symptom. Goal: To add more context or details about the symptom.
- **SubmitSymptomButton (Button):** Submits the form to log the symptom. Goal: To save the symptom entry.
- **CancelSymptomButton (Button):** Cancels the form and closes it. Goal: To discard the symptom entry.

## Table C1010.SymptomsLogTable {#c1010-symptomslogtable}
Displays a log of recorded symptoms with details. This table is part of `P0104.SymptomTrackingPage`.
The table columns include:
- **SymptomNameColumn (Table Column):** Displays the name/description of the symptom. Goal: To identify the symptom.
- **DateTimeColumn (Table Column):** Displays the date and time the symptom occurred. Goal: To show when the symptom was recorded.
- **MealBeforeColumn (Table Column):** Displays the meal recorded as eaten before the symptom. Goal: To show potential dietary links.
- **MealAfterColumn (Table Column):** Displays the meal recorded as eaten after the symptom. Goal: To show potential dietary links.
- **NotesColumn (Table Column):** Displays any additional notes for the symptom. Goal: To provide more context.
Row actions include:
- **EditSymptomButton (Button in row):** Opens `C1009.AddSymptomForm` populated with the selected symptom's data. Goal: To allow editing of a logged symptom.
- **DeleteSymptomButton (Button in row):** Prompts for confirmation and then deletes the selected symptom log. Goal: To allow removal of a symptom log.

---

**Page P0105.ShoppingListPage**
Generates a shopping list based on the meal plan for selected days. - Based on [L0001.MainAppLayout [↗](#l0001mainapplayout)](#l0001mainapplayout)
URL: `/shopping-list`

| ID                                                           | Name                            | Type      | Functionality                                                                   | Goal                                                              | Trigger                     | Tickets | Current Version                    |
| :----------------------------------------------------------- | :------------------------------ | :-------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------- | :-------------------------- | :------ | :--------------------------------- |
| C1011 [↗](#c1011-daterangeselectorforshopping)               | DateRangeSelectorForShopping    | Component | Allows users to select days from the meal plan for the shopping list.           | To specify the period for the shopping list.                      | ---                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3006                                                        | GenerateShoppingListButton      | Button    | Triggers generation of the shopping list based on selected dates.               | To create the shopping list.                                      | `Click C1011 (On Dates Set)`| TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1012 [↗](#c1012-shoppinglistdisplay)                        | ShoppingListDisplay             | Component | Displays the aggregated list of ingredients to buy.                             | To present the shopping list to the user.                         | `Button E3006 (On Click)`   | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0105.ShoppingListPage {#p0105-shoppinglistpage}
This page generates a shopping list based on the user's meal plan for a selected date range. It is based on `L0001.MainAppLayout`.

## Component C1011.DateRangeSelectorForShopping {#c1011-daterangeselectorforshopping}
Allows users to select days from the meal plan for the shopping list. This component is part of `P0105.ShoppingListPage`.
It includes:
- **E3120 ShoppingStartDateField (Date Input):** Input for the start date of the meal plan period for shopping list. Goal: To define the beginning of the period for the shopping list.
- **E3121 ShoppingEndDateField (Date Input):** Input for the end date of the meal plan period for shopping list. Goal: To define the end of the period for the shopping list.
- **E3122 SetDatesForShoppingButton (Button):** Confirms the date range for shopping list generation. Goal: To finalize the period for which ingredients will be aggregated.

## Component C1012.ShoppingListDisplay {#c1012-shoppinglistdisplay}
Displays the aggregated list of ingredients to buy. Sorted by days and meals for readability. This component is part of `P0105.ShoppingListPage`.
The list displays items with the following information:
- **IngredientNameColumn (List Item):** Displays the name of the ingredient needed. Goal: To list ingredients to buy.
- **QuantityColumn (List Item):** Displays the total quantity of the ingredient needed. Goal: To show how much of each ingredient to buy.
- **ShopSuggestionColumn (List Item):** Suggests shops for ingredients if data is available. Goal: To help with shopping efficiency.
- **PlannedMealColumn (List Item):** Shows for which meal this ingredient will be used. Goal: To show user the purpose of the ingredient.
- **PlannedDayColumn (List Item):** Shows for which day this ingredient will be used. Goal: To show user the planned day of use of the ingredient.
Actions available for the list:
- **E3130 PrintShoppingListButton (Button):** Allows printing the shopping list. Goal: To get a physical copy of the list.
- **E3131 ExportShoppingListButton (Button):** Allows exporting the shopping list (e.g., as CSV, PDF). Goal: To share or use the list in other applications.
(All display elements are triggered by `Button E3006 (On Click)`)

---

**Page P0106.DashboardPage**
Shows correlations between symptoms and food, and tracks last meal times. - Based on [L0001.MainAppLayout [↗](#l0001-mainapplayout)](#l0001-mainapplayout)
URL: `/dashboard`

| ID                                                       | Name                          | Type      | Functionality                                                                               | Goal                                                              | Trigger                     | Tickets | Current Version                    |
| :------------------------------------------------------- | :---------------------------- | :-------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------- | :-------------------------- | :------ | :--------------------------------- |
| C1013 [↗](#c1013-symptomfoodcorrelationchart)            | SymptomFoodCorrelationChart   | Component | Visualizes potential correlations between logged symptoms and consumed ingredients/meals.   | To help identify food triggers for symptoms.                      | ---                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1014 [↗](#c1014-lastmealtimetracker)                    | LastMealTimeTracker           | Component | Allows users to record last meal time daily and displays trend.                             | To monitor eating patterns, specifically last meal timing.        | ---                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| E3007                                                    | RecordLastMealButton          | Button    | Opens a modal (C1015) to input the last meal time for the current/selected day.             | To log the time of the last meal.                                 | ---                         | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |
| C1015 [↗](#c1015-recordlastmealmodal)                    | RecordLastMealModal           | Modal     | Form to input date and time for the last meal.                                              | To capture the last meal time.                                    | `Button E3007 (On Click)`   | TBD     | DEV:-,QA:-,UAT:-,PPRD:-,PROD:- |

---
## Page P0106.DashboardPage {#p0106-dashboardpage}
This page provides users with insights into symptom-food correlations and tracks their last meal times. It is based on `L0001.MainAppLayout`.

## Component C1013.SymptomFoodCorrelationChart {#c1013-symptomfoodcorrelationchart}
Visualizes potential correlations between logged symptoms and consumed ingredients/meals. This component is part of `P0106.DashboardPage`.
Key elements are:
- **E3140 ChartDisplayArea (Chart):** Displays the correlation data visually (e.g., bar chart, scatter plot). Goal: To help users identify patterns between diet and symptoms.
- **E3141 SymptomFilterForChart (Select):** Allows selecting specific symptoms to focus the correlation analysis. Goal: To narrow down the analysis to particular symptoms of interest.
- **E3142 IngredientFilterForChart (Select):** Allows selecting specific ingredients/meals to focus the correlation. Goal: To narrow down the analysis to particular foods of interest.
- **E3143 TimePeriodFilterForChart (Date Range):** Allows selecting a time period for the correlation analysis. Goal: To analyze correlations over specific durations.

## Component C1014.LastMealTimeTracker {#c1014-lastmealtimetracker}
Allows users to record last meal time daily and displays trend. This component is part of `P0106.DashboardPage`.
It includes:
- **E3150 LastMealTimeChart (Chart):** Displays a trend of the last meal times recorded over a period. Goal: To visualize patterns in evening eating habits.
- **E3151 DateFilterForTrend (Date Range):** Allows selecting a time period for viewing the last meal time trend. Goal: To focus the trend view on a specific period.

## Modal C1015.RecordLastMealModal {#c1015-recordlastmealmodal}
Form to input date and time for the last meal. This modal is part of `P0106.DashboardPage`.
Fields within this modal:
- **LastMealDateField (Date Input):** Input for the date of the last meal. Goal: To record the date of the last meal.
- **LastMealTimeField (Time Input):** Input for the time of the last meal. Goal: To record the time of the last meal.
- **SubmitLastMealTimeButton (Button):** Submits the last meal date and time. Goal: To save the last meal information.
- **CancelLastMealTimeButton (Button):** Cancels and closes the modal without saving. Goal: To discard the input and close the modal.
(All elements are triggered by `Button E3007 (On Click)`)
