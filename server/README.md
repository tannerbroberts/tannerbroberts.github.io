# Local calendar server (dev)

A lightweight Express server that simulates a per-user, time-indexed store for calendar items and templates. In-memory only; suitable for local development and small demos.

## Endpoints

Current implemented HTTP surface (kept in sync with `server/routes/*.js`).

- GET `/health`
- GET `/api/users/me`
- POST `/api/templates` body: `{ hash, name, kind, data, visibility?, license? }`
	- `kind` ∈ `basic | container | checklist | variable-group`
	- Unspecified `visibility` defaults to `private`; `license` defaults to `proprietary`.
- GET `/api/templates/:hash`
- GET `/api/templates` list my templates (optional `?visibility=..&license=..` filters)  ← (was missing in docs)
- POST `/api/calendar/items` body (no children array is supported yet):
	- Common: `{ type, start, end, templateHash }`
	- `type` ∈ `basic | container | subcalendar` (the latter normalizes to `container` internally)
	- Optional fields by type:
		- `basic`: `priority? (number)`, `parentId? (string|null)`
		- `container`: `parentId? (string|null)`
	- NOTE: Previous docs mentioned `children?`; the current validator rejects unknown fields. Child scheduling is performed by creating separate items referencing a parent via `parentId`.
- DELETE `/api/calendar/items/:id`
- GET `/api/calendar/items?start=..&(end=..|duration=..)&busyOnly=true|false&largestFit=true|false&fullyWithin=true|false`
	- You may supply `end` OR a `duration`; if `duration` is provided it overrides any `end` value (mirrors code logic).
- GET `/api/calendar/conflicts?start=..&(end=..|duration=..)`
- GET `/api/calendar/summary?start=..&(end=..|duration=..)`

Use header `x-user-id: <your-id>` to scope data per user. If omitted, defaults to `dev-user`.

## Run

- npm run server

