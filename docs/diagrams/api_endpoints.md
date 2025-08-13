# API Endpoints (Planned / Current)

Breadcrumb: Docs > Diagrams > API Endpoints

Last Updated: 2025-08-13

Status: Minimal public endpoints; expansion planned with Firebase migration.

## Public Import (QR)
POST /public/templates/:ownerId/:hash/clone -> Clones a public template into requesting user workspace.
Query Params (landing): importOwner, importHash (handled client-side then POST).

## Calendar Conflicts (Planned)
GET /api/calendar/conflicts?from=..&to=.. -> Returns overlapping instance groups.

## Auth (Future)
Firebase direct client SDK; server endpoints only for migration / bridging if needed.

Source References:
- ../food-mvp-anchor.md
- ../../src/feature-description.md

