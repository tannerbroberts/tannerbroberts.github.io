# Food Vertical MVP – Anchor Document

Purpose: Living plan to ship the food-focused MVP (meal plans, shopping, prep time, cost, flexible rescheduling, QR import) with Firebase backend.

## Vision (tip of the wedge)
- Build repeatable “meal playbooks” (templates) and schedule instances onto your week.
- See what you can cook from pantry variables, with prep time and cost.
- Handle overlaps by prompting a quick prioritization decision at execution time.
- Onboard via QR: scan a code to open the web app and auto-import the shared item/template.

## Core pillars
1) Templates vs Instances
   - Templates: recipes, prep blocks, shopping trips, weekly meal plans (containers).
   - Instances: scheduled cook/prep/shopping times on the calendar.
2) SubCalendars for plans
   - Weekly meal plan is a container; children are meals/prep with relative offsets.
3) Variables (simplified)
   - Each item: variables = { [name: string]: number|string }.
   - Summary: parent-only aggregation of child variables (no self-inclusion).
   - For food: pantry counts, servings, time estimates, cost per serving.
4) Execution-first
   - Current task with task chain; show “Up next.”
   - If overlapping basics are active, show prioritization dialog.
5) QR deep link import
   - URL format: /?importOwner=<ownerId>&importHash=<hash> to clone a public template.
   - QR codes distributed by existing users. Scanning opens the app and imports the item.
6) Firebase backend
   - Auth: Firebase Auth (email link or Google). Short-term: keep Express dev server; introduce Firebase incrementally.
   - Data: Firestore (templates, scheduled items, variables). Migration path from localStorage/in-memory.

## Scope for MVP (M0)
- Scheduling polish: S/M/L scales, rounding, multiple subcalendar children, “Up next.”
- Conflict handling: allow overlaps; execution-time prioritization dialog.
- Variables simplification: key/value + summary roll-ups.
- QR import: clone public template via server public endpoint (bridge), then migrate to Firestore.
- Minimal persistence: start Express dev server + localStorage; add Firebase scaffolding and optional Auth for early tests.

## Out-of-scope for M0
- Team/multi-tenant features, advanced variable algebra, full mobile apps.

## Data model (interim)
- Template: { hash, name, kind: 'basic'|'container'|'checklist', data, visibility, license }
- CalendarItem: { id, type: 'basic'|'container', templateHash, start, end, priority?, parentId? }
- Variables: embedded in template.data.variables and summarized in parent containers.

## Execution UX rules
- Overlaps never crash. Show conflict groups via /api/calendar/conflicts.
- When currentTime enters a conflict group with >1 active basic item, show PrioritizationDialog.
- Decision: select one to “execute now,” optionally snooze/skip others.

## QR onboarding
- Client on load reads importOwner/importHash; calls POST /public/templates/:ownerId/:hash/clone.
- Show notification with result. Redirect to imported item focus/schedule.

## Firebase plan
- Add firebase.ts with config via env vars. Install firebase SDK later.
- Phase 1: Keep existing Auth; add optional Firebase Auth (Google/sign-in link).
- Phase 2: Mirror templates/calendar in Firestore with userId partition; toggle via env flag.
- Phase 3: Retire Express dev store for production.

## Milestones
- M0.1: Conflict dialog + QR import + variables simplification wiring
- M0.2: Scheduling polish (S/M/L scale, rounding, multi-child)
- M0.3: Firebase Auth optional, Firestore mirrors
- M0.4: Food starter pack (templates + sample variables) and onboarding

## Open tasks backlog
- [ ] ConflictPrioritizationDialog component and ExecutionView trigger
- [ ] URL import handler for QR (clone public template)
- [ ] firebase.ts init; env docs; add dependency
- [ ] Simplify variable model in code paths (template.data.variables + summary)
- [ ] S/M/L time scale + rounding in scheduler
- [ ] Multi-child scheduling support and UI
- [ ] “Up next” chip in ExecutionView
- [ ] Starter templates: Weekly Meal Plan, Grocery Trip, Meal Prep (public/free)
- [x] Pantry variable inspector: “What can I make?” filter

Status: Pantry filter implemented in sidebar (What can I make?).
