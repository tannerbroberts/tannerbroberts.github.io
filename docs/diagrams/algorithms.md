# Algorithms Notes

Breadcrumb: Docs > Diagrams > Algorithms

Last Updated: 2025-08-13

Focus: Domain-specific algorithm strategies (not general code walkthroughs). Keep concise; link to authoritative specs.

## 1. Duration-Based Acyclic Heuristic
Instead of full cycle detection, enforce parent.duration != child.duration. Provides lightweight partial order for practical hierarchies.
Source: ../../src/DATA_MODEL_SPEC.md#4-duration-uniqueness-enforcement

## 2. Variable Summary Propagation
Upon variable change in item template: recompute leaf deltas, propagate upward through parent chains, excluding self variables; memoize per itemId + variable key.

## 3. Scheduling Conflict Detection
SubCalendarItem uses interval tree (planned / existing) to test [start, start+duration) overlaps; conflicts allow but flagged for execution-time prioritization.

## 4. Overdue Calculation
Overdue iff scheduledStartTime < now && status in {pending, partial}. Terminal statuses excluded.

Open Candidates: add topological evaluation if derived variable formulas introduced.

See also: data_model.md

