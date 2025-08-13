# Documentation & Process Governance

Breadcrumb: Docs > Meta > Process Governance

<!-- Navigational (rich) breadcrumb for humans -->
[Home](../README.md) / Meta / Process Governance

Authoritative: Yes  
Last Updated: <!-- date -->

## Purpose
Establish guardrails so every code change and AI interaction keeps the doc graph accurate, navigable, and trustworthy.

## Pillars
1. Hierarchy & Breadcrumb Integrity
2. Coverage Mapping (code → authoritative doc)
3. Drift Detection (changed code without updated doc excerpts)
4. Link & Anchor Integrity
5. Repeatable Context Generation for AI Agents
6. CI & Local Hooks Enforcement

## Required Local Commands
* Validate breadcrumbs: `npm run docs:validate`
* Auto‑fix breadcrumbs: `npm run docs:validate:fix`
* Update breadcrumb map (add new docs): `npm run docs:validate:update-map`
* Generate doc context graph: `npm run docs:context`
* Drift check: `npm run docs:drift`
* Link check: `npm run docs:links`

## Change Workflow (Developer Checklist)
1. Plan change; locate or create authoritative doc (feature-description.md or spec) before coding.
2. Implement code.
3. Update doc: adjust sections, Open Questions, Decisions, Follow‑ups.
4. Run:
   - `npm run docs:validate`
   - `npm run docs:drift`
   - `npm run docs:links`
   - `npm run docs:context`
5. Commit only with all green; pre-commit hook enforces.
6. PR: CI runs same suite; failures block merge.

## Drift Detection Strategy
`scripts/check-doc-drift.mjs` hashes normalized code segments grouped by mapping in `docs/code-to-doc-map.json`. If a hash changes since last snapshot (stored in `server_memory.json` under `docDrift` key) without a matching timestamp update inside the authoritative doc, it flags drift.

Update cadence: whenever intentional code change occurs, update doc section AND re-run drift script with `--update` flag (future enhancement). Current mode: read‑only warning.

## Link & Anchor Integrity
`scripts/check-markdown-links.mjs` resolves relative links, ensures target file exists, and (if hash) that heading slug exists. Certain folders (node_modules, dist) ignored.

## AI Context Generation
`scripts/generate-doc-context.mjs` produces `docs/doc-graph.json` used by AI agents. Agents should embed:
```
<docs-context size=... nodes=... checksum=...>
```
Follow with targeted node excerpts as needed.

## Adding New Authoritative Doc
1. Create file with Breadcrumb line.
2. Run `npm run docs:validate:update-map`.
3. Commit.

## Future Enhancements
* Automated hash snapshot updating with `--approve` mode.
* Semantic diff summarization for PR comments.
* Coverage report (percentage of changed files mapped to docs updated).
* Dead document detection (unreferenced authoritative docs).

## Source of Truth Files
| File | Role |
|------|------|
| `docs/breadcrumb-map.json` | Canonical breadcrumb + authoritative flag |
| `docs/code-to-doc-map.json` | Code path prefixes → doc file |
| `scripts/validate-docs-breadcrumbs.mjs` | Breadcrumb lint/fix |
| `scripts/check-doc-drift.mjs` | Drift detection |
| `scripts/check-markdown-links.mjs` | Link & anchor validation |
| `scripts/generate-doc-context.mjs` | Doc context JSON |

## Conventions
* Breadcrumb always line 1.
* Authoritative docs begin with metadata block (Breadcrumb, then optional flags/date, then H1).
* Prefer present tense, concise decision records.

---
Status: Bootstrap complete; enforcement active (manual drift approval phase).
