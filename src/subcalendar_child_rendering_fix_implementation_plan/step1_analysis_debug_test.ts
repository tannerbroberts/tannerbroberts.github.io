/**
 * Debug test to reproduce the SubCalendar child rendering issue
 * This file is for Step 1 analysis only - to understand the actual problem
 */

import {
  BasicItem,
  SubCalendarItem,
  Child
} from '../functions/utils/item/index';
import { getActiveChildForExecution } from '../components/execution/executionUtils';

// Create a realistic test scenario
export function debugSubCalendarChildRendering() {
  console.log('=== SubCalendar Child Rendering Debug Test ===');

  // Create child items
  const childItem1 = new BasicItem({ name: 'First Task', duration: 10000 }); // 10 seconds
  const childItem2 = new BasicItem({ name: 'Second Task', duration: 15000 }); // 15 seconds
  const childItem3 = new BasicItem({ name: 'Third Task', duration: 8000 }); // 8 seconds

  // Create child references with start times
  const child1 = new Child({ id: childItem1.id, start: 0 });      // 0-10s
  const child2 = new Child({ id: childItem2.id, start: 10000 });  // 10-25s
  const child3 = new Child({ id: childItem3.id, start: 25000 });  // 25-33s

  // Create SubCalendar parent
  const subCalendarItem = new SubCalendarItem({
    name: 'Multi-Child SubCalendar',
    duration: 35000, // 35 seconds total
    children: [child1, child2, child3]
  });

  const items = [subCalendarItem, childItem1, childItem2, childItem3];
  const parentStartTime = Date.now();

  console.log('Created items:', items.map(item => ({ id: item.id, name: item.name, duration: item.duration })));
  console.log('Parent start time:', new Date(parentStartTime).toISOString());
  console.log('Children schedule:');
  console.log('  - First Task: 0-10s');
  console.log('  - Second Task: 10-25s');
  console.log('  - Third Task: 25-33s');

  // Test at different time points
  const testTimes = [
    { offset: 2000, expected: 'First Task', description: '2s - should be First Task' },
    { offset: 5000, expected: 'First Task', description: '5s - should be First Task' },
    { offset: 12000, expected: 'Second Task', description: '12s - should be Second Task' },
    { offset: 18000, expected: 'Second Task', description: '18s - should be Second Task' },
    { offset: 27000, expected: 'Third Task', description: '27s - should be Third Task' },
    { offset: 30000, expected: 'Third Task', description: '30s - should be Third Task' },
    { offset: 36000, expected: null, description: '36s - should be null (after completion)' }
  ];

  console.log('\n=== Testing getActiveChildForExecution ===');
  let allCorrect = true;

  for (const test of testTimes) {
    const testTime = parentStartTime + test.offset;
    const activeChild = getActiveChildForExecution(subCalendarItem, items, testTime, parentStartTime);
    const actualName = activeChild?.name || null;
    const isCorrect = actualName === test.expected;

    if (!isCorrect) allCorrect = false;

    console.log(`${test.description}: ${isCorrect ? '✅' : '❌'} Expected: ${test.expected}, Got: ${actualName}`);
  }

  console.log(`\nOverall result: ${allCorrect ? '✅ All tests passed' : '❌ Some tests failed'}`);

  return {
    allCorrect,
    subCalendarItem,
    items,
    parentStartTime,
    testResults: testTimes.map(test => ({
      ...test,
      actual: getActiveChildForExecution(subCalendarItem, items, parentStartTime + test.offset, parentStartTime)?.name || null
    }))
  };
}

// Run the debug test if this file is executed directly
if (typeof window === 'undefined') {
  debugSubCalendarChildRendering();
}
