# Usage Walkthrough (Narrative)

Breadcrumb: Docs > Diagrams > Usage Walkthrough

Last Updated: 2025-08-13

Scenario: User scans QR for a Meal Plan template.
1. Browser opens app with importOwner & importHash.
2. Client POSTs clone endpoint; receives new template id.
3. Sidebar focuses imported template (focused view editing template, not instance).
4. User schedules template -> creates ItemInstance(s) with scheduledStartTime.
5. ExecutionView surfaces current & up-next instances; overdue logic applied.
6. Variable summaries show updated pantry counts.

Cross-Links:
- Data Model: ../../src/DATA_MODEL_SPEC.md
- Architecture: ../../src/feature-description.md
- Food MVP Anchor: ../food-mvp-anchor.md

