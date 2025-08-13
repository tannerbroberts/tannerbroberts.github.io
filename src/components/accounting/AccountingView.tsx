import { useMemo } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, MoreHoriz } from '@mui/icons-material';
import { useAppDispatch, useAppState } from '../../reducerContexts';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { Item, SubCalendarItem, CheckListItem } from '../../functions/utils/item';
import { ItemInstance } from '../../functions/utils/itemInstance/types';

/**
 * Accounting View
 * Shows past, unaccounted instances using a maximal wrapping principle:
 * - Prefer highest ancestor whose entire scheduled span is in the past AND whose descendants are all in the past
 * - Once any child chain extends into the future, stop at the highest fully-past ancestor
 * - If an ancestor is only partially past (still has future children), unwrap to show the past children individually
 */

interface AccountingDisplayNode {
  instance: ItemInstance;
  item: Item;
  start: number;
  end: number;
  depth: number;
  parentNames: string[];
  fullyPast: boolean;
  accountingStatus?: 'success' | 'canceled' | 'partial'; // status for this specific item layer
  rootInstanceStatus?: ItemInstance['accountingStatus'];
  occurrenceKey?: string; // unique occurrence (item may appear multiple times via schedule offsets)
}

export default function AccountingView() {
  const { items, baseCalendar, itemInstances } = useAppState();
  const dispatch = useAppDispatch();
  const now = useCurrentTime(5_000); // refresh every 5s for rapid updates

  const itemMap = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);

  // Gather root candidate calendar entries (each has linked instance)
  const nodes = useMemo(() => {
    const out: AccountingDisplayNode[] = [];
    for (const entry of baseCalendar.values()) {
      const rootItem = itemMap.get(entry.itemId);
      if (!rootItem || !rootItem.duration) continue;
      if (entry.startTime > now) continue;
      const inst = entry.instanceId ? itemInstances.get(entry.instanceId) : undefined;
      if (!inst) continue;
      // Skip entirely resolved root
      if (inst.accountingStatus === 'success' || inst.accountingStatus === 'canceled') continue;
      // Build nodes per maximal wrapping with one-level partial logic
      out.push(...collectAccountingLayer(rootItem, entry.startTime, [], 0, now, itemMap, inst));
    }
    // De-dup only exact duplicates (same instance, item, and start)
    const seen = new Set<string>();
    return out.filter(n => {
      const key = `${n.instance.id}:${n.item.id}:${n.start}`;
      n.occurrenceKey = key;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.start - b.start || a.depth - b.depth || a.item.id.localeCompare(b.item.id));
  }, [baseCalendar, itemMap, itemInstances, now]);

  const handleMarkRoot = (instanceId: string, status: 'success' | 'canceled') => {
    dispatch({ type: 'MARK_INSTANCE_ACCOUNTED', payload: { instanceId, status } });
  };

  const handleMarkItem = (instanceId: string, itemId: string, status: 'success' | 'canceled' | 'partial') => {
    dispatch({ type: 'MARK_ITEM_ACCOUNTING', payload: { instanceId, itemId, status } });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Accounting Queue</Typography>
      {nodes.length === 0 && (
        <Typography variant="body1" color="text.secondary">Nothing to account for yet.</Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nodes.map(n => {
          const disableAll = n.rootInstanceStatus === 'success' || n.rootInstanceStatus === 'canceled';
          const thisStatus = n.accountingStatus;
          const rootLayer = n.item.id === n.instance.itemId; // root item of schedule
          return (
          <Paper key={n.occurrenceKey || (n.instance.id + n.item.id + ':' + n.start)} variant="outlined" sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: .5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{n.item.name}</Typography>
              <Chip size="small" label={formatRange(n.start, n.end)} />
              {n.depth > 0 && <Chip size="small" variant="outlined" label={`lvl ${n.depth}`} />}
              {n.item instanceof SubCalendarItem && <Chip size="small" label={`sub(${n.item.children.length})`} />}
              {n.item instanceof CheckListItem && <Chip size="small" label={`check(${n.item.children.length})`} />}
              {thisStatus && <Chip size="small" color={thisStatus === 'partial' ? 'warning' : 'success'} label={thisStatus} />}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <Tooltip title={rootLayer ? "Mark entire item successful" : "Mark this item successful"}><span><IconButton size="small" color="success" onClick={() => rootLayer ? handleMarkRoot(n.instance.id, 'success') : handleMarkItem(n.instance.id, n.item.id, 'success')} disabled={disableAll || thisStatus === 'success'}><CheckCircle fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title={rootLayer ? "Cancel entire item" : "Cancel this item"}><span><IconButton size="small" color="error" onClick={() => rootLayer ? handleMarkRoot(n.instance.id, 'canceled') : handleMarkItem(n.instance.id, n.item.id, 'canceled')} disabled={disableAll || thisStatus === 'canceled'}><Cancel fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title="Partial: unwrap one layer"><span><IconButton size="small" color="primary" onClick={() => handleMarkItem(n.instance.id, n.item.id, 'partial')} disabled={disableAll || thisStatus === 'partial'}><MoreHoriz fontSize="small" /></IconButton></span></Tooltip>
              </Box>
            </Box>
            {n.parentNames.length > 0 && (
              <Typography variant="caption" color="text.secondary">{n.parentNames.join(' › ')} › {n.item.name}</Typography>
            )}
          </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

// Collect nodes for accounting respecting one-level partial unwrapping.
function collectAccountingLayer(
  item: Item,
  absStart: number,
  parentNames: string[],
  depth: number,
  now: number,
  itemMap: Map<string, Item>,
  instance: ItemInstance
): AccountingDisplayNode[] {
  const duration = item.duration || 0;
  const end = absStart + duration;
  if (absStart > now) return [];

  const perStatus = instance.perItemAccounting?.[item.id];
  const rootStatus = instance.accountingStatus;

  // If item still running (not fully past), do not surface it yet (future children not considered)
  if (end > now) {
  // Parent still ongoing: always surface fully past children (collapsed maximally)
  return collectImmediatePastChildren(item, absStart, parentNames, depth, now, itemMap, instance);
  }

  // If this layer has been marked partial, unwrap EXACTLY one level
  if (perStatus === 'partial') {
    return collectImmediatePastChildren(item, absStart, parentNames, depth, now, itemMap, instance);
  }

  // If not partial and fully past, check descendants: if any descendant unfinished (in future) or individually marked partial -> keep wrapping
  if (isFullyPastAndComplete(item, absStart, now, itemMap) && !hasPartialDescendant(item, absStart, itemMap, instance)) {
    return [{ instance, item, start: absStart, end, depth, parentNames, fullyPast: true, accountingStatus: perStatus, rootInstanceStatus: rootStatus }];
  }

  // Otherwise, dive deeper (some part incomplete or partial requested deeper)
  const children = collectImmediatePastChildren(item, absStart, parentNames, depth, now, itemMap, instance);
  if (children.length === 0) {
    return [{ instance, item, start: absStart, end, depth, parentNames, fullyPast: true, accountingStatus: perStatus, rootInstanceStatus: rootStatus }];
  }
  return children;
}

function collectImmediatePastChildren(
  item: Item,
  absStart: number,
  parentNames: string[],
  depth: number,
  now: number,
  itemMap: Map<string, Item>,
  instance: ItemInstance
): AccountingDisplayNode[] {
  const nodes: AccountingDisplayNode[] = [];
  if (item instanceof SubCalendarItem) {
    for (const ch of item.children) {
      const child = itemMap.get(ch.id); if (!child) continue;
      const childStart = absStart + ch.start;
      const childEnd = childStart + (child.duration || 0);
      if (childEnd > now) continue; // only show fully past children
      nodes.push(...collectAccountingLayer(child, childStart, [...parentNames, item.name], depth + 1, now, itemMap, instance));
    }
  } else if (item instanceof CheckListItem) {
    for (const ch of item.children) {
      const child = itemMap.get(ch.itemId); if (!child) continue;
      const childStart = absStart; const childEnd = childStart + (child.duration || 0);
      if (childEnd > now) continue;
      nodes.push(...collectAccountingLayer(child, childStart, [...parentNames, item.name], depth + 1, now, itemMap, instance));
    }
  }
  return nodes;
}

function isFullyPastAndComplete(item: Item, start: number, now: number, itemMap: Map<string, Item>): boolean {
  const duration = item.duration || 0;
  const end = start + duration;
  if (end > now) return false;
  if (item instanceof SubCalendarItem) {
    return item.children.every(ch => {
      const child = itemMap.get(ch.id); if (!child) return false;
      const cStart = start + ch.start;
      return isFullyPastAndComplete(child, cStart, now, itemMap);
    });
  }
  if (item instanceof CheckListItem) {
    return item.children.every(ch => {
      const child = itemMap.get(ch.itemId); if (!child) return false;
      return isFullyPastAndComplete(child, start, now, itemMap);
    });
  }
  return true; // basic
}

function hasPartialDescendant(item: Item, start: number, itemMap: Map<string, Item>, instance: ItemInstance): boolean {
  if (instance.perItemAccounting?.[item.id] === 'partial') return true;
  if (item instanceof SubCalendarItem) {
    return item.children.some(ch => {
      const child = itemMap.get(ch.id); if (!child) return false;
      return hasPartialDescendant(child, start + ch.start, itemMap, instance);
    });
  }
  if (item instanceof CheckListItem) {
    return item.children.some(ch => {
      const child = itemMap.get(ch.itemId); if (!child) return false;
      return hasPartialDescendant(child, start, itemMap, instance);
    });
  }
  return false;
}

function formatRange(start: number, end: number): string {
  const s = new Date(start); const e = new Date(end);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;
}
