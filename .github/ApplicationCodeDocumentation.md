# Overview
This is master plan for the documentation of the project. It outlines the structure, content, and organization of the documentation to ensure that it is comprehensive, user-friendly, and easy to navigate. It is designed to provide a clear understanding of the project requirements, functionality, and technical specifications, therefore it cannot be packed with unnecessary details - it should be focused on the business requirements and functionality of the application.

# Table of Contents
1. [Introduction](#introduction)
2. [Layers of the Documentation](#layers-of-the-documentation)
3. [Documentation Creation Process](#documentation-creation-process)


# Introduction
This form of documentation shows project requirements in layers:
- **Legend**: Contain the content of the legend - the explanation of types, forms, naming conventions etc. It is a guide how to fill and read the documentation.
- **Layouts**: Contain contacts elements for pages.
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
    - **S**: Script (Used in 'SXXXX-E0000' format)
    - **C**: Component, Modal, Form, Panel, Table, List (Parent Elements)
    - **E**: Basic Element (Button, Link, Text, Tooltip - Non-Parent Elements)
- **Number**:  unique identifier within the specified range for the element type:
    - **L0001-0099**: Layouts
    - **P0100-0799**: Pages
    - **S0800-0999**: Scripts (Used as 'SXXXX' in 'SXXXX-E0000')
    - **C1000-2999**: Components, Modals, Forms, etc. (Parent Elements)
    - **E3000-9999**: Basic Elements (Non-Parent Elements)
- **Script ID Format**: Scripts use the specific format **S'XXXX'-E0000**, where 'XXXX' is in the '0800-0999' range.

**Examples:**
- Layout: 'L0001'
- Page: 'P0100'
- Component (e.g., a Form): 'C1011'
- Button (within a Page or Component): 'E3010'
- Script: 'S0800-E0000'

### Types
The types of the elements are as follows:
- **Ribbon**: An ribbon that is used to display the navigation. **(Parent element)**
- **Modal**: An element that is a window on which other elements can be placed. It has a purpose of separating the content from the rest of the page. **(Parent element)**
- **Panel**: An element that is a part of the page - a space on which other elements can be placed. It is like a modal but it is displayed on the page and attached to specific place on the page. **(Parent element)**
- **Component**: An element that is a part of the page - a space on which other elements can be placed - like a modal but displayed on the page. It can be a card. **(Parent element)**
- **Table**: A table that is used to display data. **(Parent element)**
- **Authorization/Authentication**: Elements related to user access control and identity verification. **(Parent element)**
- **Form**: A form that is used to collect data from the user.
- **List of Dynamic Objects**: A list of objects like components. It is like a table but it is used to display data in a more visual way. It is dynamic - Objects are dynamically created and displayed.
- **List of Static Objects**: A list of objects like components. It is like a table but it is used to display data in a more visual way. It is not dynamic - Objects are statically defined.
- **Popup**: An element that is a window on which messages can be displayed. It has a purpose of displaying messages to the user and taking quick actions.
- **Button**: A button that is used to trigger an action.
- **Link**: A link that is used to navigate to another page or element.
- **Text**: A text that is used to display information. It can be a label, a title, a description, etc.
- **Tooltip**: A tooltip that is used to display information when the user hovers over an element. It can be a label, a title, a description, etc.

It can be non-visible element of the page. Like Authorization/Authentication.


## Layouts
Layout elements are described in the table that contain columns:
- **ID**: The ID of the element. For parent elements (Layouts, Pages, Components, etc.), add a link to their section within the document using the format: `ID [↗](#lowercase-hyphenated-id)`. For example: `L0001 [↗](#l0001-main-layout)` or `C1001 [↗](#c1001-navigation-panel)`. Basic elements (E3000-E9999) do not need links.For parent elements (Layouts, Pages, Components, etc.), include an anchor link to their detailed section within the same file using the format `ID [↗](#id-name)`, where id-name is lowercase with hyphens. Example: `C1001 [↗](#c1001-main-navigation)`. Basic elements (E3000-E9999) do not need anchor links.
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
    - '---': Element is always visible/present within its parent.
    - 'Button {ID} (Condition)': Element appears upon clicking the specified button ID, optionally under a specific condition (e.g., 'Button E3024 (On Form Fail)').
    - 'Click {ID} Item (Condition)': Element appears upon clicking an item within the specified list/table ID, optionally under a specific condition (e.g., 'Click C1010 Item (On Selection)').
    - 'Other: {Description}': Element appears due to other system events or states (e.g., 'Other: Page Load (Access Denied)').
- **Tickets**: Each change request or issue related to the element should be tracked here.
- **Current Version**: The current version of the element on every environment - DEV, QA, UAT, PPRD, PROD.

Layout table must have title in the following format:<br>
> **Layout L[0001-0099].[Name]**<br>

It should contain the short description of the layout purpose (max 100 characters).
> [Description of the layout]

**IMPORTANT**: Layouts should only contain necessary elements that are used in many pages. Do not add placeholder containers for page-specific content - it is not frontend development documentation. Layouts should be used to describe the functionality of the page, not to show empty containers. 

## Pages
Pages are the user views. Everything functionality that is accessible by the user should be described in the page. Page inherits functionality from the layout - if it is based on the layout. 

Each page should be either **based on the layout** or **self-contained**. 

Page must be linked with the url.

Page elements are described in the table - the same as for the layouts -> see [Layouts](#layouts).

Page table must have title in the following format:<br>
> **Page P[0100-0799].[Name]**<br>

It should contain the short description of the page purpose (max 100 characters) and the layout ID if it is layout based.
> [Description of the page] - [Layout ID if used]

**IMPORTANT**: Pages should only contain necessary elements that are used in this specific page. Do not create components for grouping text elements - if you want to show for example "Provides instructions on application usage" use the text element instead of creating a component for it - it is not frontend development documentation. Pages should be used to describe the functionality of the page, not to show every possible element that can be used in the page.


## Modals, Forms, etc. (Parent elements)
Modals, Forms and other parent elements are the elements that are used in the pages/layouts/other parent elements. They **cannot be self-contained**. 

Modals, forms, etc. can be placed inside other modals recursively.

Those are not frontend development elements - they are used to describe the functionality of the page. They can be used in the pages, layouts, or other parent elements. Do not use models when you want to show a empty containers for page-specific content. Do not show in the documentation the empty containers at all.

When you want to describe something like: "Displays application title and user information", use the text element instead of modal/form.

Using modals, forms, etc. is only for the elements that are fairly complex or are used in many pages/layouts/other parent elements.

Table with the elements is the same as for the layouts and pages - see [Layouts](#layouts).

Table must have title in the following format:<br>
> **[Type] C[1000-2999].[Name]**<br>

It should contain the short description of the element (max 100 characters) and reference to the parent page or layout where it is used.
> [Description of the element] - [Parent ID]

## Scripts
In this section all the backend specific processes are described. It is not visible to the user - it means that it cannot be triggered by the user directly from the page.

**IMPORTANT**: Scripts are the processes that cannot be triggered by the user - therefore they are not accessible from the UI. If there is a backend process that is triggered by the user action, it should be described in the page or modal/form where it is used.

It can be scheduled or triggered by the admin or by the system on event.

Scripts are described in the table that contains columns:
- **ID**: The ID of the script - in format **S[0800-0999]-E0000**.
- **Name**: The name of the script.
- **Description**: The description of the script - short and to the point. It should describe the purpose of the script.
- **Functionality**: The functionality of the script - short and to the point. It should be max 100 characters long. If longer is required to explain the functionality, it should be explained in the dedicated file.
- **Entry Point**: The entry point of the script - the function/file that is called to trigger the script.

# Documentation Creation Process

The documentation creation follows a phased approach to ensure business requirements are properly captured, analyzed, and validated before implementation.

## Phase 1: Business Requirements Gathering

In this initial phase, the business analyst works with stakeholders to capture high-level requirements:

- **Focus**: Document what the business wants to achieve with the application
- **Approach**: Aggregate all functionalities without dividing into technical layers
- **Deliverables**: 
  - Business objectives
  - User stories
  - Functional requirements
  - Key workflows and business rules
  - Success criteria

This phase deliberately avoids technical details and layout specifications to ensure business needs are fully understood without constraints.

## Phase 2: Initial Master Documentation Generation

After business requirements are gathered, the next step is to create an initial structured documentation:

- **Focus**: Transform unstructured business requirements into the documentation framework
- **Approach**:
  - Use the master documentation generation prompt
  - Extract layouts, pages, components, and elements from requirements
  - Assign preliminary IDs to all identified elements
  - Document relationships and hierarchies
- **Deliverables**:
  - Initial master documentation file following the project structure
  - Preliminary element catalog with IDs, names, and descriptions
  - High-level mapping of user journeys to interface elements

This phase creates the foundation for detailed technical analysis. For detailed instructions on generating the master documentation, refer to the [Master Documentation Generation Prompt](generate-master.prompt.md).

## Phase 3: Technical Analysis and Refinement

Once the initial master documentation is created, developers and analysts collaborate to:

- **Focus**: Refine and expand the initial documentation with technical details
- **Approach**: 
  - Review and validate element identification and relationships
  - Finalize ID assignments
  - Add technical specifications and constraints
  - Refine element descriptions and functionality
- **Deliverables**:
  - Refined documentation with technical specifications
  - Finalized element catalog
  - Detailed data requirements and relationships

This phase transforms the business-focused documentation into a technical specification ready for visualization.

## Phase 4: Mockup Generation

Based on the refined documentation from Phase 3:

- **Focus**: Create visual representations of the application
- **Approach**: 
  - Use the mockup generation prompt (see separate file)
  - Translate documented elements into visual mockups
  - Focus on layout, flow, and interaction
- **Deliverables**:
  - HTML mockups of key screens
  - Interactive prototypes
  - Visual representation of workflows

For detailed instructions on generating mockups, refer to the [Mockup Generation Prompt](generate-mockup.prompt.md).

## Phase 5: Business Review and Iteration

The final phase before development involves:

- **Focus**: Validate mockups against business requirements
- **Approach**:
  - Present mockups to stakeholders
  - Collect feedback and identify gaps
  - Revise documentation and mockups as needed
- **Deliverables**:
  - Revised documentation with stakeholder feedback
  - Final approved mockups
  - Sign-off on functional specifications

This iterative process ensures the technical implementation accurately reflects business needs before development begins.
