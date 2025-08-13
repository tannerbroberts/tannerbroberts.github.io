# Architecture Diagram (Textual Summary)

Breadcrumb: Docs > Diagrams > Architecture

Last Regenerated: 2025-08-13

Authoritative Sources:
- ../../src/feature-description.md (root)
- ../../src/components/feature-description.md
- ../../src/functions/feature-description.md
- ../../src/hooks/feature-description.md

## Layered View
Presentation (React Components) -> Hooks (Integration & stateful orchestration) -> Functions (Pure business logic & reducers) -> Persistence (localStorage now, planned Firebase) -> External Services.

## Key Flows
- Action Dispatch: Component -> Hook -> Context Dispatch -> Reducer -> State Persist -> Re-render subscribers.
- Scheduling: UI Dialog -> Hook (validation) -> Functions (time calc) -> State -> Instance listing.

## Boundaries
- UI never mutates domain objects directly.
- Functions layer maintains immutability & invariants.

See also: data_model.md

