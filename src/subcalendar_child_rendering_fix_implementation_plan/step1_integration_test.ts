/**
 * Comprehensive integration test to demonstrate the SubCalendar child rendering bug
 * This tests the full execution chain: getCurrentTaskChain -> ExecutionView -> Display
 */

import {
  BasicItem,
  SubCalendarItem,
  Child,
  getCurrentTaskChain
} from '../functions/utils/item/index';
import type { BaseCalendarEntry } from '../functions/reducers/AppReducer';
import { getActiveChildForExecution } from '../components/execution/executionUtils';

export function testFullExecutionChain() {
  console.log('=== Full Execution Chain Test ===');
  console.log('Testing getCurrentTaskChain vs getActiveChildForExecution');

  // Create child items with different start times
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

  const items = [subCalendarItem, childItem1, childItem2, childItem3].sort((a, b) => a.id.localeCompare(b.id));

  // Create base calendar entry (this is how items get scheduled)
  const parentStartTime = Date.now();
  const baseCalendarEntry: BaseCalendarEntry = {
    id: 'test-calendar-entry',
    itemId: subCalendarItem.id,
    startTime: parentStartTime,
    instanceId: 'test-instance'
  };

  const baseCalendar = new Map([['test-entry', baseCalendarEntry]]);

  console.log('\n=== Testing getCurrentTaskChain (the broken one) ===');

  // Test getCurrentTaskChain at different time points
  const testTimes = [
    { offset: 2000, expected: 'First Task', description: '2s - should show First Task in chain' },
    { offset: 12000, expected: 'Second Task', description: '12s - should show Second Task in chain' },
    { offset: 27000, expected: 'Third Task', description: '27s - should show Third Task in chain' }
  ];

  let chainTestsPassed = 0;

  for (const test of testTimes) {
    const testTime = parentStartTime + test.offset;
    const taskChain = getCurrentTaskChain(items, testTime, baseCalendar);

    // The task chain should include the parent and the active child
    const hasParent = taskChain.some(item => item.id === subCalendarItem.id);
    const deepestItem = taskChain[taskChain.length - 1];

    console.log(`${test.description}:`);
    console.log(`  - Chain length: ${taskChain.length}`);
    console.log(`  - Has parent: ${hasParent}`);
    console.log(`  - Chain items: [${taskChain.map(item => item.name).join(' -> ')}]`);
    console.log(`  - Expected deepest: ${test.expected}`);
    console.log(`  - Actual deepest: ${deepestItem?.name || 'null'}`);
    console.log(`  - ✅/❌: ${deepestItem?.name === test.expected ? '✅ PASS' : '❌ FAIL'}`);

    if (deepestItem?.name === test.expected) {
      chainTestsPassed++;
    }
    console.log('');
  }

  console.log(`\n=== getCurrentTaskChain Results ===`);
  console.log(`Tests passed: ${chainTestsPassed}/${testTimes.length}`);
  console.log(`Overall: ${chainTestsPassed === testTimes.length ? '✅ All tests passed' : '❌ Some tests failed - BUG CONFIRMED'}`);

  // Also test the working getActiveChildForExecution for comparison
  console.log('\n=== Comparison: getActiveChildForExecution (the working one) ===');

  let executionTestsPassed = 0;
  for (const test of testTimes) {
    const testTime = parentStartTime + test.offset;
    const activeChild = getActiveChildForExecution(subCalendarItem, items, testTime, parentStartTime);
    const isCorrect = activeChild?.name === test.expected;

    console.log(`${test.description}: ${isCorrect ? '✅' : '❌'} Expected: ${test.expected}, Got: ${activeChild?.name || 'null'}`);

    if (isCorrect) {
      executionTestsPassed++;
    }
  }

  console.log(`\ngetActiveChildForExecution Results: ${executionTestsPassed}/${testTimes.length} passed`);

  return {
    chainTestsPassed,
    executionTestsPassed,
    totalTests: testTimes.length,
    bugConfirmed: chainTestsPassed < testTimes.length,
    items,
    subCalendarItem,
    baseCalendar,
    parentStartTime
  };
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testFullExecutionChain();
}
