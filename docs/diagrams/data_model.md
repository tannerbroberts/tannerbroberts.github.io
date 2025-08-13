# Data Model Diagram (Textual Summary)

Breadcrumb: Docs > Diagrams > Data Model

Last Regenerated: 2025-08-13

Authoritative Source: ../../src/DATA_MODEL_SPEC.md

## Entities
- Item (template) { id, name, duration, parents[], variables{}, variableSummary{} }
- ItemInstance { id, itemId, calendarEntryId, scheduledStartTime, actualStartTime?, completedAt?, status, parentItemId?, executionDetails }
- Parent { id, relationshipId }
- Child (SubCalendar) { id, start, relationshipId }
- CheckListChild { itemId, complete, relationshipId }

## Invariants (Selections)
- Duration uniqueness across parent-child links (heuristic DAG safeguard).
- ItemInstance terminal status requires completedAt.
- Variable summary excludes item's own variables.

## Relationships
Item 1--* Parent (reverse edges) -> Item (parents reference upstream). SubCalendarItem & CheckListItem hold child references forming directed edges.

## Notes
Refer to full normative definitions & migration rules in Data Model Spec.

See also: architecture.md

