# Overview
This is master plan for the documentation of the project. It outlines the structure, content, and organization of the documentation to ensure that it is comprehensive, user-friendly, and easy to navigate.

# Table of Contents
1. [Introduction](#introduction)
2. [Layers of the Documentation](#layers-of-the-documentation)


# Introduction
This form of documentation shows project requirements in layers:
- **Legend**: Contain the content of the legend - the explanation of types, forms, naming conventions etc. It is a guide how to fill and read the documentation.
- **Layouts**: Contain constants elements for pages.
- **Pages**: Contain the content of the page - by functionality but with only those that are accessible by the user - like modals, forms, tables, buttons, etc.
- **Modals, Forms, Popups, etc.**: Contain the content of the more complex elements of the page like modals, forms, etc.
- **Scripts**: Contain the content of the scripts - functionality that is not visible to the user but is necessary for the page to work.

All of the elements that require a more complex explanation will be explained in the dedicated file.

# Layers of the Documentation
## Legend
Legend contains the enumeration of the elements that are used in the documentation. It is a guide how to fill and read the documentation.

### ID Naming
The ID naming convention uses a prefix indicating the element type followed by a unique number based on predefined ranges. Script IDs have a special format.

- **Prefix**: Indicates the element type:
    - **L**: Layout
    - **P**: Page
    - **S**: Script (Used in `SXXXX-E0000` format)
    - **C**: Component, Modal, Form, Panel, Table, List (Parent Elements)
    - **E**: Basic Element (Button, Link, Text, Tooltip - Non-Parent Elements)
- **Number**: A unique identifier within the specified range for the element type:
    - **L`0001`-`0099`**: Layouts
    - **P`0100`-`0799`**: Pages
    - **S`0800`-`0999`**: Scripts (Used as `SXXXX` in `SXXXX-E0000`)
    - **C`1000`-`2999`**: Components, Modals, Forms, etc. (Parent Elements)
    - **E`3000`-`9999`**: Basic Elements (Non-Parent Elements)
- **Script ID Format**: Scripts use the specific format **S`XXXX`-E0000**, where `XXXX` is in the `0800-0999` range.

**Examples:**
- Layout: `L0001`   (All stored in MasterFile)
- Page: `P0100`     (All stored in MasterFile)
- Component (e.g., a Form): `C1011`     (Every component has its own file)
- Button (within a Page or Component): `E3010`  (Every Basic Element has its own file)
- Script: `S0800-E0000`     (Every script has its own file)

### Types
The types of the elements are as follows:
- **Ribbon**: An ribbon that is used to display the navigation. **(Parent element)**
- **Modal**: An element that is a window on which other elements can be placed. It has a purpose of separating the content from the rest of the page. **(Parent element)**
- **Panel**: An element that is a part of the page - a space on which other elements can be placed. It is like a modal but it is displayed on the page and attached to specific place on the page. **(Parent element)**
- **Component**: An element that is a part of the page - a space on which other elements can be placed - like a modal but displayed on the page. It can be a card. **(Parent element)**
- **Table**: A table that is used to display data. **(Parent element)**
- **Form**: A form that is used to collect data from the user.
- **List of Dynamic Objects**: A list of objects like components. It is like a table but it is used to display data in a more visual way. It is dynamic - Objects are dynamically created and displayed.
- **List of Static Objects**: A list of objects like components. It is like a table but it is used to display data in a more visual way. It is not dynamic - Objects are statically defined.
- **Popup**: An element that is a window on which messages can be displayed. It has a purpose of displaying messages to the user and taking quick actions.
- **Button**: A button that is used to trigger an action.
- **Link**: A link that is used to navigate to another page or element.
- **Text**: A text that is used to display information. It can be a label, a title, a description, etc.
- **Tooltip**: A tooltip that is used to display information when the user hovers over an element. It can be a label, a title, a description, etc.


## Layouts
Layout elements are described in the table that contain columns:
- **ID**: The ID of the element.
- **Name**: The name of the element.
- **Type**: The type of the element - like button, table, form, modal, etc.
- **Functionality**: The functionality of the element- short and to the point. It should be max 100 characters long. If longer is required to explain the functionality, it should be explained in the dedicated file.
Example:
    - "After clicking the button, the modal is displayed."
    - "After clicking the button process X is started."
- **Goal**: The goal of the element - short and to the point. It should be max 100 characters long. If longer is required to explain the goal, it should be explained in the dedicated file. 
Example: 
    - "To display the X data in a table format."
    - "To change the status of the Y object."
- **Trigger**: Describes how/when the element becomes visible or active.
    - `---`: Element is always visible/present within its parent.
    - `Button {ID} (Condition)`: Element appears upon clicking the specified button ID, optionally under a specific condition (e.g., `Button E3024 (On Form Fail)`).
    - `Click {ID} Item (Condition)`: Element appears upon clicking an item within the specified list/table ID, optionally under a specific condition (e.g., `Click C1010 Item (On Selection)`).
    - `Other: {Description}`: Element appears due to other system events or states (e.g., `Other: Page Load (Access Denied)`).
- **Link**: If it is a Parent element, it should be linked to the section of the documentation where it is described. If it is a non-parent element then it should be '---'.

Layout table must have title in the following format:<br>
> **Layout L[0001-0099].[Name]**<br>

It should contain the short description of the layout purpose (max 100 characters). If the layout described in the dedicated file, it should be also linked here.
> [Description of the layout] - [Link to the dedicated file if exists]

## Pages
Pages are the user views. Everything functionality that is accessible by the user should be described in the page. Page inherits functionality from the layout - if it is based on the layout. 

Each page should be either **based on the layout** or **self-contained**. 

Page must be linked with the url.

Page elements are described in the table - the same as for the layouts -> see [Layouts](#layouts).

Page table must have title in the following format:<br>
> **Page P[0100-0799].[Name]**<br>

It should contain the short description of the page purpose (max 100 characters) and the link to the layout - it it is layout based. If the page described in the dedicated file, it should be also linked here.
> [Description of the page] - [Link to the layout if used] - [Link to the dedicated file if exists]

## Components, Modals, Forms, etc. (Parent elements)
Modals, Forms and other parent elements are the elements that are used in the pages/layouts/other parent elements. They **cannot be self-contained**. 

Modals, forms, etc. can be placed inside other modals recursively.

Table with the elements is the same as for the layouts and pages - see [Layouts](#layouts).

Table must have title in the following format:<br>
> **[Type] C[1000-2999].[Name]**<br>

Every Components, Modal, Form, etc. must be documented in new Markdown file with name equal its ID.

It should contain the short description of the element (max 100 characters) and the link to the page or layout where it is used. If the element described in the dedicated file, it should be also linked here.
> [Description of the element] - [Link to the parent] - [Link to the dedicated file if exists]

## Scripts
In this section all the backend specific processes are described. It is not visible to the user - it means that it cannot be triggered by the user directly from the page. 

It can be scheduled or triggered by the admin or by the system on event.

Every Script must be documented in new Markdown file with name equal its ID.

Scripts are described in the table that contains columns:
- **ID**: The ID of the script - in format **S[0800-0999]-E0000**.
- **Name**: The name of the script.
- **Description**: The description of the script - short and to the point. It should describe the purpose of the script.
- **Functionality**: The functionality of the script - short and to the point. It should be max 100 characters long. If longer is required to explain the functionality, it should be explained in the dedicated file.
- **Entry Point**: The entry point of the script - the function/file that is called to trigger the script.
