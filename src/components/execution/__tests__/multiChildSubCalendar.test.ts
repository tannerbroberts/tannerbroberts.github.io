import { describe, it, expect } from 'vitest';
import {
  getActiveChildForExecution
} from '../executionUtils';
import {
  BasicItem,
  SubCalendarItem,
  Child
} from '../../../functions/utils/item/index';

describe('Multi-Child SubCalendar Execution', () => {
  describe('getActiveChildForExecution - Multi-Child Scenarios', () => {
    it('should handle SubCalendar with 2 children, no gaps', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-1000ms
      const child2 = new Child({ id: childItem2.id, start: 1000 }); // 1000-2000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Test first child
      expect(getActiveChildForExecution(subCalendarItem, items, 1500, parentStartTime)?.name).toBe('Child 1');

      // Test second child
      expect(getActiveChildForExecution(subCalendarItem, items, 2500, parentStartTime)?.name).toBe('Child 2');

      // Test transition point (should still be first child)
      expect(getActiveChildForExecution(subCalendarItem, items, 1999, parentStartTime)?.name).toBe('Child 1');

      // Test exact transition (should be second child)
      expect(getActiveChildForExecution(subCalendarItem, items, 2000, parentStartTime)?.name).toBe('Child 2');
    });

    it('should handle SubCalendar with 3+ children, no gaps', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });
      const childItem3 = new BasicItem({ name: 'Child 3', duration: 800 });
      const childItem4 = new BasicItem({ name: 'Child 4', duration: 700 });

      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-500ms
      const child2 = new Child({ id: childItem2.id, start: 500 });  // 500-1500ms  
      const child3 = new Child({ id: childItem3.id, start: 1500 }); // 1500-2300ms
      const child4 = new Child({ id: childItem4.id, start: 2300 }); // 2300-3000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 3000,
        children: [child1, child2, child3, child4]
      });

      const items = [subCalendarItem, childItem1, childItem2, childItem3, childItem4];
      const parentStartTime = 1000;

      expect(getActiveChildForExecution(subCalendarItem, items, 1250, parentStartTime)?.name).toBe('Child 1');
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Child 2');
      expect(getActiveChildForExecution(subCalendarItem, items, 2250, parentStartTime)?.name).toBe('Child 2'); // Still in Child 2 (500-1500ms elapsed)
      expect(getActiveChildForExecution(subCalendarItem, items, 2750, parentStartTime)?.name).toBe('Child 3'); // Now in Child 3 (1500-2300ms elapsed)
    });

    it('should handle children with different durations', () => {
      const childItem1 = new BasicItem({ name: 'Short', duration: 300 });
      const childItem2 = new BasicItem({ name: 'Long', duration: 2000 });
      const childItem3 = new BasicItem({ name: 'Medium', duration: 700 });

      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-300ms
      const child2 = new Child({ id: childItem2.id, start: 300 });  // 300-2300ms
      const child3 = new Child({ id: childItem3.id, start: 2300 }); // 2300-3000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 3000,
        children: [child1, child2, child3]
      });

      const items = [subCalendarItem, childItem1, childItem2, childItem3];
      const parentStartTime = 1000;

      expect(getActiveChildForExecution(subCalendarItem, items, 1150, parentStartTime)?.name).toBe('Short');
      expect(getActiveChildForExecution(subCalendarItem, items, 1650, parentStartTime)?.name).toBe('Long');
      expect(getActiveChildForExecution(subCalendarItem, items, 2650, parentStartTime)?.name).toBe('Long'); // Still in Long (300-2300ms elapsed)
    });

    it('should handle gaps between children', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 500 });

      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-500ms
      const child2 = new Child({ id: childItem2.id, start: 1000 }); // 1000-1500ms (gap from 500-1000ms)

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      expect(getActiveChildForExecution(subCalendarItem, items, 1250, parentStartTime)?.name).toBe('Child 1');
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)).toBeNull(); // Gap period
      expect(getActiveChildForExecution(subCalendarItem, items, 2250, parentStartTime)?.name).toBe('Child 2');
    });

    it('should handle delayed first child (gap at start)', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 500 });

      const child1 = new Child({ id: childItem1.id, start: 1000 }); // 1000-1500ms (gap from 0-1000ms)
      const child2 = new Child({ id: childItem2.id, start: 1500 }); // 1500-2000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      expect(getActiveChildForExecution(subCalendarItem, items, 1500, parentStartTime)).toBeNull(); // Initial gap
      expect(getActiveChildForExecution(subCalendarItem, items, 2250, parentStartTime)?.name).toBe('Child 1');
      expect(getActiveChildForExecution(subCalendarItem, items, 2750, parentStartTime)?.name).toBe('Child 2');
    });

    it('should handle execution before parent starts', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 });
      const child1 = new Child({ id: childItem1.id, start: 0 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child1]
      });

      const items = [subCalendarItem, childItem1];
      const parentStartTime = 2000; // Parent starts at 2000

      // Test before parent execution starts
      expect(getActiveChildForExecution(subCalendarItem, items, 1500, parentStartTime)).toBeNull();
    });

    it('should handle execution after parent completes', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const child1 = new Child({ id: childItem1.id, start: 0 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child1]
      });

      const items = [subCalendarItem, childItem1];
      const parentStartTime = 1000;

      // Test after all children complete
      expect(getActiveChildForExecution(subCalendarItem, items, 2500, parentStartTime)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle SubCalendar with single child (no regression)', () => {
      const childItem = new BasicItem({ name: 'Only Child', duration: 1000 });
      const child = new Child({ id: childItem.id, start: 500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child]
      });

      const items = [subCalendarItem, childItem];
      const parentStartTime = 1000;

      expect(getActiveChildForExecution(subCalendarItem, items, 1250, parentStartTime)).toBeNull(); // Before child
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Only Child');
      expect(getActiveChildForExecution(subCalendarItem, items, 2750, parentStartTime)).toBeNull(); // After child
    });

    it('should handle SubCalendar with no children', () => {
      const subCalendarItem = new SubCalendarItem({
        name: 'Empty Parent',
        duration: 1000,
        children: []
      });

      expect(getActiveChildForExecution(subCalendarItem, [], 1500, 1000)).toBeNull();
    });

    it('should handle children with zero duration gracefully', () => {
      const childItem1 = new BasicItem({ name: 'Zero Duration', duration: 0 });
      const childItem2 = new BasicItem({ name: 'Normal', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 0 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Should handle zero-duration children without crashing
      const result = getActiveChildForExecution(subCalendarItem, items, 1500, parentStartTime);
      expect(result?.name).toBe('Normal');
    });

    it('should handle missing child items gracefully', () => {
      const childItem1 = new BasicItem({ name: 'Exists', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: 'missing-id', start: 1000 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1]; // childItem2 is missing

      expect(() => {
        const result = getActiveChildForExecution(subCalendarItem, items, 1500, 1000);
        expect(result?.name).toBe('Exists');
      }).not.toThrow();
    });
  });

  describe('Time Boundary Tests', () => {
    it('should handle exact transition boundaries correctly', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Test exact boundary conditions
      expect(getActiveChildForExecution(subCalendarItem, items, 2000, parentStartTime)?.name).toBe('Child 2'); // Exactly at 1000ms elapsed (start of child2)
      expect(getActiveChildForExecution(subCalendarItem, items, 2001, parentStartTime)?.name).toBe('Child 2'); // Just into child2
      expect(getActiveChildForExecution(subCalendarItem, items, 1999, parentStartTime)?.name).toBe('Child 1'); // Just before transition
    });
  });
});
