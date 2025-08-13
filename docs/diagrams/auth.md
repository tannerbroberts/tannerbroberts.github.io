# Auth Flow Summary

Breadcrumb: Docs > Diagrams > Auth

Last Updated: 2025-08-13

Current State: Local dev server auth utilities + planned Firebase Auth (email link / Google) incremental adoption.

Planned Phases (from Food MVP Anchor):
1. Keep Express dev server + add optional Firebase config.
2. Mirror templates/calendar in Firestore keyed by userId.
3. Retire dev store for production.

Sequence (Planned Future):
User -> Firebase Auth -> Token -> Client stores -> Server (optional bridging) -> Firestore reads/writes.

See: ../food-mvp-anchor.md#firebase-plan

## Open Questions
- Token refresh strategy timing? (Pending actual Firebase integration.)

