# Diagrams Index

Breadcrumb: Docs > Diagrams > Index

Diagrams and visual aides summarizing authoritative textual specs. Whenever a referenced source spec changes, confirm whether the diagram text needs regeneration.

## Files
- **Architecture Diagram**: high-level module & data flow (architecture.md)
- **Data Model Diagram**: entity relationships & invariants mapping (data_model.md)
- **Algorithms Notes**: key algorithmic strategies (scheduling, variable summaries) (algorithms.md)
- **API Endpoints**: current + planned HTTP interface (api_endpoints.md)
- **Usage Walkthrough**: narrative user journey annotated with system touchpoints (USAGE.md)

## Source of Truth References
Authoritative specs these diagrams summarize:
- Root Architecture: ../../src/feature-description.md
- Data Model Spec: ../../src/DATA_MODEL_SPEC.md
- Item System: ../item-system.md
- Functions System: ../../src/functions/feature-description.md

## Update Trigger Checklist
Run through after merging feature PRs:
1. Added/changed entity field? -> Update Data Model Diagram.
2. New reducer/context or boundary shift? -> Architecture Diagram.
3. New scheduling/variable algorithm? -> Algorithms Notes.
5. Added/modified public endpoint? -> API Endpoints.
6. New end-to-end user flow? -> Usage Walkthrough.

Record date in each file's "Last Regenerated" section.

