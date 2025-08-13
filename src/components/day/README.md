# Day View Component

Provides a calendar-style 24 hour slice of scheduled items.

Highlights:
- Shows every base calendar entry overlapping the selected day (even if spanning midnight).
- Performs hierarchy "unwrapping" only if all children of a container (SubCalendar / CheckList) fit fully inside the day window.
- Falls back to rendering the container itself when any child would be partial, preserving context and avoiding fragment noise.
- Clamps visual intervals to the window but flags them with a `partial` chip when start/end extend beyond.
- Navigation: previous / next / today buttons; internally stores an anchor (startOfDay timestamp).

Future enhancements (not implemented yet):
- Timeline lane collision layout for overlapping entries.
- Drag-to-reschedule & click-to-focus integration.
- Multi-day/week aggregation using the same unwrapping primitive.
