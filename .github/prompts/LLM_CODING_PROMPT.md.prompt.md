---
mode: agent
---
# About Time - LLM Coding Guidelines

## Project Overview

This is a React TypeScript application built with Vite that uses Material-UI for components and a custom context-based state management pattern. The application manages items with hierarchical relationships and scheduling capabilities.

## Architecture Patterns

### 1. Context-Based State Management

The application uses a custom context pattern instead of Redux or Zustand. This pattern is built around:

#### Context Creation Pattern
- **Location**: `src/reducerContexts/CreateReducerContext.tsx`
- **Purpose**: A factory function that creates strongly-typed context providers and hooks
- **Pattern**: Each context is created using a reducer pattern with separate state and dispatch contexts

```typescript
// Example usage pattern:
const {
  Provider: ExampleProvider,
  useStateContext: useExampleState,
  useDispatchContext: useExampleDispatch,
} = CreateReducerContext(reducer, initialState);
```

#### Context Structure
Each context follows this pattern:
- **Provider**: Wraps components that need access to the state
- **State Hook**: `useXxxState()` - Returns the current state (read-only)
- **Dispatch Hook**: `useXxxDispatch()` - Returns the dispatch function for actions
- **Error Handling**: Contexts throw errors if used outside their provider

### 2. Component Architecture

#### Display Components (Pure Components)
Components should be **pure functions** of their props and context state. They should:
- Accept props for data and callbacks
- Use context hooks for global state access
- Contain **NO business logic**
- Be responsible only for rendering UI
- Use Material-UI components for consistent styling

**Example**: `ItemListFilter.tsx`, `AboutTimeListItem.tsx`

#### Container Components (Logic Coordination Components)
Higher-level components that:
- Manage local state with `useState`
- Coordinate business logic by calling custom hooks
- Use `useCallback` and `useMemo` for performance optimization
- Handle event coordination between child components
- Provide context to child components
- Delegate complex business logic to custom hooks

**Example**: `SideBar.tsx`, `PaginatedItemList.tsx`

### 3. Hook Pattern for Logic

#### Custom Hooks Should:
- Contain all business logic
- Return data and callbacks needed by components
- Use `useCallback` for functions to prevent unnecessary re-renders
- Use `useMemo` for computed values
- Handle side effects with `useEffect`

**Example**: `useItemListValidation.ts`

#### Context Consumer Hooks
Each context has associated consumer hooks that:
- Check if used within proper provider
- Return strongly-typed state/dispatch
- Throw descriptive errors when used incorrectly

### 4. Context Provider Hierarchy

Contexts are nested based on scope:
- **App-level**: `AppProvider` (global application state)
- **Feature-level**: `TimeInputProvider`, `NewItemProvider` (scoped to specific features)
- **Component-level**: Providers can be nested within components as needed

**Example from `main.tsx`**:
```tsx
<AppProvider>
  <App />
</AppProvider>
```

**Example from `SideBar.tsx`**:
```tsx
<TimeInputProvider>
  <SchedulingDialog />
</TimeInputProvider>
```

## Coding Standards

### 1. File Organization
```
src/
├── components/           # React components (display + container)
├── functions/
│   ├── reducers/        # State reducers
│   └── utils/           # Utility functions and custom hooks
└── reducerContexts/     # Context providers and hooks
```

### 2. Import Patterns
- Use `.ts` extension for TypeScript files in imports
- Use `.tsx` extension for React component imports
- Import context hooks from their respective modules
- Use Material-UI imports from `@mui/material` and `@mui/icons-material`

### 3. TypeScript Patterns

#### State Types
- Define state types based on `initialState`
- Use `typeof initialState` pattern for type safety
- Export types when needed across modules

#### Action Types
- Use discriminated unions for reducer actions
- Include `type` and `payload` properties
- Make payloads strongly typed

#### Component Props
- Define interfaces for component props
- Use optional properties where appropriate
- Avoid `any` types

### 4. Component Patterns

#### Event Handlers
- Use `useCallback` for event handlers to prevent re-renders
- Include dependencies array properly
- Handle event propagation when needed (`stopPropagation`)

#### State Updates
- Use immutable updates in reducers
- Clone objects/arrays before modification (using lodash `cloneDeep` when needed)
- Dispatch actions with proper type and payload structure

#### Conditional Rendering
- Use short-circuit evaluation for conditional rendering
- Handle null/undefined states gracefully
- Provide loading states when appropriate

### 5. Business Logic Patterns

#### Data Transformation
- Keep data transformation logic in utility functions
- Use pure functions for calculations
- Implement binary search for performance (see `getItemById`)

#### Class-Based Models
- Use classes for complex data structures (see `Item`, `Child`, `Parent`)
- Implement immutable update methods
- Provide JSON serialization/deserialization methods

#### Validation
- Implement runtime validation in hooks
- Use effect hooks for data integrity checks
- Provide meaningful error messages

## Key Guidelines for LLM Code Generation

### DO:
1. **Separate concerns**: Display components only render, container components coordinate, complex logic goes in custom hooks
2. **Use context consumer hooks**: Always use `useXxxState()` and `useXxxDispatch()` patterns
3. **Implement proper error boundaries**: Check context usage and provide meaningful errors
4. **Follow the provider hierarchy**: Nest providers appropriately based on scope
5. **Use TypeScript strictly**: Define proper types for all props, state, and actions
6. **Optimize re-renders**: Use `useCallback` and `useMemo` appropriately
7. **Handle loading/error states**: Provide graceful fallbacks

### DON'T:
1. **Mix display and logic**: Components should be either pure display or logic coordination (with actual logic in hooks)
2. **Use context directly**: Always go through the consumer hooks
3. **Mutate state directly**: Use immutable update patterns
4. **Skip dependency arrays**: Always include proper dependencies in hooks
5. **Use inline functions**: Prefer `useCallback` for event handlers
6. **Ignore TypeScript errors**: Fix type issues rather than using `any`
7. **Put complex business logic in components**: Extract it to custom hooks instead

### When Adding New Features:

1. **Create a reducer** if the feature needs state management
2. **Create context hooks** using `CreateReducerContext`
3. **Build display components** that are pure functions of props and context
4. **Create container components** that coordinate logic and provide context
5. **Add utility functions** for business logic and data transformation
6. **Implement proper TypeScript types** for all new interfaces

This architecture emphasizes separation of concerns, type safety, and predictable state management while maintaining component reusability and testability.

When removing files, ensure that you type "y" after running the command to confirm the deletion.