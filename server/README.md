# Local calendar server (dev)

A lightweight Express server that simulates a per-user, time-indexed store for calendar items and templates. In-memory only; suitable for local development and small demos.

## Endpoints

- GET /health
- GET /api/users/me
- POST /api/templates {hash, name, kind, data}
- GET /api/templates/:hash
- POST /api/calendar/items {type, start, end, templateHash, priority?, parentId?, children?}
- DELETE /api/calendar/items/:id
- GET /api/calendar/items?start=..&end=..&busyOnly=true|false&largestFit=true|false&fullyWithin=true|false
- GET /api/calendar/conflicts?start=..&end=..
- GET /api/calendar/summary?start=..&end=..

Use header `x-user-id: <your-id>` to scope data per user. If omitted, defaults to `dev-user`.

## Run

- npm run server

