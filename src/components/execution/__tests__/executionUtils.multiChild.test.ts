import { describe, it, expect } from 'vitest';
import {
  getActiveChildForExecution,
  getChildExecutionStatus,
  calculateChildStartTime
} from '../executionUtils';
import {
  BasicItem,
  SubCalendarItem,
  CheckListItem,
  Child,
  CheckListChild,
  Item
} from '../../../functions/utils/item/index';

describe('ExecutionUtils - Multi-Child Scenarios', () => {
  describe('getActiveChildForExecution - Multi-Child Edge Cases', () => {
    it('should handle SubCalendar with overlapping child times correctly', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });

      // Create overlapping children (child2 starts before child1 ends)
      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-1500ms
      const child2 = new Child({ id: childItem2.id, start: 1000 }); // 1000-2000ms (overlaps 1000-1500ms)

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2500,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // During overlap period, should return the child that started first
      expect(getActiveChildForExecution(subCalendarItem, items, 1250, parentStartTime)?.name).toBe('Child 1'); // 250ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Child 1'); // 750ms elapsed, still in Child 1
      expect(getActiveChildForExecution(subCalendarItem, items, 2250, parentStartTime)?.name).toBe('Child 1'); // 1250ms elapsed, still in Child 1 (runs until 1500ms)
      expect(getActiveChildForExecution(subCalendarItem, items, 2750, parentStartTime)?.name).toBe('Child 2'); // 1750ms elapsed, Child 1 finished, now Child 2
    });

    it('should handle children that extend beyond parent duration', () => {
      const childItem1 = new BasicItem({ name: 'Short Parent Child', duration: 2000 });
      const child1 = new Child({ id: childItem1.id, start: 500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Short Parent',
        duration: 1000, // Parent ends before child completes
        children: [child1]
      });

      const items = [subCalendarItem, childItem1];
      const parentStartTime = 1000;

      // Child should be active during parent duration
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Short Parent Child');

      // After parent ends, no child should be active
      expect(getActiveChildForExecution(subCalendarItem, items, 2500, parentStartTime)).toBeNull();
    });

    it('should handle large numbers of children efficiently', () => {
      // Create 15 children with 200ms duration each and no gaps
      const childItems: BasicItem[] = [];
      const children: Child[] = [];

      for (let i = 0; i < 15; i++) {
        const childItem = new BasicItem({
          name: `Child ${i + 1}`,
          duration: 200
        });
        childItems.push(childItem);

        const child = new Child({
          id: childItem.id,
          start: i * 200
        });
        children.push(child);
      }

      const subCalendarItem = new SubCalendarItem({
        name: 'Many Children Parent',
        duration: 3000,
        children: children
      });

      const items = [subCalendarItem, ...childItems];
      const parentStartTime = 1000;

      // Test various points in execution
      expect(getActiveChildForExecution(subCalendarItem, items, 1100, parentStartTime)?.name).toBe('Child 1');  // 100ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 1350, parentStartTime)?.name).toBe('Child 2');  // 350ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Child 4');  // 750ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 2500, parentStartTime)?.name).toBe('Child 8');  // 1500ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 3900, parentStartTime)?.name).toBe('Child 15'); // 2900ms elapsed
    });

    it('should handle children with unordered start times', () => {
      const childItem1 = new BasicItem({ name: 'Second Child', duration: 500 });
      const childItem2 = new BasicItem({ name: 'First Child', duration: 500 });
      const childItem3 = new BasicItem({ name: 'Third Child', duration: 500 });

      // Children added in non-chronological order
      const child1 = new Child({ id: childItem1.id, start: 500 });  // Should be second
      const child2 = new Child({ id: childItem2.id, start: 0 });    // Should be first
      const child3 = new Child({ id: childItem3.id, start: 1000 }); // Should be third

      const subCalendarItem = new SubCalendarItem({
        name: 'Unordered Parent',
        duration: 1500,
        children: [child1, child2, child3] // Not in chronological order
      });

      const items = [subCalendarItem, childItem1, childItem2, childItem3];
      const parentStartTime = 1000;

      // Should execute in chronological start time order, not array order
      expect(getActiveChildForExecution(subCalendarItem, items, 1250, parentStartTime)?.name).toBe('First Child');  // 250ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 1750, parentStartTime)?.name).toBe('Second Child'); // 750ms elapsed
      expect(getActiveChildForExecution(subCalendarItem, items, 2250, parentStartTime)?.name).toBe('Third Child');  // 1250ms elapsed
    });
  });

  describe('getChildExecutionStatus - Comprehensive Multi-Child Testing', () => {
    it('should correctly identify pre-start phase for SubCalendar', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 500 });
      const child2 = new Child({ id: childItem2.id, start: 1500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 3000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 2000; // Parent hasn't started yet
      const currentTime = 1500; // 500ms before parent starts

      const status = getChildExecutionStatus(subCalendarItem, items, currentTime, parentStartTime);

      expect(status.currentPhase).toBe('pre-start');
      expect(status.activeChild).toBeNull();
      expect(status.nextChild).not.toBeNull();
      expect(status.nextChild?.item.name).toBe('Child 1');
      expect(status.nextChild?.timeUntilStart).toBe(1000); // 500ms until parent + 500ms until child
      expect(status.gapPeriod).toBe(false);
    });

    it('should correctly identify gap periods between children', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 500 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 }); // Gap from 500-1000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;
      const currentTime = 1750; // 750ms elapsed (in gap period)

      const status = getChildExecutionStatus(subCalendarItem, items, currentTime, parentStartTime);

      expect(status.currentPhase).toBe('gap');
      expect(status.activeChild).toBeNull();
      expect(status.nextChild).not.toBeNull();
      expect(status.nextChild?.item.name).toBe('Child 2');
      expect(status.nextChild?.timeUntilStart).toBe(250); // 250ms until Child 2 starts
      expect(status.gapPeriod).toBe(true);
    });

    it('should correctly identify active phase during child execution', () => {
      const childItem1 = new BasicItem({ name: 'Active Child', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Next Child', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;
      const currentTime = 1500; // 500ms elapsed (during child1)

      const status = getChildExecutionStatus(subCalendarItem, items, currentTime, parentStartTime);

      expect(status.currentPhase).toBe('active');
      expect(status.activeChild?.name).toBe('Active Child');
      expect(status.nextChild?.item.name).toBe('Next Child');
      expect(status.nextChild?.timeUntilStart).toBe(500); // 500ms until Child 2 starts
      expect(status.gapPeriod).toBe(false);
    });

    it('should correctly identify complete phase after all children finish', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 500 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1500,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;
      const currentTime = 2750; // 1750ms elapsed (after parent completes)

      const status = getChildExecutionStatus(subCalendarItem, items, currentTime, parentStartTime);

      expect(status.currentPhase).toBe('complete');
      expect(status.activeChild).toBeNull();
      expect(status.nextChild).toBeNull();
      expect(status.gapPeriod).toBe(false);
    });

    it('should handle CheckListItem with multiple children', () => {
      const childItem1 = new BasicItem({ name: 'CheckList Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'CheckList Child 2', duration: 1000 });

      const checkListChild1 = new CheckListChild({ itemId: childItem1.id });
      const checkListChild2 = new CheckListChild({ itemId: childItem2.id });

      const checkListItem = new CheckListItem({
        name: 'CheckList Parent',
        duration: 1000,
        children: [checkListChild1, checkListChild2]
      });

      const items = [checkListItem, childItem1, childItem2];

      const status = getChildExecutionStatus(checkListItem, items, Date.now(), Date.now());

      expect(status.currentPhase).toBe('active'); // CheckList always shows as active
      expect(status.activeChild?.name).toBe('CheckList Child 1'); // First child is active
      expect(status.gapPeriod).toBe(false);
    });

    it('should handle empty children arrays', () => {
      const subCalendarItem = new SubCalendarItem({
        name: 'Empty Parent',
        duration: 1000,
        children: []
      });

      const status = getChildExecutionStatus(subCalendarItem, [], Date.now(), Date.now());

      expect(status.currentPhase).toBe('complete');
      expect(status.activeChild).toBeNull();
      expect(status.nextChild).toBeNull();
      expect(status.gapPeriod).toBe(false);
    });
  });

  describe('calculateChildStartTime - Multi-Child Scenarios', () => {
    it('should correctly calculate start times for multiple SubCalendar children', () => {
      const parentStartTime = 2000;

      const child1 = new Child({ id: 'child1', start: 0 });
      const child2 = new Child({ id: 'child2', start: 500 });
      const child3 = new Child({ id: 'child3', start: 1500 });

      expect(calculateChildStartTime(parentStartTime, child1)).toBe(2000); // 2000 + 0
      expect(calculateChildStartTime(parentStartTime, child2)).toBe(2500); // 2000 + 500
      expect(calculateChildStartTime(parentStartTime, child3)).toBe(3500); // 2000 + 1500
    });

    it('should handle CheckListChild start time calculation', () => {
      const parentStartTime = 1500;

      const checkListChild1 = new CheckListChild({ itemId: 'item1' });
      const checkListChild2 = new CheckListChild({ itemId: 'item2' });
      const checkListChild3 = new CheckListChild({ itemId: 'item3' });

      // All CheckListChildren should start at parent start time
      expect(calculateChildStartTime(parentStartTime, checkListChild1)).toBe(1500);
      expect(calculateChildStartTime(parentStartTime, checkListChild2)).toBe(1500);
      expect(calculateChildStartTime(parentStartTime, checkListChild3)).toBe(1500);
    });

    it('should handle mixed child types', () => {
      const parentStartTime = 3000;

      const subCalChild = new Child({ id: 'subcal-child', start: 1000 });
      const checkListChild = new CheckListChild({ itemId: 'checklist-child' });

      expect(calculateChildStartTime(parentStartTime, subCalChild)).toBe(4000); // 3000 + 1000
      expect(calculateChildStartTime(parentStartTime, checkListChild)).toBe(3000); // Parent start time
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle very large numbers of children without performance degradation', () => {
      const numChildren = 100;
      const childItems: BasicItem[] = [];
      const children: Child[] = [];

      // Create 100 children with sequential start times
      for (let i = 0; i < numChildren; i++) {
        const childItem = new BasicItem({
          name: `Perf Child ${i + 1}`,
          duration: 100
        });
        childItems.push(childItem);

        const child = new Child({
          id: childItem.id,
          start: i * 100
        });
        children.push(child);
      }

      const subCalendarItem = new SubCalendarItem({
        name: 'Performance Test Parent',
        duration: numChildren * 100,
        children: children
      });

      const items = [subCalendarItem, ...childItems];
      const parentStartTime = 1000;

      // Test should complete quickly even with many children
      const startTime = performance.now();

      // Test multiple time points
      for (let i = 0; i < 20; i++) {
        const testTime = parentStartTime + (i * 500);
        const activeChild = getActiveChildForExecution(subCalendarItem, items, testTime, parentStartTime);
        expect(activeChild).toBeDefined();
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(100); // Less than 100ms for 100 children * 20 tests
    });

    it('should handle rapid consecutive calls without issues', () => {
      const childItem1 = new BasicItem({ name: 'Rapid Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Rapid Child 2', duration: 500 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Rapid Test Parent',
        duration: 1000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Make many rapid consecutive calls
      const results: (Item | null)[] = [];
      for (let i = 0; i < 1000; i++) {
        const testTime = parentStartTime + (i % 1000); // Cycle through different times
        const result = getActiveChildForExecution(subCalendarItem, items, testTime, parentStartTime);
        results.push(result);
      }

      // Should complete without errors and return consistent results
      expect(results.length).toBe(1000);
      expect(results.some(r => r !== null)).toBe(true); // Some results should be non-null
    });
  });

  describe('Edge Case Boundary Conditions', () => {
    it('should handle exact millisecond boundaries correctly', () => {
      const childItem1 = new BasicItem({ name: 'Boundary Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Boundary Child 2', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Boundary Parent',
        duration: 2000,
        children: [child1, child2]
      });

      const items = [subCalendarItem, childItem1, childItem2];
      const parentStartTime = 1000;

      // Test exact boundary conditions
      expect(getActiveChildForExecution(subCalendarItem, items, 1000, parentStartTime)?.name).toBe('Boundary Child 1'); // Exactly at start
      expect(getActiveChildForExecution(subCalendarItem, items, 2000, parentStartTime)?.name).toBe('Boundary Child 2'); // Exactly at transition
      expect(getActiveChildForExecution(subCalendarItem, items, 3000, parentStartTime)).toBeNull(); // Exactly at end
    });

    it('should handle negative elapsed times gracefully', () => {
      const childItem = new BasicItem({ name: 'Future Child', duration: 1000 });
      const child = new Child({ id: childItem.id, start: 500 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Future Parent',
        duration: 2000,
        children: [child]
      });

      const items = [subCalendarItem, childItem];
      const parentStartTime = 2000;
      const currentTime = 1500; // 500ms before parent starts

      const result = getActiveChildForExecution(subCalendarItem, items, currentTime, parentStartTime);
      expect(result).toBeNull(); // Should handle negative elapsed time gracefully
    });

    it('should handle fractional millisecond calculations', () => {
      const childItem = new BasicItem({ name: 'Fractional Child', duration: 1000 });
      const child = new Child({ id: childItem.id, start: 0 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Fractional Parent',
        duration: 1000,
        children: [child]
      });

      const items = [subCalendarItem, childItem];
      const parentStartTime = 1000.5; // Fractional start time
      const currentTime = 1500.7; // Fractional current time

      const result = getActiveChildForExecution(subCalendarItem, items, currentTime, parentStartTime);
      expect(result?.name).toBe('Fractional Child'); // Should handle fractional times correctly
    });
  });
});
