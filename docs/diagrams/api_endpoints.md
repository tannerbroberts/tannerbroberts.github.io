# API Endpoints (Planned / Current)

Breadcrumb: Docs > Diagrams > API Endpoints

Last Updated: 2025-08-13

Status: Minimal public endpoints; expansion planned with Firebase migration.

## Public Import (QR)
POST /public/templates/:ownerId/:hash/clone -> Clones a public template into requesting user workspace.
Query Params (landing): importOwner, importHash (handled client-side then POST).

## Calendar Conflicts (Planned / Partial)
GET /api/calendar/conflicts?start=<epochMs>&duration=<ms> -> Returns overlapping instance groups within [start, start+duration).

Notes:
- Preferred window parameters are start + duration.
- Legacy `end` query parameter is still accepted (start + end) and will be deprecated; if `duration` is provided it takes precedence.
- Response now includes a window object: `{ window: { start, duration } }`.

## Auth (Future)
Firebase direct client SDK; server endpoints only for migration / bridging if needed.

Source References:
- ../food-mvp-anchor.md
- ../../src/feature-description.md

