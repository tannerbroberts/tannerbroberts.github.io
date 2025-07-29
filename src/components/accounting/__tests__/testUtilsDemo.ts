/**
 * Demonstration of how to use the accounting test utilities
 * This file shows typical usage patterns for testing accounting view behavior
 */

import {
  createTestSubCalendarWithChildren,
  createTestChildItems,
  createTestItemInstances,
  validateTestItemStructure,
  TEST_ITEM_IDS,
  TIMING_CONSTANTS
} from './testUtils';
import { AccountingTestDataFactory, TEST_SCENARIOS } from './accountingTestData';

// Example 1: Basic test setup
export function demonstrateBasicUsage() {
  console.log('=== Basic Test Data Creation ===');

  // Create test items
  const parentItem = createTestSubCalendarWithChildren();
  const childItems = createTestChildItems();

  console.log(`Created parent: ${parentItem.name} (${parentItem.duration}ms)`);
  console.log(`Created ${childItems.length} children:`);

  childItems.forEach((child, index) => {
    console.log(`  - ${child.name}: ${child.duration}ms`);
  });

  // Validate structure
  validateTestItemStructure(parentItem, childItems);
  console.log('✓ Test structure validation passed');

  // Show timing
  console.log('\nChild timing pattern:');
  parentItem.children.forEach((child, index) => {
    const endTime = child.start + TIMING_CONSTANTS.CHILD_DURATION;
    console.log(`  Child ${index + 1}: ${child.start}ms - ${endTime}ms`);
  });
}

// Example 2: Time-based scenario testing
export function demonstrateTimeBasedTesting() {
  console.log('\n=== Time-Based Scenario Testing ===');

  const factory = new AccountingTestDataFactory(Date.now());

  // Test different time points
  const scenarios = [
    { name: 'First Second', time: 500 },
    { name: 'After First Child', time: 1500 },
    { name: 'During Second Child', time: 2500 },
    { name: 'After All Complete', time: 9500 }
  ];

  scenarios.forEach(({ name, time }) => {
    const result = factory.createScenarioAtTime(time);
    console.log(`\n${name} (${time}ms):`);
    console.log(`  Active Child: ${result.expectedActiveChild !== null ? `Child ${result.expectedActiveChild + 1}` : 'None'}`);
    console.log(`  Completed: [${result.expectedCompletedChildren.map(i => `Child ${i + 1}`).join(', ')}]`);
  });
}

// Example 3: Predefined test scenarios
export function demonstratePredefinedScenarios() {
  console.log('\n=== Predefined Test Scenarios ===');

  // Use predefined scenarios for consistent testing
  const predictableScenario = TEST_SCENARIOS.createPredictableScenario();
  console.log(`Predictable scenario base time: ${new Date(predictableScenario.baseStartTime).toISOString()}`);

  // Create time progression scenarios for testing state transitions
  const progressionScenarios = TEST_SCENARIOS.createTimeProgressionScenarios();
  console.log('\nTime progression scenarios:');

  Object.entries(progressionScenarios).forEach(([phase, scenario]) => {
    console.log(`  ${phase}: ${scenario.expectedActiveChild !== null ? `Child ${scenario.expectedActiveChild + 1} active` : 'No active child'}`);
  });
}

// Example 4: ItemInstance creation and management
export function demonstrateInstanceManagement() {
  console.log('\n=== ItemInstance Management ===');

  const baseStartTime = Date.now();
  const { parentInstance, childInstances } = createTestItemInstances(baseStartTime);

  console.log(`Parent instance: ${parentInstance.itemId} at ${new Date(parentInstance.scheduledStartTime).toLocaleTimeString()}`);
  console.log('Child instances:');

  childInstances.forEach((instance, index) => {
    const offset = instance.scheduledStartTime - baseStartTime;
    console.log(`  ${instance.itemId}: +${offset}ms (${new Date(instance.scheduledStartTime).toLocaleTimeString()})`);
  });

  console.log(`\nAll instances initially incomplete: ${[parentInstance, ...childInstances].every(i => !i.isComplete)}`);
}

// Example 5: Integration with existing systems
export function demonstrateIntegration() {
  console.log('\n=== Integration Example ===');

  const factory = new AccountingTestDataFactory();
  const scenario = factory.createCompleteTestScenario();

  // This would integrate with existing accounting view logic
  console.log('Test scenario created with:');
  console.log(`  - ${scenario.allItems.length} items (1 parent + 5 children)`);
  console.log(`  - ${scenario.allInstances.length} instances`);
  console.log(`  - ${scenario.calendarEntries.length} calendar entries`);

  // Example of how this would be used in actual tests:
  console.log('\nExample test assertions would check:');
  console.log('  ✓ Accounting view shows nothing during first second');
  console.log('  ✓ First child appears after 1000ms execution');
  console.log('  ✓ Subsequent children appear at correct intervals');
  console.log('  ✓ All timing relationships are preserved');
}

// Run demonstrations if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  demonstrateBasicUsage();
  demonstrateTimeBasedTesting();
  demonstratePredefinedScenarios();
  demonstrateInstanceManagement();
  demonstrateIntegration();
}
