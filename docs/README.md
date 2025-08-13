# About Time (ATP) – Documentation Hub

Breadcrumb: Docs > Index

This folder hosts the living, hierarchical documentation set. Every substantive feature/change should update (or add) a markdown file and cross-link affected specs. Keep documents small, purpose-driven, and linked upward and downward.

## Hierarchy Overview

Root (this index)
- Architecture & Feature Specs
  - Root Architecture: [src/feature-description.md](../src/feature-description.md)
  - Feature Architecture Summary: [src/feature-architecture-summary.md](../src/feature-architecture-summary.md)
  - Components System: [src/components/feature-description.md](../src/components/feature-description.md)
  - Functions System: [src/functions/feature-description.md](../src/functions/feature-description.md)
  - Hooks System: [src/hooks/feature-description.md](../src/hooks/feature-description.md)
- Core Domain Model
  - Data Model Spec (authoritative): [src/DATA_MODEL_SPEC.md](../src/DATA_MODEL_SPEC.md)
  - Item System Doc: [docs/item-system.md](./item-system.md)
- Product / Vertical Initiatives
  - Food MVP Anchor: [docs/food-mvp-anchor.md](./food-mvp-anchor.md)
- Diagrams & Visual Aids (derivative, regenerate when parents change)
  - Diagrams Index: [docs/diagrams/README.md](./diagrams/README.md)
  - Architecture Diagram: [docs/diagrams/architecture.md](./diagrams/architecture.md)
  - Data Model Diagram: [docs/diagrams/data_model.md](./diagrams/data_model.md)
  - Algorithms Notes: [docs/diagrams/algorithms.md](./diagrams/algorithms.md)
  - Auth Flow: [docs/diagrams/auth.md](./diagrams/auth.md)
  - API Endpoints: [docs/diagrams/api_endpoints.md](./diagrams/api_endpoints.md)
  - Usage Walkthrough: [docs/diagrams/USAGE.md](./diagrams/USAGE.md)

## Update Process (Lightweight Checklist)
1. Identify impacted specs (authoritative first: data model, root architecture, item system).
2. Update authoritative file(s) with precise change (fields, invariants, flows).
3. Propagate: adjust derivative docs (diagrams, summaries) – never diverge; they summarize.
4. Cross-link: add "Updated: YYYY-MM-DD" note + links to related changes.
5. (Optional) Add Open Questions section if decisions pending.
6. Commit with prefix `docs:` and reference files touched in commit body.

### Breadcrumb Validation Automation
- Validate: `npm run docs:validate` (CI-safe; exits 1 on mismatch).
- Auto-fix lines / insert missing: `npm run docs:validate:fix`.
- Append new breadcrumbed files to map: `npm run docs:validate:update-map` (review diff).
- Map file: `docs/breadcrumb-map.json` (treat as authoritative).

Rule Summary:
- Breadcrumb line required for all mapped files + any docs/* + *feature-description.md + DATA_MODEL_SPEC.md.
- Must appear within first 15 non-empty lines after first heading.
- Exact match to map when mapped.

### AI Prompt Integration (Meta Process)
Generate structured doc graph for AI agents:
- Build graph: `npm run docs:context` -> outputs `docs/doc-graph.json`.
- Feed nodes (breadcrumb + excerpt + openQuestions) into system prompt preamble.
- Agent Responsibilities (enforce in prompt):
  1. Resolve target breadcrumbs impacted by request.
  2. Read those doc nodes before code edits.
  3. After code changes, update or create doc nodes; run `npm run docs:validate`.
  4. If new area: add breadcrumb, run `docs:validate:update-map`, rebuild context.

Suggested Prompt Snippet:
"You have a documentation graph (JSON) describing each spec (breadcrumb, headings, excerpt, open questions). ALWAYS consult relevant nodes before changes; ALWAYS update docs with accurate breadcrumbs after changes; refuse to finalize if docs drift."

Future Enhancements:
- CI gate: fail if diff includes src/ changes without doc updates for related breadcrumbs.
- Open questions extraction for planning sprints.
- Embedding-based semantic retrieval of node excerpts.

## Authoritative vs Derivative
- Authoritative: Contain normative rules ("MUST", invariants). Changing code without updating these is architectural drift.
- Derivative: Visualizations, summaries, initiative anchors. They explain, but do not redefine rules.

## Breadcrumb Pattern
Each markdown file should begin (after title) with a breadcrumb line, e.g.:
`Breadcrumb: Docs > Domain Model > Data Model Diagram`

## Adding A New Feature Spec
Create `src/<feature>/feature-description.md` (if code-centric) or `docs/<area>-anchor.md` (if product/initiative). Link it here and from its parent layer.

## Quick Links
- Open Questions (search): `grep -R "Open Questions" .`
- Data Model Open Questions: [src/DATA_MODEL_SPEC.md#9-open-questions-track-resolve](../src/DATA_MODEL_SPEC.md#9-open-questions-track-resolve)

## Maintenance Cadence
Review weekly: ensure every merged feature PR touched at least one relevant spec or recorded rationale for no doc change.

---
This index is the starting point—expand the hierarchy organically while keeping it navigable and cross-linked.
