import { describe, it, expect } from 'vitest';
import {
  getActiveChildForExecution,
  getChildExecutionStatus
} from '../execution/executionUtils';
import {
  BasicItem,
  SubCalendarItem,
  Child
} from '../../functions/utils/item/index';

describe('Multi-Child SubCalendar Issue Analysis', () => {
  describe('Current Behavior Analysis', () => {
    it('should demonstrate the issue with multiple children', () => {
      // Create test scenario: SubCalendar with 3 children
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 }); // 1 second
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 }); // 1 second  
      const childItem3 = new BasicItem({ name: 'Child 3', duration: 1000 }); // 1 second

      const child1 = new Child({ id: childItem1.id, start: 0 });    // 0-1000ms
      const child2 = new Child({ id: childItem2.id, start: 1000 }); // 1000-2000ms
      const child3 = new Child({ id: childItem3.id, start: 2000 }); // 2000-3000ms

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 3000, // 3 seconds total
        children: [child1, child2, child3]
      });

      const items = [subCalendarItem, childItem1, childItem2, childItem3];
      const parentStartTime = 1000; // Start at timestamp 1000

      console.log('=== TESTING MULTI-CHILD EXECUTION ===');

      // Test at different time points during execution
      const testPoints = [
        { time: 1500, expected: 'Child 1', phase: 'first child active' },
        { time: 2500, expected: 'Child 2', phase: 'second child active' },
        { time: 3500, expected: 'Child 3', phase: 'third child active' }
      ];

      testPoints.forEach(({ time, expected, phase }) => {
        const activeChild = getActiveChildForExecution(subCalendarItem, items, time, parentStartTime);
        console.log(`Time ${time}: Expected ${expected}, Got ${activeChild?.name || 'null'} (${phase})`);

        // This is where we expect to see the issue - only first child might be returned
        if (phase === 'first child active') {
          expect(activeChild?.name).toBe(expected);
        } else {
          // These might fail due to the bug
          console.log(`  ⚠️  Expected ${expected} but got ${activeChild?.name || 'null'}`);
        }
      });
    });

    it('should test child execution status with multiple children', () => {
      // Same setup as above
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 1000 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 1000 });
      const childItem3 = new BasicItem({ name: 'Child 3', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 });
      const child3 = new Child({ id: childItem3.id, start: 2000 });

      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 3000,
        children: [child1, child2, child3]
      });

      const items = [subCalendarItem, childItem1, childItem2, childItem3];
      const parentStartTime = 1000;

      console.log('=== TESTING EXECUTION STATUS ===');

      // Test execution status at different points
      const statusTestPoints = [
        { time: 1500, phase: 'first child' },
        { time: 2500, phase: 'second child' },
        { time: 3500, phase: 'third child' }
      ];

      statusTestPoints.forEach(({ time, phase }) => {
        const status = getChildExecutionStatus(subCalendarItem, items, time, parentStartTime);
        console.log(`Time ${time} (${phase}): Active=${status.activeChild?.name || 'null'}, Next=${status.nextChild?.item.name || 'null'}, Phase=${status.currentPhase}`);
      });
    });
  });
});
