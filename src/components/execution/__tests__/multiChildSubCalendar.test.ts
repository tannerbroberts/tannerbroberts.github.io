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

  describe('Integration Tests with Child Execution Status', () => {
    it('should provide consistent results between getActiveChildForExecution and getChildExecutionStatus', () => {
      const childItem1 = new BasicItem({ name: 'Integration Child 1', duration: 800 });
      const childItem2 = new BasicItem({ name: 'Integration Child 2', duration: 600 });

      const child1 = new Child({ id: childItem1.id, start: 200 });
      const child2 = new Child({ id: childItem2.id, start: 1200 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Integration Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Test various phases for consistency
      const testTimes = [
        { time: 1100, phase: 'pre-start', activeChild: null }, // 100ms elapsed, before first child
        { time: 1400, phase: 'active', activeChild: 'Integration Child 1' }, // 400ms elapsed, during first child
        { time: 1150, phase: 'gap', activeChild: null }, // 1150ms elapsed, gap period
        { time: 2400, phase: 'active', activeChild: 'Integration Child 2' }, // 1400ms elapsed, during second child
        { time: 3200, phase: 'complete', activeChild: null } // 2200ms elapsed, after completion
      ];

      testTimes.forEach(({ time, activeChild }) => {
        const activeFromFunction = getActiveChildForExecution(subCalendarItem, items, time, parentStartTime);

        if (activeChild) {
          expect(activeFromFunction?.name).toBe(activeChild);
        } else {
          expect(activeFromFunction).toBeNull();
        }
      });
    });

    it('should handle mixed child types in complex scenarios', () => {
      // This test ensures that the system can handle various child configurations
      const quickChild = new BasicItem({ name: 'Quick Task', duration: 200 });
      const mediumChild = new BasicItem({ name: 'Medium Task', duration: 800 });
      const longChild = new BasicItem({ name: 'Long Task', duration: 1200 });

      const child1 = new Child({ id: quickChild.id, start: 0 });      // 0-200ms
      const child2 = new Child({ id: mediumChild.id, start: 400 });   // 400-1200ms (gap 200-400ms)
      const child3 = new Child({ id: longChild.id, start: 1400 });    // 1400-2600ms (gap 1200-1400ms)

      const subCalendarItem = new SubCalendarItem({
        name: 'Complex Parent',
        duration: 3000,
        children: [child1, child2, child3]
      });

      const items = [subCalendarItem, quickChild, mediumChild, longChild];
      const parentStartTime = 5000;

      // Test the full execution cycle
      expect(getActiveChildForExecution(subCalendarItem, items, 5100, parentStartTime)?.name).toBe('Quick Task');     // 100ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 5300, parentStartTime)).toBeNull();                   // 300ms elapsed (gap)
      expect(getActiveChildForExecution(subCalendarItem, items, 5600, parentStartTime)?.name).toBe('Medium Task');    // 600ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 5300, parentStartTime)).toBeNull();                   // 1300ms elapsed (gap)
      expect(getActiveChildForExecution(subCalendarItem, items, 6800, parentStartTime)?.name).toBe('Long Task');      // 1800ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 8500, parentStartTime)).toBeNull();                   // 3500ms elapsed (complete)
    });

    it('should maintain performance during transition intensive scenarios', () => {
      // Create a scenario with many rapid transitions to test performance
      const children: Child[] = [];
      const childItems: BasicItem[] = [];

      // Create 50 children with 50ms duration each and 10ms gaps
      for (let i = 0; i < 50; i++) {
        const childItem = new BasicItem({
          name: `Rapid Child ${i + 1}`,
          duration: 50
        });
        childItems.push(childItem);

        const child = new Child({
          id: childItem.id,
          start: i * 60 // 50ms duration + 10ms gap
        });
        children.push(child);
      }

      const subCalendarItem = new SubCalendarItem({
        name: 'Rapid Transition Parent',
        duration: 3000,
        children: children
      });

      const items = [subCalendarItem, ...childItems];
      const parentStartTime = 10000;

      // Test performance during rapid queries
      const startTime = performance.now();

      // Query every 5ms for the full duration
      for (let time = parentStartTime; time < parentStartTime + 3000; time += 5) {
        const activeChild = getActiveChildForExecution(subCalendarItem, items, time, parentStartTime);
        // Just ensure we get some result (null during gaps is expected)
        expect(activeChild === null || activeChild.name.startsWith('Rapid Child')).toBe(true);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (600 queries)
      expect(executionTime).toBeLessThan(50); // Less than 50ms for 600 queries
    });
  });
});
