# Accounting View

Maximal wrapping display of past (and only past) scheduled work:

- Collapses fully-past hierarchical containers into a single row, minimizing interaction (one click to account).
- If a container still has future children, only its past children are surfaced.
- A user can mark a wrapped node as:
  - success: everything proceeded as planned
  - canceled: nothing executed / discard
  - partial: expand (force unwrap) its past descendants for fine-grained accounting
- Partial marks set the instance `accountingStatus` to `partial`, forcing unwrapping on subsequent renders.

Future enhancements:
1. Persist per-child accounting states (success / canceled) instead of only instance-level flag.
2. Aggregate inventory & metric updates on success.
3. Batch actions and keyboard shortcuts.
4. Virtualized list for very large histories.
