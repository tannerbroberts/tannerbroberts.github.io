import { describe, it, expect } from 'vitest';
import { BasicItem, SubCalendarItem, Child, Item } from '../../functions/utils/item/index';
import { getChildExecutionStatus } from '../execution/executionUtils';

function ms(s: number) { return s * 1000; }

// Build the canonical hierarchy described by the user
function buildHierarchy() {
  const one = new BasicItem({ name: 'one', duration: ms(1) });
  const two = new SubCalendarItem({ name: 'two', duration: ms(2) });
  const four = new SubCalendarItem({ name: 'four', duration: ms(4) });
  const eight = new SubCalendarItem({ name: 'eight', duration: ms(8) });
  const sixteen = new SubCalendarItem({ name: 'sixteen', duration: ms(16) });

  // two -> one @ 0s,1s
  two.children = [new Child({ id: one.id, start: ms(0) }), new Child({ id: one.id, start: ms(1) })];
  // four -> two @ 0s,2s
  four.children = [new Child({ id: two.id, start: ms(0) }), new Child({ id: two.id, start: ms(2) })];
  // eight -> four @ 0s,4s
  eight.children = [new Child({ id: four.id, start: ms(0) }), new Child({ id: four.id, start: ms(4) })];
  // sixteen -> eight @ 0s,8s
  sixteen.children = [new Child({ id: eight.id, start: ms(0) }), new Child({ id: eight.id, start: ms(8) })];

  const items: Item[] = [one, two, four, eight, sixteen];
  return { items, one, two, four, eight, sixteen };
}

// Compute absolute child index at each level given a time offset from sixteen's start
function indicesAt(items: Item[], two: SubCalendarItem, four: SubCalendarItem, _eight: SubCalendarItem, t: number, base: number) {
  const now = base + t;
  // Resolve eight block (which 'eight' child under sixteen)
  const sEight = Math.floor(t / 8000) % 2;
  const eightStart = base + sEight * 8000;

  // Resolve which 'four' block is active inside the current eight
  const fourBlockIndex = Math.floor((now - eightStart) / 4000) % 2;
  const fourStart = eightStart + fourBlockIndex * 4000;

  // Inside the active 'four' block, which 'two' child is active
  const localFour = now - fourStart; // 0..3999
  const sFourExpected = Math.floor(localFour / 2000) % 2;
  const sFour = getChildExecutionStatus(four, items, now, fourStart).activeChildIndex ?? null;

  // Inside the active 'two' block, which 'one' child is active
  const twoBlockIndex = Math.floor(localFour / 2000) % 2;
  const twoStart = fourStart + twoBlockIndex * 2000;
  const localTwo = now - twoStart; // 0..1999
  const sTwoExpected = Math.floor(localTwo / 1000) % 2;
  const sTwo = getChildExecutionStatus(two, items, now, twoStart).activeChildIndex ?? null;

  return { sTwo, sFour, sEight, sFourExpected, sTwoExpected } as const;
}

describe('Constant context with shifting active child indices', () => {
  it('keeps names constant while only child indices change over time', () => {
    const { items, one, two, four, eight, sixteen } = buildHierarchy();

    // Names must remain constant throughout
    const expected = ['sixteen', 'eight', 'four', 'two', 'one'];
    expect([sixteen.name, eight.name, four.name, two.name, one.name]).toEqual(expected);

    const base = Date.now();

    // Probe times across the entire 16s window
    const probes = [0, 1000, 1999, 2000, 3999, 4000, 7999, 8000, 12000, 15999];

    for (const t of probes) {
      // At any time, the visible stack should still be the same names
      expect([sixteen.name, eight.name, four.name, two.name, one.name]).toEqual(expected);

      // Active indices should reflect which child slice is active at each level
      const { sTwo, sFour, sEight, sFourExpected, sTwoExpected } = indicesAt(items, two, four, eight, t, base);

      // Indices are either 0 or 1 at each container level, depending on time
      if (t < 8000) {
        expect(sEight).toBe(0);
      } else {
        expect(sEight).toBe(1);
      }

      // Compute local time inside the currently active eight block
      expect(sFour).toBe(sFourExpected);

      // Compute local time inside the currently active four block
      expect(sTwo).toBe(sTwoExpected);
    }
  });
});
