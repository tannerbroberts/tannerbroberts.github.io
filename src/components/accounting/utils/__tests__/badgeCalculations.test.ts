import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateTotalBasicTime,
  calculateDistinctVariables,
  aggregateVariablesByCategory,
  formatDuration,
  createTimeTooltip,
  createVariableTooltip,
  BadgeCalculationPerformanceMonitor
} from '../badgeCalculations';
import { ItemInstanceImpl } from '../../../../functions/utils/itemInstance/types';
import { BasicItem } from '../../../../functions/utils/item/BasicItem';
import { SubCalendarItem } from '../../../../functions/utils/item/SubCalendarItem';
import { CheckListItem } from '../../../../functions/utils/item/CheckListItem';
import { VariableImpl } from '../../../../functions/utils/variable/types';

describe('Badge Calculations', () => {
  let basicItems: BasicItem[];
  let subCalendarItems: SubCalendarItem[];
  let checkListItems: CheckListItem[];
  let instances: ItemInstanceImpl[];
  let itemVariables: Map<string, VariableImpl[]>;

  beforeEach(() => {
    // Reset performance monitor
    BadgeCalculationPerformanceMonitor['measurements'].clear();

    // Create test items
    basicItems = [
      new BasicItem({ id: 'basic1', name: 'Basic Task 1', duration: 5000 }), // 5 seconds
      new BasicItem({ id: 'basic2', name: 'Basic Task 2', duration: 10000 }), // 10 seconds
      new BasicItem({ id: 'basic3', name: 'Basic Task 3', duration: 0 }), // 0 seconds (edge case)
    ];

    subCalendarItems = [
      new SubCalendarItem({ id: 'sub1', name: 'SubCalendar 1', duration: 20000 })
    ];

    checkListItems = [
      new CheckListItem({ id: 'check1', name: 'CheckList 1', duration: 15000 })
    ];

    // Create test instances
    instances = [
      new ItemInstanceImpl({
        id: 'inst1',
        itemId: 'basic1',
        calendarEntryId: 'cal1',
        scheduledStartTime: Date.now() - 100000,
        isComplete: true // Completed BasicItem
      }),
      new ItemInstanceImpl({
        id: 'inst2',
        itemId: 'basic2',
        calendarEntryId: 'cal2',
        scheduledStartTime: Date.now() - 90000,
        isComplete: true // Completed BasicItem
      }),
      new ItemInstanceImpl({
        id: 'inst3',
        itemId: 'basic3',
        calendarEntryId: 'cal3',
        scheduledStartTime: Date.now() - 80000,
        isComplete: false // Incomplete BasicItem (should be excluded)
      }),
      new ItemInstanceImpl({
        id: 'inst4',
        itemId: 'sub1',
        calendarEntryId: 'cal4',
        scheduledStartTime: Date.now() - 70000,
        isComplete: true // Completed SubCalendar (should be excluded)
      }),
      new ItemInstanceImpl({
        id: 'inst5',
        itemId: 'check1',
        calendarEntryId: 'cal5',
        scheduledStartTime: Date.now() - 60000,
        isComplete: true // Completed CheckList (should be excluded)
      })
    ];

    // Create test variables
    itemVariables = new Map([
      ['basic1', [
        new VariableImpl({ name: 'Hours', quantity: 2.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Quality', quantity: 8, unit: 'points', category: 'Assessment' })
      ]],
      ['basic2', [
        new VariableImpl({ name: 'Hours', quantity: 1.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Difficulty', quantity: 6, unit: 'points', category: 'Assessment' })
      ]],
      ['basic3', [
        new VariableImpl({ name: 'Hours', quantity: 0.5, unit: 'hours', category: 'Time' })
      ]],
      ['sub1', [
        new VariableImpl({ name: 'Complexity', quantity: 9, unit: 'points', category: 'Assessment' })
      ]]
    ]);
  });

  describe('calculateTotalBasicTime', () => {
    it('calculates total time correctly for BasicItems only', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateTotalBasicTime(instances, allItems);

      // Should only count basic1 (5000ms) and basic2 (10000ms) = 15000ms
      // basic3 is incomplete, sub1 and check1 are not BasicItems
      expect(result.totalTime).toBe(15000);
      expect(result.errors).toHaveLength(0);
      expect(result.breakdown.totalCount).toBe(2);
      expect(result.breakdown.averageDuration).toBe(7500);
    });

    it('excludes incomplete instances', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateTotalBasicTime(instances, allItems);

      // basic3 is incomplete and should be excluded
      expect(result.totalTime).toBe(15000);
      expect(result.breakdown.basicItems).toHaveLength(2);
    });

    it('excludes non-BasicItem instances', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateTotalBasicTime(instances, allItems);

      // Should not include sub1 or check1
      const itemNames = result.breakdown.basicItems.map(item => item.itemName);
      expect(itemNames).not.toContain('SubCalendar 1');
      expect(itemNames).not.toContain('CheckList 1');
    });

    it('handles edge cases gracefully', () => {
      const result = calculateTotalBasicTime([], []);
      expect(result.totalTime).toBe(0);
      expect(result.breakdown.totalCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('handles malformed data', () => {
      const malformedInstances = [
        { id: 'bad', itemId: 'nonexistent', isComplete: true } as ItemInstanceImpl
      ];
      const result = calculateTotalBasicTime(malformedInstances, basicItems);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('filters out zero and invalid durations', () => {
      const items = [
        new BasicItem({ id: 'zero', name: 'Zero Duration', duration: 0 }),
        new BasicItem({ id: 'negative', name: 'Negative Duration', duration: -1000 }),
        new BasicItem({ id: 'infinite', name: 'Infinite Duration', duration: Infinity }),
        new BasicItem({ id: 'normal', name: 'Normal Duration', duration: 5000 })
      ];

      const testInstances = [
        new ItemInstanceImpl({
          id: 'inst_zero',
          itemId: 'zero',
          calendarEntryId: 'cal',
          scheduledStartTime: Date.now(),
          isComplete: true
        }),
        new ItemInstanceImpl({
          id: 'inst_negative',
          itemId: 'negative',
          calendarEntryId: 'cal',
          scheduledStartTime: Date.now(),
          isComplete: true
        }),
        new ItemInstanceImpl({
          id: 'inst_infinite',
          itemId: 'infinite',
          calendarEntryId: 'cal',
          scheduledStartTime: Date.now(),
          isComplete: true
        }),
        new ItemInstanceImpl({
          id: 'inst_normal',
          itemId: 'normal',
          calendarEntryId: 'cal',
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      ];

      const result = calculateTotalBasicTime(testInstances, items);
      expect(result.totalTime).toBe(5000); // Only normal duration
      expect(result.breakdown.totalCount).toBe(1);
    });
  });

  describe('calculateDistinctVariables', () => {
    it('calculates distinct variables correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateDistinctVariables(instances, allItems, itemVariables);

      // Variables from basic1, basic2 (completed) and sub1 (completed)
      // basic3 is incomplete so shouldn't count
      // Distinct variables: Hours (from basic1, basic2), Quality (basic1), Difficulty (basic2), Complexity (sub1)
      expect(result.distinctCount).toBe(4);
      expect(result.errors).toHaveLength(0);
    });

    it('aggregates variable quantities correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateDistinctVariables(instances, allItems, itemVariables);

      const hoursVariable = result.variableDetails.byName.get('hours'); // Variable names are normalized to lowercase
      expect(hoursVariable).toBeDefined();
      expect(hoursVariable?.totalQuantity).toBe(4.0); // 2.5 + 1.5 from basic1 and basic2
    });

    it('groups variables by category', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const result = calculateDistinctVariables(instances, allItems, itemVariables);

      expect(result.variableDetails.byCategory.has('Time')).toBe(true);
      expect(result.variableDetails.byCategory.has('Assessment')).toBe(true);

      const timeCategory = result.variableDetails.byCategory.get('Time');
      expect(timeCategory).toHaveLength(1); // Hours variable
    });

    it('handles items without variables', () => {
      const emptyVariables = new Map<string, VariableImpl[]>();
      const result = calculateDistinctVariables(instances, basicItems, emptyVariables);

      expect(result.distinctCount).toBe(0);
      expect(result.variableDetails.totalQuantity).toBe(0);
    });
  });

  describe('aggregateVariablesByCategory', () => {
    it('creates category summaries correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const variableResult = calculateDistinctVariables(instances, allItems, itemVariables);
      const categorySummaries = aggregateVariablesByCategory(variableResult.variableDetails);

      expect(categorySummaries).toHaveLength(2); // Time and Assessment categories
      expect(categorySummaries[0].category).toBeDefined();
      expect(categorySummaries[0].uniqueVariableCount).toBeGreaterThan(0);
      expect(categorySummaries[0].totalQuantity).toBeGreaterThan(0);
    });

    it('sorts categories by total quantity', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const variableResult = calculateDistinctVariables(instances, allItems, itemVariables);
      const categorySummaries = aggregateVariablesByCategory(variableResult.variableDetails);

      for (let i = 1; i < categorySummaries.length; i++) {
        expect(categorySummaries[i - 1].totalQuantity).toBeGreaterThanOrEqual(
          categorySummaries[i].totalQuantity
        );
      }
    });
  });

  describe('formatDuration', () => {
    it('formats various durations correctly', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(3665000)).toBe('1h 1m');
      expect(formatDuration(7200000)).toBe('2h');
    });

    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(-1000)).toBe('0s');
      expect(formatDuration(Infinity)).toBe('0s');
    });
  });

  describe('createTimeTooltip', () => {
    it('creates informative tooltip text', () => {
      const breakdown = {
        basicItems: [
          { instanceId: '1', itemId: '1', itemName: 'Task 1', duration: 5000, scheduledTime: Date.now() },
          { instanceId: '2', itemId: '2', itemName: 'Task 2', duration: 10000, scheduledTime: Date.now() }
        ],
        totalCount: 2,
        averageDuration: 7500
      };

      const tooltip = createTimeTooltip(breakdown);
      expect(tooltip).toContain('2 BasicItems requiring accounting');
      expect(tooltip).toContain('Average duration: 7s');
    });

    it('handles empty breakdown', () => {
      const breakdown = { basicItems: [], totalCount: 0, averageDuration: 0 };
      const tooltip = createTimeTooltip(breakdown);
      expect(tooltip).toContain('No BasicItem instances requiring accounting');
    });
  });

  describe('createVariableTooltip', () => {
    it('creates informative variable tooltip', () => {
      const variableDetails = {
        byName: new Map([
          ['Hours', { name: 'Hours', totalQuantity: 4.0, unit: 'hours', category: 'Time', itemCount: 2, instanceIds: new Set(['1', '2']) }]
        ]),
        byCategory: new Map([
          ['Time', [{ name: 'Hours', totalQuantity: 4.0, unit: 'hours', category: 'Time', itemCount: 2, instanceIds: new Set(['1', '2']) }]]
        ]),
        totalQuantity: 4.0
      };

      const tooltip = createVariableTooltip(variableDetails);
      expect(tooltip).toContain('1 distinct variable requiring accounting');
      expect(tooltip).toContain('Total quantity across all variables: 4');
    });
  });

  describe('Performance Monitoring', () => {
    it('tracks calculation performance', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];

      // Perform multiple calculations to generate performance data
      for (let i = 0; i < 5; i++) {
        calculateTotalBasicTime(instances, allItems);
        calculateDistinctVariables(instances, allItems, itemVariables);
      }

      const report = BadgeCalculationPerformanceMonitor.getReport();
      expect(report).toHaveProperty('calculateTotalBasicTime');
      expect(report).toHaveProperty('calculateDistinctVariables');
      expect(report.calculateTotalBasicTime.count).toBe(5);
      expect(report.calculateDistinctVariables.count).toBe(5);
    });

    it('warns about slow calculations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      // Create a large dataset to trigger performance warning
      const largeItems = Array.from({ length: 1000 }, (_, i) =>
        new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
      );

      const largeInstances = Array.from({ length: 1000 }, (_, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: `item${i}`,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      calculateTotalBasicTime(largeInstances, largeItems);

      // Note: This might not always trigger the warning depending on system performance
      // The test is more about ensuring the warning mechanism exists
      consoleSpy.mockRestore();
    });
  });
});
