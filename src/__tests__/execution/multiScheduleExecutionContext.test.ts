import { describe, it, expect } from 'vitest';
import { BasicItem, SubCalendarItem, Child, Item, ItemInstance } from '../../functions/utils/item';
import { getExecutionContext } from '../../components/execution/executionUtils';
import { createBaseCalendarEntry, type BaseCalendarEntry } from '../../functions/reducers/AppReducer';

// Helper to keep items sorted by id as required by getItemById binary search
function sortItems(items: Item[]): Item[] { return items.sort((a, b) => a.id.localeCompare(b.id)); }

describe('getExecutionContext with multiple schedules of same template', () => {
  it('picks the active base calendar entry and yields a fresh instance per schedule', () => {
    // Parent subcalendar with one short child so we can detect the smallest active item
    const childTask = new BasicItem({ name: 'child', duration: 5_000 });
    const parent = new SubCalendarItem({ name: 'parent', duration: 20_000, children: [new Child({ id: childTask.id, start: 2_000 })] });

    const items = sortItems([childTask, parent]);

    // Schedule same parent template twice at different times
    const t1 = 1_000_000;
    const t2 = 1_200_000; // later

    const e1: BaseCalendarEntry = createBaseCalendarEntry(parent.id, t1);
    const e2: BaseCalendarEntry = createBaseCalendarEntry(parent.id, t2);

    const baseCalendar = new Map<string, BaseCalendarEntry>();
    baseCalendar.set(e1.id, e1);
    baseCalendar.set(e2.id, e2);

    // No instances map yet (simulating pre-execution). The context should still choose e2 when time is around t2
    const instances = new Map<string, ItemInstance>();

    // Pick a time where only the second schedule is active within the parent's duration
    const currentTime = t2 + 3_000; // 3s after second start -> child should be active (start offset 2s)

    const ctx = getExecutionContext(items, instances, baseCalendar, currentTime);

    // Should resolve the currently executing smallest item (the child)
    expect(ctx.currentItem?.id).toBe(childTask.id);

    // And baseStartTime should reflect the second entry's start time
    expect(ctx.baseStartTime).toBe(t2);
  });
});
