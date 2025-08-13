## Dynamic Timeline Scaling

Per-view (non-global) automatic scaling for focused template timelines.

### Rationale
Manual unit selection buttons were removed. Long templates previously overflowed; short templates wasted space. This mechanism keeps timelines readable within a 0.9x–2x viewport vertical band.

### Hook
`useDynamicTimelineScale(duration, pixelsPerSegment, baseMillisecondsPerSegment, viewportHeight, options)`

Returns:
```
{
  effectiveMillisecondsPerSegment: number;
  targetHeight: number;      // clamped height in pixels
  naturalHeight: number;     // height without scaling
  didUpscale: boolean;       // compressed a tall timeline
  didDownscale: boolean;     // zoomed a short timeline
}
```
Options:
```
{
  minViewportMultiplier?: number; // default 0.9
  maxViewportMultiplier?: number; // default 2
}
```

### Math
Natural height: `natural = (duration * pixelsPerSegment) / baseMsPerSegment`.
Clamp: `target = clamp(natural, viewport * minMult, viewport * maxMult)`.
Solve: `effectiveMsPerSegment = (duration * pixelsPerSegment) / target`.

### Integration
FocusedSubCalendarItemDisplay passes `effectiveMillisecondsPerSegment` to:
- LedgerLines (override)
- ItemSchedule (override, recursive)

Global reducer state remains unchanged; other views keep original scaling.

### Visual Indicators
The duration label shows `(compressed)` when shrinking a tall timeline and `(zoomed)` when expanding a short one.

### Future Enhancements
- Persist per-template preferred zoom.
- User-adjustable zoom multiplier atop dynamic baseline.
- Adaptive bands per template category.

Updated: 2025-08-13
