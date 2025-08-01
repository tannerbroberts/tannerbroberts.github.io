import { describe, it } from 'vitest';
import {
  getActiveChildForExecution
} from '../executionUtils';
import {
  BasicItem,
  SubCalendarItem,
  Child
} from '../../../functions/utils/item/index';

describe('Debug Multi-Child Timing', () => {
  it('should debug the timing calculations', () => {
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

    console.log('=== DEBUG TIMING CALCULATIONS ===');
    console.log('Parent starts at:', parentStartTime);
    console.log('Child 1: start=0, duration=500, window: 0-500ms elapsed (1000-1500 absolute)');
    console.log('Child 2: start=500, duration=1000, window: 500-1500ms elapsed (1500-2500 absolute)');
    console.log('Child 3: start=1500, duration=800, window: 1500-2300ms elapsed (2500-3300 absolute)');
    console.log('Child 4: start=2300, duration=700, window: 2300-3000ms elapsed (3300-4000 absolute)');
    console.log();

    const testTimes = [1250, 1750, 2250, 2750];
    testTimes.forEach(time => {
      const elapsed = time - parentStartTime;
      const result = getActiveChildForExecution(subCalendarItem, items, time, parentStartTime);
      console.log(`Time ${time} (${elapsed}ms elapsed): ${result?.name || 'null'}`);
    });
  });

  it('should debug boundary conditions', () => {
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

    console.log('=== DEBUG BOUNDARY CONDITIONS ===');
    console.log('Parent starts at:', parentStartTime);
    console.log('Child 1: 0-1000ms elapsed (1000-2000 absolute)');
    console.log('Child 2: 1000-2000ms elapsed (2000-3000 absolute)');
    console.log();

    [1999, 2000, 2001].forEach(time => {
      const elapsed = time - parentStartTime;
      const result = getActiveChildForExecution(subCalendarItem, items, time, parentStartTime);
      console.log(`Time ${time} (${elapsed}ms elapsed): ${result?.name || 'null'}`);
    });
  });
});
