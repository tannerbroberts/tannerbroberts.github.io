# Data Model Specification

Breadcrumb: Docs > Domain Model > Data Model Specification

Cross-Links: [Data Model Diagram](../docs/diagrams/data_model.md) | [Item System Doc](../docs/item-system.md) | [Architecture](./feature-description.md)
# Data Model Specification

Authoritative definitions for core domain entities (Items, Item Instances, Variables) and their invariants. This document reduces ambiguity and prevents architectural drift.

## 1. Items
Items are immutable templates that define name, duration, variables, and parent relationships.

Key fields:
- id: string (UUID)
- name: string
- duration: number (ms)
- parents: Parent[] (references to parent item ids)
- variables: Record<string, number>
- variableSummary: Record<string, number> (aggregated variables of descendants – exclusive of the item's own variables)

Invariants:
1. Duration Uniqueness (Schedulable Set): No two items sharing the exact same duration may be linked in a parent → child relationship (prevents ambiguous structural cycles by enforcing a strict size stratification heuristic).
2. Global (Load-Time) Duration Validation: On data import, if any duplicate durations exist across items, the set is still loaded but a validation warning is emitted; subsequent attempts to form a parent-child edge between equal-duration items are rejected.
3. Parent Integrity: Every Parent.id must correspond to an existing Item.id at the time of persistence.
4. Variable Keys: Variable names are case-sensitive; duplicate names within an item are disallowed (enforced by object map uniqueness).

## 2. Item Instances
Instances represent concrete scheduled or executing occurrences of an item. They DO NOT mutate or override the underlying item template.

Key fields (superseding previous ad-hoc shape):
- id: string (UUID)
- itemId: string (reference to Item)
- calendarEntryId: string (reference to base calendar entry)
- scheduledStartTime: number (epoch ms)
- actualStartTime?: number (epoch ms when execution actually began)
- completedAt?: number (epoch ms when terminal status set)
- parentItemId?: string (the contextual parent item through which this instance was introduced; optional when scheduled directly on base calendar)
- status: 'pending' | 'complete' | 'partial' | 'canceled'
- executionDetails: { checklistStartTimes?, variableState?, notes?, interruptionCount? }

Legacy Compatibility:
- Previous field isComplete (boolean) is now derived: isComplete === (status === 'complete'). It remains transient for backward compatibility when deserializing.
- Previous accountingStatus is mapped to status where possible: 'success' => 'complete', 'canceled' => 'canceled', 'partial' => 'partial'.

Status Semantics:
- pending: Not yet completed (includes not started, in-progress, or partially started states).
- partial: Some sub-work completed (e.g., subset of checklist) but not fully complete; still considered incomplete for overdue calculations.
- complete: Fully executed.
- canceled: Intentionally abandoned; excluded from overdue logic.

Derived Flags:
- isTerminal(status) => status === 'complete' || status === 'canceled'
- isIncomplete(status) => !isTerminal(status) || status === 'partial'

Invariants:
1. completedAt MUST be defined iff status is terminal ('complete' | 'canceled').
2. partial status MUST NOT have completedAt set.
3. actualStartTime <= (completedAt|now) when defined.

Migration Notes:
- When loading persisted instances missing status: if isComplete === true => status='complete'; else if accountingStatus present => mapped; else status='pending'.

## 3. Variables
Variables are scalar quantities aggregated across item hierarchies.

Current Implementation Simplification:
- No inter-variable dependency graph (thus no variable evaluation cycles). The only potential cycle risk arises from item parent graphs, handled by acyclicity invariant above.

Future Extension Placeholder:
- If variable derivations are introduced, a DAG constraint section will be added with topological evaluation ordering rules and cycle detection.

## 4. Duration Uniqueness Enforcement
Instead of runtime graph cycle detection, structural integrity leverages duration uniqueness:
- Parent-child scheduling is forbidden when parent.duration === child.duration.
- A load-time validator (findDuplicateDurations) reports duplicates so the user (or future migration) can reconcile them before creating relationships.

Rationale: Using duration as a monotonic discriminator across hierarchy edges lowers runtime overhead and creates an implicit partial order. While not a formal DAG proof, it provides a practical safeguard given domain assumptions that duration adjustments precede structural linking.

## 5. Overdue Instance Determination
- Past incomplete instance: scheduledStartTime < now AND status in {'pending','partial'}.
- Canceled & complete statuses excluded.

## 6. Serialization Contracts
- All numeric times are milliseconds since Unix epoch (UTC). (Previously some comments referenced Apple epoch; normalized here.)
- Persisted ItemInstance JSON SHOULD include status; loader injects default when absent.

## 7. Backward Compatibility Strategy
1. Read Path: fromJSON maps legacy fields to new schema.
2. Write Path: Always emit new schema (including status & parentItemId if present).
3. Validation: Cleanup / migration step can upgrade any legacy instances in memory prior to save.

## 8. Validation Utilities (Planned)
- validateItemInstance(instance) => asserts instance invariants above.
- findDuplicateDurations(items) => returns map of duration -> itemIds[] where length > 1.
- validateDurationForLink(parent, child) => throws when durations equal.

## 9. Open Questions (Track & Resolve)
- Should partial automatically transition to complete after all checklist children complete? (Pending spec.)
- Should canceled set completedAt? (Currently yes; treat as terminal timestamp.)

---
This document is the single source of truth for the data model. Changes require updating invariants and ensuring enforcement + tests.
