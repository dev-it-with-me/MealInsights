# **AI Assistant Coding Guidelines**

**Purpose:** These guidelines aim to ensure code consistency, maintainability, quality, and collaboration within the project. They cover various aspects of coding, including Python, JavaScript, TypeScript, and general best practices.

# General Guidelines

- **Code Quality:** Write clean, readable, and maintainable code. Also write code as if it is already in production.
- **Follow Standards:** Adhere strictly to the coding standards outlined in this document.
- **Optimize:** Continuously look for ways to improve performance, reduce complexity, and enhance the user experience.
- **Up to Date:** While using libraries, always check the official documentation for the latest features and best practices.

## Installation

- Always open the official web page before the installation for each tool. Check the official documentation for the latest installation methods before proceeding.
- If you cannot find the official documentation, stop and ask user to provide the link.
- After the installation, instruct the user how to check if the tool is installed correctly.

# Python

## Package Management & Tooling

Use 'uv' for package management:

- **Installation:** Open official 'uv' website to check how to install it: https://docs.astral.sh/uv/getting-started/installation/.
- **Usage:** Use `uv` to manage dependencies and virtual environments. For example, `uv add {package_name} --dev` to add a package as a development dependency.
- **Verify Installation:** Before advising users to install packages, ensure with opening the official documentation that the package is available and compatible with the current project setup.
- **Environment:** Use `uv sync` to synchronize the environment.
- **Linter & Formatter:** Use `uvx ruff check --fix' to check and fix code style issues and `uvx ruff format` to format the code.
- **Type Checking:** Use `uvx mypy .` to perform type checking.

## File Structure

Organize code into logical modules:

- `config.py`: Configuration loading and settings model (using Pydantic-settings).
- `main.py`: Application entry point (FastAPI app initialization, middleware, startup/shutdown events).
- `run_script_name.py`: Entry point for script running.
- `scripts/`: Directory for scripts (e.g., database initialization, application specific process). Each script should have its own subdirectory with an `__init__.py` file.
- `modules/`: Directory containing route modules (e.g., `users/`, `items/`). Use FastAPI `APIRouter`.
- `services.py`: Business logic layer, orchestrating operations.
- `repositories.py`: Data access layer (database interactions, external API clients).
- `models.py`: Core internal data structures (Pydantic `BaseModel` representing domain entities, potentially database-aligned if not using ORM models directly).
- `schemas.py`: API request/response validation models (Pydantic `BaseModel`, often tailored for specific endpoints, may inherit/compose from `models.py`).
- `enums.py`: Application-specific Enum classes.
- `dependencies.py`: Dependency injection providers (e.g., database session, authentication).
- `exceptions.py`: Custom exception classes.
- `utils.py`: General utility functions not specific to any layer.
- `constants.py`: Non-enum constant values (if necessary, prefer Enums where appropriate).

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

## Imports / Exports from `__init__.py`

- Use `__init__.py` files to define the public API of each module.
- Only export what is necessary for other modules to use.
- Avoid circular imports by carefully structuring dependencies.
- Use **all** to export all public classes and functions from a module.

```python
# In project/modules/users/__init__.py
from .models import User, UserCreate, UserUpdate
__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
]
```

## Code Style

- **Version:** Use Python 3.12+.
- **Type Hints:**
  - Mandatory for all function/method signatures (arguments and return types).
  - Use modern type hints:
    - `|` for union types (e.g., `int | str`).
    - **`Type | None`** instead of `Optional[Type]` (e.g., `str | None`).
    - Use built-in generics (`list[int]`, `dict[str, Any]`) instead of `typing.List`, `typing.Dict`.
    - Use `TypeVar` and `typing.Generic` for creating generic functions and classes.
- **Docstrings:**
  - Use **Google Style** docstrings for modules, classes, functions, and methods.
  - Document non-obvious logic, algorithms, and the _purpose_ of complex code sections.
- **Comments:**
  - Use sparingly. Explain _why_ something is done, not _what_ is done if the code is self-explanatory.
  - Avoid commented-out code; use version control instead.

## Logging

- Use structured logging with extra fields
- Include contextual information in logs
- Use appropriate log levels.
- Include correlation IDs for request tracing
- Always save logs to a file.

## Data Models

- **Version:** Use Pydantic v2.10+.
- **Usage:** Use Pydantic `BaseModel` for structured data representation, validation, and serialization (API schemas, configuration, complex data structures). Prefer them over raw dictionaries for these purposes.
- **Type Hints:** Always include explicit field type hints.
- **Validation:** Leverage built-in and custom validators (`@field_validator` in v2) for data integrity.
- **Metadata:** Use `Field()` for default values, descriptions, examples, validation constraints (e.g., `min_length`, `max_length`, `gt`, `lt`).
- **Enums:** Use `enum.Enum` classes (defined in `enums.py`) for fields with a fixed set of choices, instead of raw strings or constants.
- **Configuration:** Utilize `model_config` (Pydantic v2) for settings like:
  - `extra = 'forbid'` (recommended to prevent unexpected fields).
  - `frozen = True` (for immutable models where appropriate).
  - `from_attributes = True` (if mapping from ORM objects or other attribute-based classes).

## Naming Conventions

- `snake_case`: Variables, functions, methods, modules, package directories.
- `PascalCase`: Classes (including Pydantic models, custom exceptions).
- `UPPER_SNAKE_CASE`: Constants (defined in `constants.py` or at module level).
- `_leading_underscore`: Internal/private attributes or methods (by convention).
- **Suffixes:**
  - Consider suffixing Enums with `Enum` (e.g., `StatusEnum`).
  - Consider suffixing API schemas in `schemas.py` with `Schema` (e.g., `UserCreateSchema`) to distinguish from internal models. Avoid generic `Model` suffixes unless necessary for clarity.
- **Loggers:** Use descriptive logger names, typically based on the module path (e.g., `logging.getLogger(__name__)`).

## Error Handling

- **Custom Exceptions:** Define custom, specific exception types inheriting from a common base exception (e.g., `AppBaseException(Exception)`) in `exceptions.py`.
- **Explicit Handling:** Catch specific exceptions rather than generic `Exception`.
- **Context:** Include informative error messages and relevant context when raising or handling exceptions.
- **FastAPI Error Handling:** Use FastAPI's exception handlers (`@app.exception_handler`) to translate custom exceptions into standardized HTTP error responses (e.g., consistent JSON error structure).
- **Validation Errors:** Let Pydantic validation errors propagate to FastAPI's default handler or a custom handler to return 422 responses.
- **Logging:** Log exceptions appropriately, including stack traces for unexpected errors (ERROR level) and potentially handled exceptions (WARNING or INFO level, depending on severity).
- **Context Managers:** Use `try...finally` or context managers (`with` statement) for reliable resource cleanup (e.g., database connections, file handles).

## Database

- Postgresql
- Library to operate with db - sqlalchemy core
- Never use ORM - always use core - the pure sql queries

# Frontend Coding Guidelines

## Package Management

Use 'npm' as the package manager for JavaScript/TypeScript projects:

- **Installation:** Open official Node.js website to check how to install it: https://nodejs.org/en/download/.
- **Usage:** Use `npm run` to execute scripts defined in `package.json`.
- **Verify Installation:** Before advising users to install packages, ensure with official documentation that the package is available and compatible with the current project setup.
- **Scripts:** Define scripts in `package.json` for common tasks (e.g., `start`, `build`, `test`).

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
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
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
import { clsx } from "clsx";

const Button = ({ variant, size, className, ...props }) => (
  <button
    className={clsx(
      "base-classes",
      {
        "variant-classes": variant === "primary",
      },
      className
    )}
    {...props}
  />
);
```

## Skeleton UI Integration

Custom Skeleton UI theme documentation: https://www.skeleton.dev/docs/design/themes

### Component Usage

- Use Skeleton components as building blocks
- Customize through theme configuration and Tailwind classes
- Leverage Skeleton's Tailwind utility classes for common patterns
- Use built-in loading states and skeletons with Tailwind utilities

### Theme Configuration

```typescript
// app/providers/SkeletonProvider.tsx or in your main CSS
// Import Skeleton's CSS in your index.css or main stylesheet
@import 'tailwindcss';
@import '@skeletonlabs/skeleton';
@import '@skeletonlabs/skeleton/optional/presets';
@import '@skeletonlabs/skeleton/themes/theme-name';
@source '../node_modules/@skeletonlabs/skeleton-react/dist';

// Set theme in index.html
<html data-theme="theme-name">
```

### Component Structure

```typescript
// Use Skeleton's Tailwind classes for components
const DataCard = ({ data }) => (
  <div className="card p-4">
    <header className="card-header">
      <h3 className="h3">{data.title}</h3>
    </header>
    <section className="p-4">{data.content}</section>
  </div>
);
```

### Loading States

```typescript
const DataComponent = () => {
  const { data, isLoading } = useSWR("/api/data", fetcher);

  if (isLoading) return <div className="placeholder animate-pulse h-32"></div>;

  return <ActualComponent data={data} />;
};
```

## Data Fetching with SWR

### Library Choice

- Use **SWR** (stale-while-revalidate) for all data fetching needs
- SWR provides automatic caching, deduplication, and revalidation
- Install with: `npm install swr`

### Basic Setup

```typescript
// shared/api/fetcher.ts
const fetcher = async (...args: Parameters<typeof fetch>) => {
  const response = await fetch(...args);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export { fetcher };
```

### Data Fetching Patterns

#### Basic Query Hook

```typescript
// features/user-list/api/queries.ts
import useSWR from "swr";
import { fetcher } from "@/shared/api/fetcher";
import { userSchema } from "@/entities/user";

export const useUsers = () => {
  const { data, error, isLoading } = useSWR("/api/users", fetcher);

  return {
    users: data ? data.map((user) => userSchema.parse(user)) : [],
    isLoading,
    isError: error,
  };
};
```

#### Parameterized Queries

```typescript
// features/user-detail/api/queries.ts
export const useUser = (id: string) => {
  const { data, error, isLoading } = useSWR(
    id ? `/api/users/${id}` : null,
    fetcher
  );

  return {
    user: data ? userSchema.parse(data) : null,
    isLoading,
    isError: error,
  };
};
```

#### Mutations with Optimistic Updates

```typescript
// features/user-create/api/mutations.ts
import { mutate } from "swr";

export const useCreateUser = () => {
  const createUser = async (userData: CreateUserRequest) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const newUser = await response.json();

    // Revalidate the users list
    mutate("/api/users");

    return userSchema.parse(newUser);
  };

  return { createUser };
};
```

### Best Practices

#### Global Configuration

```typescript
// app/providers/SWRProvider.tsx
import { SWRConfig } from "swr";
import { fetcher } from "@/shared/api/fetcher";

export const SWRProvider = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      fetcher,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      shouldRetryOnError: (error) => {
        // Don't retry on 4xx errors (client errors)
        return error.status >= 500;
      },
      onError: (error) => {
        console.error("SWR Error:", error);
        // You can integrate with error reporting services here
      },
    }}
  >
    {children}
  </SWRConfig>
);
```

#### Error Handling

```typescript
// Use error boundaries for global error handling
// Handle specific errors at the component level
const UserProfile = ({ userId }: { userId: string }) => {
  const { user, isLoading, isError } = useUser(userId);

  if (isError)
    return <div className="alert alert-error">Failed to load user</div>;
  if (isLoading) return <div className="placeholder animate-pulse h-32"></div>;
  if (!user) return <div className="alert alert-warning">User not found</div>;

  return <UserCard user={user} />;
};
```

#### Loading States

```typescript
// Prefer SWR's built-in loading states
const DataComponent = () => {
  const { data, isLoading, error } = useSWR("/api/data", fetcher);

  if (error)
    return <div className="alert alert-error">Failed to load data</div>;
  if (isLoading) return <div className="placeholder animate-pulse h-32"></div>;

  return <ActualComponent data={data} />;
};
```

### Integration with Feature Slices

- Place SWR hooks in the `api/` directory of each feature slice
- Use `queries.ts` for GET requests (reading data)
- Use `mutations.ts` for POST/PUT/DELETE requests (modifying data)
- Always validate API responses using Zod schemas from entity slices
- Use SWR's `mutate` function to update cache after mutations

## React Router Integration

### Route Configuration

```typescript
// app/providers/RouterProvider.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "@/pages/routes";

const router = createBrowserRouter(routes);

export const AppRouterProvider = () => <RouterProvider router={router} />;
```

### Page Structure

```typescript
// pages/routes/index.ts
import { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { UserPage } from "@/pages/UserPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/users/:id",
    element: <UserPage />,
  },
];
```

### Navigation

- Use `Link` and `NavLink` for navigation
- Leverage `useNavigate` for programmatic routing
- Use `useParams` and `useSearchParams` for URL data
- Implement route guards with loaders or guards pattern

## Security Guidelines

### Authentication & Authorization

- Never store sensitive data in localStorage or sessionStorage
- Use secure httpOnly cookies for tokens when possible
- Implement proper CSRF protection
- Validate user permissions on every protected route
- Use environment variables for API endpoints and keys

### Data Sanitization

- Always validate and sanitize user inputs
- Use Zod schemas for runtime validation
- Escape HTML content when rendering user-generated content
- Implement proper XSS protection

### API Security

- Use HTTPS in production
- Implement proper CORS configuration
- Add rate limiting for API calls
- Never expose internal API endpoints in client code

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

```typescript
// shared/ui/ErrorBoundary.tsx
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-error">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

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

## Import Organization

```typescript
// 1. React and external libraries
import React from "react";
import { z } from "zod";

// 2. Internal imports (absolute paths)
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";

// 3. Relative imports
import "./Component.styles.css";
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

## Manual Testing Instructions

- When implementing features, always end with clear manual testing instructions for the user
- Provide step-by-step guidance on how to verify the implementation works correctly
- Include specific user interactions to test (clicks, form submissions, navigation, etc.)
- Mention edge cases and error scenarios to manually verify
