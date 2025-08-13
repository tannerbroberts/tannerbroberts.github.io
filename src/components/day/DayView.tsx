import { useMemo, useState } from 'react';
import { Box, Typography, Paper, Divider, IconButton, Tooltip, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { useAppState } from '../../reducerContexts';
import { Item, SubCalendarItem, CheckListItem } from '../../functions/utils/item/index';

/**
 * DayView
 * Renders a 24h (configurable) window of scheduled items. Large items spanning the day are shown.
 * Unwraps hierarchical items to the deepest children that fully fit within the day window.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface FlatDayItem {
  id: string;
  item: Item;
  start: number; // clamped start inside day
  end: number;   // clamped end inside day
  depth: number; // depth in hierarchy
  originalStart: number;
  originalEnd: number;
  parentNames: string[]; // ancestor names root -> direct parent
  fullyInside: boolean;  // whether original interval fully fits day window
}

export default function DayView() {
  const { baseCalendar, items } = useAppState();
  const [anchor, setAnchor] = useState(() => startOfDay(Date.now()));
  const dayStart = anchor;
  const dayEnd = anchor + MS_PER_DAY;

  // Build quick item map helper (items is already sorted by id; map helpful for O(1) id lookups)
  const itemMap = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);

  const calendarEntries = useMemo(() => Array.from(baseCalendar.values()), [baseCalendar]);

  const overlappingEntries = useMemo(() => {
    return calendarEntries.filter(e => {
      const it = itemMap.get(e.itemId);
      if (!it || !it.duration) return false;
      const start = e.startTime;
      const end = start + it.duration;
      return end > dayStart && start < dayEnd; // overlap test
    });
  }, [calendarEntries, itemMap, dayStart, dayEnd]);

  // New unwrapping logic: For each root scheduled item, descend until the FIRST descendant that is fully
  // contained by the day window. If the root itself is fully inside the day, stop (do not show its children).
  // If no descendant is fully contained, show the deepest overlapping branch terminal (fallback: the root clamped).
  const flatItems: FlatDayItem[] = useMemo(() => {
    const results: FlatDayItem[] = [];
    for (const entry of overlappingEntries) {
      const root = itemMap.get(entry.itemId);
      if (!root) continue;
      results.push(...collectDisplayItems(root, entry.startTime, [], 0, dayStart, dayEnd, itemMap));
    }
    return results.sort((a, b) => a.start - b.start || a.depth - b.depth || a.id.localeCompare(b.id));
  }, [overlappingEntries, itemMap, dayStart, dayEnd]);

  return (
    <Box>
      <HeaderBar
        dayStart={dayStart}
        onPrev={() => setAnchor(a => a - MS_PER_DAY)}
        onNext={() => setAnchor(a => a + MS_PER_DAY)}
        onToday={() => setAnchor(startOfDay(Date.now()))}
      />
      <Divider sx={{ my: 2 }} />
      {flatItems.length === 0 && (
        <Typography variant="body1" color="text.secondary">No scheduled items for this day.</Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {flatItems.map(fi => (
          <Paper key={fi.id + fi.start} variant="outlined" sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{fi.item.name}</Typography>
              <Chip size="small" label={formatRange(fi.start, fi.end)} />
              {fi.depth > 0 && <Chip size="small" variant="outlined" label={`lvl ${fi.depth}`} />}
              {!fi.fullyInside && (
                <Tooltip title="Interval spans outside day; clamped">
                  <Chip size="small" color="warning" label="partial" />
                </Tooltip>
              )}
              {fi.item instanceof SubCalendarItem && <Chip size="small" label={`sub(${fi.item.children.length})`} />}
              {fi.item instanceof CheckListItem && <Chip size="small" label={`check(${fi.item.children.length})`} />}
            </Box>
            {fi.parentNames.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {fi.parentNames.join(' › ')} › {fi.item.name}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function HeaderBar({ dayStart, onPrev, onNext, onToday }: { dayStart: number; onPrev(): void; onNext(): void; onToday(): void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h5">Day View</Typography>
      <Typography variant="body1" color="text.secondary">{new Date(dayStart).toLocaleDateString()}</Typography>
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Previous day"><IconButton onClick={onPrev}><ChevronLeft /></IconButton></Tooltip>
        <Tooltip title="Today"><IconButton onClick={onToday}><Today /></IconButton></Tooltip>
        <Tooltip title="Next day"><IconButton onClick={onNext}><ChevronRight /></IconButton></Tooltip>
      </Box>
    </Box>
  );
}

function collectDisplayItems(
  item: Item,
  absoluteStart: number,
  parentNames: string[],
  depth: number,
  dayStart: number,
  dayEnd: number,
  itemMap: Map<string, Item>
): FlatDayItem[] {
  const duration = item.duration || 0;
  const absoluteEnd = absoluteStart + duration;
  if (absoluteEnd <= dayStart || absoluteStart >= dayEnd) return [];

  const fullyInside = absoluteStart >= dayStart && absoluteEnd <= dayEnd;

  // If this item is fully inside, it becomes the display node (do NOT unwrap further)
  if (fullyInside) {
    return [
      makeRecord(item, absoluteStart, absoluteEnd, parentNames, depth, dayStart, dayEnd, fullyInside)
    ];
  }

  // Not fully inside: attempt to descend into overlapping children.
  const childResults: FlatDayItem[] = [];
  if (item instanceof SubCalendarItem && item.children.length > 0) {
    for (const ch of item.children) {
      const childItem = itemMap.get(ch.id);
      if (!childItem) continue;
      const childAbsStart = absoluteStart + ch.start;
      const childAbsEnd = childAbsStart + (childItem.duration || 0);
      if (childAbsEnd > dayStart && childAbsStart < dayEnd) {
        childResults.push(
          ...collectDisplayItems(childItem, childAbsStart, [...parentNames, item.name], depth + 1, dayStart, dayEnd, itemMap)
        );
      }
    }
  } else if (item instanceof CheckListItem && item.children.length > 0) {
    for (const ch of item.children) {
      const childItem = itemMap.get(ch.itemId);
      if (!childItem) continue;
      const childAbsStart = absoluteStart; // checklist child start
      const childAbsEnd = childAbsStart + (childItem.duration || 0);
      if (childAbsEnd > dayStart && childAbsStart < dayEnd) {
        childResults.push(
          ...collectDisplayItems(childItem, childAbsStart, [...parentNames, item.name], depth + 1, dayStart, dayEnd, itemMap)
        );
      }
    }
  }

  if (childResults.length > 0) return childResults;

  // Fallback: no children produced a display node; show this (clamped) partial.
  return [makeRecord(item, absoluteStart, absoluteEnd, parentNames, depth, dayStart, dayEnd, false)];
}

function makeRecord(
  item: Item,
  absoluteStart: number,
  absoluteEnd: number,
  parentNames: string[],
  depth: number,
  dayStart: number,
  dayEnd: number,
  fullyInside: boolean
): FlatDayItem {
  return {
    id: item.id,
    item,
    start: Math.max(absoluteStart, dayStart),
    end: Math.min(absoluteEnd, dayEnd),
    depth,
    originalStart: absoluteStart,
    originalEnd: absoluteEnd,
    parentNames,
    fullyInside
  };
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatRange(start: number, end: number): string {
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;
}
