# **AI Assistant Coding Guidelines**

**Purpose:** These guidelines aim to ensure code consistency, maintainability, quality, and collaboration across our Python (FastAPI) projects. Adhering to these standards helps us build robust and scalable applications.

**Review & Updates:** These guidelines will be reviewed periodically (e.g., quarterly or as major dependencies change) and updated as needed. Feedback and suggestions for improvement are welcome.

# Python

## Package Management

Use 'uv' for package management:

*   **Installation:** Use `pip install uv` to install the package.
*   **Usage:** Use `uv` to manage dependencies and virtual environments. For example, `uv add {package_name} --dev` to add a package as a development dependency.
*   **Environment:** Use `uv sync` to synchronize the environment.

## File Structure

Organize code into logical modules:

*   `main.py`: Application entry point (FastAPI app initialization, middleware, startup/shutdown events).
*   `run_script_name.py`: Entry point for script running.
*   `scripts/`: Directory for scripts (e.g., database initialization, application specific process). Each script should have its own subdirectory with an `__init__.py` file.
*   `modules/`: Directory containing route modules (e.g., `users/`, `items/`). Use FastAPI `APIRouter`.
*   `config.py`: Configuration loading and settings model (using Pydantic).
*   `services.py`: Business logic layer, orchestrating operations.
*   `repositories.py`: Data access layer (database interactions, external API clients).
*   `models.py`: Core internal data structures (Pydantic `BaseModel` representing domain entities, potentially database-aligned if not using ORM models directly).
*   `schemas.py`: API request/response validation models (Pydantic `BaseModel`, often tailored for specific endpoints, may inherit/compose from `models.py`).
*   `enums.py`: Application-specific Enum classes.
*   `dependencies.py`: Dependency injection providers (e.g., database session, authentication).
*   `exceptions.py`: Custom exception classes.
*   `utils.py`: General utility functions not specific to any layer.
*   `constants.py`: Non-enum constant values (if necessary, prefer Enums where appropriate).

### Directory Structure Example
```
project/
├── main.py
|── scripts/
│   ├── __init__.py
│   ├── init_db/
│   |  ├── run_init_db.py
│   |  └── service.py
├── modules/
│   ├── __init__.py
│   ├── diet_planning/
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── services.py
│   │   ├── repositories.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── enums.py
│   │   ├── exceptions.py
│   │   ├── utils.py
│   │   └── constants.py
│   ├── ingredients_and_products/
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── services.py
│   │   ├── repositories.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── enums.py
│   │   ├── exceptions.py
│   │   ├── utils.py
│   │   └── constants.py
│   └── ...
├── __init__.py
├── repositories.py
├── models.py
├── schemas.py
├── enums.py
├── exceptions.py
├── utils.py
├── constants.py
├── config.py
```

Each module cannot import from other modules - if something is shared between modules, it should be files on project level.

## Code Style

*   **Version:** Use Python 3.12+.
*   **Type Hints:**
    *   Mandatory for all function/method signatures (arguments and return types).
    *   Use modern type hints:
        *   `|` for union types (e.g., `int | str`).
        *   **`Type | None`** instead of `Optional[Type]` (e.g., `str | None`).
        *   Use built-in generics (`list[int]`, `dict[str, Any]`) instead of `typing.List`, `typing.Dict`.
        *   Use `TypeVar` and `typing.Generic` for creating generic functions and classes.
*   **Docstrings:**
    *   Use **Google Style** docstrings for modules, classes, functions, and methods.
    *   Document non-obvious logic, algorithms, and the *purpose* of complex code sections.
*   **Comments:**
    *   Use sparingly. Explain *why* something is done, not *what* is done if the code is self-explanatory.
    *   Avoid commented-out code; use version control instead.

## Logging

- Use structured logging with extra fields
- Include contextual information in logs
- Use appropriate log levels.
- Include correlation IDs for request tracing

## Data Models

*   **Version:** Use Pydantic v2.10+.
*   **Usage:** Use Pydantic `BaseModel` for structured data representation, validation, and serialization (API schemas, configuration, complex data structures). Prefer them over raw dictionaries for these purposes.
*   **Type Hints:** Always include explicit field type hints.
*   **Validation:** Leverage built-in and custom validators (`@field_validator` in v2) for data integrity.
*   **Metadata:** Use `Field()` for default values, descriptions, examples, validation constraints (e.g., `min_length`, `max_length`, `gt`, `lt`).
*   **Enums:** Use `enum.Enum` classes (defined in `enums.py`) for fields with a fixed set of choices, instead of raw strings or constants.
*   **Configuration:** Utilize `model_config` (Pydantic v2) for settings like:
    *   `extra = 'forbid'` (recommended to prevent unexpected fields).
    *   `frozen = True` (for immutable models where appropriate).
    *   `from_attributes = True` (if mapping from ORM objects or other attribute-based classes).

## Naming Conventions

*   `snake_case`: Variables, functions, methods, modules, package directories.
*   `PascalCase`: Classes (including Pydantic models, custom exceptions).
*   `UPPER_SNAKE_CASE`: Constants (defined in `constants.py` or at module level).
*   `_leading_underscore`: Internal/private attributes or methods (by convention).
*   **Suffixes:**
    *   Consider suffixing Enums with `Enum` (e.g., `StatusEnum`).
    *   Consider suffixing API schemas in `schemas.py` with `Schema` (e.g., `UserCreateSchema`) to distinguish from internal models. Avoid generic `Model` suffixes unless necessary for clarity.
*   **Loggers:** Use descriptive logger names, typically based on the module path (e.g., `logging.getLogger(__name__)`).

## Error Handling

*   **Custom Exceptions:** Define custom, specific exception types inheriting from a common base exception (e.g., `AppBaseException(Exception)`) in `exceptions.py`.
*   **Explicit Handling:** Catch specific exceptions rather than generic `Exception`.
*   **Context:** Include informative error messages and relevant context when raising or handling exceptions.
*   **FastAPI Error Handling:** Use FastAPI's exception handlers (`@app.exception_handler`) to translate custom exceptions into standardized HTTP error responses (e.g., consistent JSON error structure).
*   **Validation Errors:** Let Pydantic validation errors propagate to FastAPI's default handler or a custom handler to return 422 responses.
*   **Logging:** Log exceptions appropriately, including stack traces for unexpected errors (ERROR level) and potentially handled exceptions (WARNING or INFO level, depending on severity).
*   **Context Managers:** Use `try...finally` or context managers (`with` statement) for reliable resource cleanup (e.g., database connections, file handles).

## Database

* Postgresql
* Library to operate with db - sqlalchemy core
* Never use ORM - always use core - the pure sql queries

# Frontend Coding Guidelines

## Architecture - Feature-Sliced Design

### Folder Structure
```
src/
├── app/                    # App-level configuration
│   ├── providers/         # Global providers (theme, auth, etc.)
│   ├── store/            # Global state
│   └── styles/           # Global styles
├── pages/                 # Page components and routing
├── widgets/              # Large UI blocks (header, sidebar, etc.)
├── features/             # Business logic features
│   └── [feature-name]/
│       ├── api/          # API calls
│       ├── model/        # State, schemas, types
│       ├── ui/           # Feature UI components
│       └── lib/          # Feature utilities
├── entities/             # Business entities
│   └── [entity-name]/
│       ├── api/
│       ├── model/
│       ├── ui/
│       └── lib/
└── shared/               # Reusable code
    ├── ui/               # UI kit components
    ├── lib/              # Utilities, helpers
    ├── api/              # Base API configuration
    └── config/           # App configuration
```

### Import Rules
- Higher layers can import from lower layers only
- No cross-imports within the same layer
- Use absolute imports with path aliases

## Code Organization

### Component Structure
```typescript
// Component file organization
export interface ComponentProps {
  // Props definition
}

const Component = ({ prop1, prop2 }: ComponentProps) => {
  // 1. Hooks (state, effects, etc.)
  // 2. Computed values
  // 3. Event handlers
  // 4. Early returns/guards
  // 5. JSX return
};

export default Component;
```

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts`
- Types: `types.ts` or `[entity].types.ts`
- Utils: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts`

## React Best Practices

### Component Guidelines
- One component per file
- Max 150 lines per component
- Extract logic into custom hooks for reusability
- Use compound components for complex UI patterns
- Prefer composition over prop drilling

### State Management
- Use local state first (useState, useReducer)
- Lift state up when needed by multiple components
- Use context sparingly for truly global state
- Consider custom hooks for shared stateful logic

### Performance
- Use React.memo for expensive renders
- Implement proper dependency arrays in useEffect
- Avoid creating objects/functions in render
- Use useCallback/useMemo when beneficial

## Zod Integration

### Schema Organization
```typescript
// shared/lib/schemas/[entity].schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
});

export type User = z.infer<typeof userSchema>;
```

### Form Validation
- Use react-hook-form with Zod resolver
- Create reusable validation schemas
- Handle validation errors gracefully
- Provide clear error messages

### API Validation
```typescript
// Validate API responses
const parseUser = (data: unknown): User => {
  return userSchema.parse(data);
};
```

## Styling with Tailwind

### Class Organization
- Use Tailwind's official class order
- Group related classes together
- Use custom CSS for complex animations only
- Leverage Tailwind's design tokens consistently

### Responsive Design
- Mobile-first approach
- Use Tailwind breakpoints consistently
- Test across different screen sizes
- Consider container queries for components

### Component Styling
```typescript
// Use clsx for conditional classes
import { clsx } from 'clsx';

const Button = ({ variant, size, className, ...props }) => (
  <button
    className={clsx(
      'base-classes',
      {
        'variant-classes': variant === 'primary',
      },
      className
    )}
    {...props}
  />
);
```

## Skeleton UI Integration

### Loading States
- Implement skeleton screens for all async content
- Match skeleton structure to actual content
- Use consistent skeleton styling across app
- Provide meaningful loading indicators

### Component Pattern
```typescript
const DataComponent = () => {
  const { data, isLoading } = useQuery();

  if (isLoading) return <ComponentSkeleton />;
  
  return <ActualComponent data={data} />;
};
```

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper typing for all props and functions
- Use type guards for runtime validation
- Prefer interfaces for object shapes

### Error Handling
- Use Error Boundaries for component errors
- Implement proper try-catch for async operations
- Provide fallback UI for error states
- Log errors appropriately



## Code Readability

### Naming Conventions
- Use descriptive variable names
- Boolean variables: `is*`, `has*`, `can*`, `should*`
- Event handlers: `handle*` or `on*`
- Constants: Descriptive names over abbreviations

### Comments
- Explain why, not what
- Document complex business logic
- Use JSDoc for public APIs
- Remove dead code instead of commenting out

### Function Guidelines
- Single responsibility principle
- Max 20-30 lines per function
- Pure functions when possible
- Clear input/output types

## Import Organization
```typescript
// 1. React and external libraries
import React from 'react';
import { z } from 'zod';

// 2. Internal imports (absolute paths)
import { Button } from '@/shared/ui';
import { useAuth } from '@/features/auth';

// 3. Relative imports
import './Component.styles.css';
```

## Performance Guidelines

### Bundle Optimization
- Use dynamic imports for route-based code splitting
- Lazy load heavy components
- Optimize images and assets
- Monitor bundle size regularly

### Runtime Performance
- Avoid unnecessary re-renders
- Use proper key props in lists
- Implement virtualization for large lists
- Profile performance bottlenecks

## Accessibility

### Standards
- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader testing

### Implementation
- Use Tailwind's accessibility utilities
- Test with keyboard-only navigation
- Provide focus indicators
- Include alternative text for images