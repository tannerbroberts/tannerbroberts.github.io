# Day View Unwrapping Concept

The Day View needs to display all scheduled activity *within a 24-hour window* while preserving useful context from hierarchical task structures.

## Goals
1. Show every item that overlaps the day window (even if it started before or ends after the day).
2. For hierarchical items (SubCalendar / CheckList), descend ("unwrap") into children only when those children fully fit inside the day window.
3. Avoid clutter: if some children extend outside the window, show the parent container instead of partially rendering children fragments.
4. Preserve execution semantics: SubCalendar children have independent relative starts; CheckList children conceptually share the parent start.

## Algorithm Summary
Given a root scheduled item with absolute start `S` and duration `D`:
1. Compute absolute end `E = S + D`; skip if it doesn't overlap `[dayStart, dayEnd)`.
2. If root is a SubCalendarItem:
   - If *all* children exist and each child's absolute interval lies fully inside the day window, recurse into children instead of adding the parent record.
   - If any child crosses the window boundary, treat the parent as the render unit (add it, don't recurse further).
3. If root is a CheckListItem:
   - Treat each child as starting at the parent's absolute start (aligned execution model).
   - Recurse only if the parent is fully inside the window and every child (with its own duration, if any) is also fully inside.
4. For Basic items just add the clamped interval.
5. When adding an item, clamp its `[start, end)` to the day window for display, but retain original bounds for labeling (show a 'partial' chip if clamped).

## Rationale
This mirrors Execution View's *focused unwrapping* concept but broadens scope:
- Execution View unwraps along the *single active chain* to provide deep context for "now".
- Day View unwraps *width-wise*, but only when doing so doesn't introduce partial/incomplete child context.

This prevents slicing a container whose internal schedule can't be fully represented within the selected day.

## Future Enhancements
- Multi-day spanning view (week) using same unwrapping rules.
- Horizontal timeline rendering with collision grouping for concurrent entries.
- Interaction: click to focus, drag to reschedule.
