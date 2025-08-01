// Debug version of the integration test to diagnose the issue
import {
  Item,
  SubCalendarItem,
  BasicItem,
  getCurrentTaskChain
} from '../functions/utils/item/index';
import { getActiveChildForExecution } from '../components/execution/executionUtils';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';

const testData = {
  // Create test items
  firstTask: new BasicItem({
    id: 'first',
    name: 'First Task',
    duration: 5000 // 5 seconds
  }),

  secondTask: new BasicItem({
    id: 'second',
    name: 'Second Task',
    duration: 10000 // 10 seconds
  }),

  thirdTask: new BasicItem({
    id: 'third',
    name: 'Third Task',
    duration: 15000 // 15 seconds
  }),

  subCalendarItem: new SubCalendarItem({
    id: 'subcal',
    name: 'Multi-Child SubCalendar',
    duration: 50000, // 50 seconds total
    children: [
      { id: 'first', start: 0, relationshipId: 'rel1' },      // 0-5s
      { id: 'second', start: 10000, relationshipId: 'rel2' }, // 10-20s  
      { id: 'third', start: 25000, relationshipId: 'rel3' }   // 25-40s
    ]
  })
};

const items: Item[] = [
  testData.firstTask,
  testData.secondTask,
  testData.thirdTask,
  testData.subCalendarItem
].sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID for binary search

// Create base calendar entry
const baseCalendar = new Map<string, BaseCalendarEntry>();
const parentStartTime = 1000000; // 1000 seconds after epoch
baseCalendar.set('subcal', {
  id: 'entry1',
  itemId: 'subcal',
  startTime: parentStartTime
});

console.log('=== Detailed Debug Test ===');
console.log('Items array:', items.map(item => ({ id: item.id, name: item.name })));

// Test times for debugging
const testTimes = [
  { time: parentStartTime + 2000, expected: 'First Task', label: '2s into first child' },
  { time: parentStartTime + 12000, expected: 'Second Task', label: '12s into second child' },
  { time: parentStartTime + 27000, expected: 'Third Task', label: '27s into third child' }
];

for (const testCase of testTimes) {
  console.log(`\n=== Testing at ${testCase.label} (time: ${testCase.time}) ===`);

  const taskChain = getCurrentTaskChain(items, testCase.time, baseCalendar);
  const deepestItem = taskChain.length > 0 ? taskChain[taskChain.length - 1] : null;

  console.log(`Chain length: ${taskChain.length}`);
  console.log(`Chain items: ${taskChain.map(item => item.name).join(' -> ')}`);
  console.log(`Expected deepest: ${testCase.expected}`);
  console.log(`Actual deepest: ${deepestItem?.name || 'null'}`);

  // Also test getActiveChildForExecution directly
  const activeChild = getActiveChildForExecution(testData.subCalendarItem, items, testCase.time, parentStartTime);
  console.log(`getActiveChildForExecution result: ${activeChild?.name || 'null'}`);

  // Test pass/fail
  const passed = deepestItem?.name === testCase.expected;
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
}
