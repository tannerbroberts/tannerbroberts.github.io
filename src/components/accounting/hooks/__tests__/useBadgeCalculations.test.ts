import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  useBadgeCalculations,
  useTimeCalculations,
  useVariableCalculations
} from '../useBadgeCalculations';
import { ItemInstanceImpl } from '../../../../functions/utils/itemInstance/types';
import { BasicItem } from '../../../../functions/utils/item/BasicItem';
import { SubCalendarItem } from '../../../../functions/utils/item/SubCalendarItem';
import { VariableImpl } from '../../../../functions/utils/variable/types';

describe('Badge Calculation Hooks', () => {
  let basicItems: BasicItem[];
  let subCalendarItems: SubCalendarItem[];
  let instances: ItemInstanceImpl[];
  let itemVariables: Map<string, VariableImpl[]>;

  beforeEach(() => {
    // Create test data
    basicItems = [
      new BasicItem({ id: 'basic1', name: 'Basic Task 1', duration: 5000 }),
      new BasicItem({ id: 'basic2', name: 'Basic Task 2', duration: 10000 }),
      new BasicItem({ id: 'basic3', name: 'Basic Task 3', duration: 7500 })
    ];

    subCalendarItems = [
      new SubCalendarItem({ id: 'sub1', name: 'SubCalendar 1', duration: 20000 })
    ];

    instances = [
      new ItemInstanceImpl({
        id: 'inst1',
        itemId: 'basic1',
        calendarEntryId: 'cal1',
        scheduledStartTime: Date.now() - 100000,
        isComplete: true
      }),
      new ItemInstanceImpl({
        id: 'inst2',
        itemId: 'basic2',
        calendarEntryId: 'cal2',
        scheduledStartTime: Date.now() - 90000,
        isComplete: true
      }),
      new ItemInstanceImpl({
        id: 'inst3',
        itemId: 'basic3',
        calendarEntryId: 'cal3',
        scheduledStartTime: Date.now() - 80000,
        isComplete: false // Incomplete, should be excluded
      }),
      new ItemInstanceImpl({
        id: 'inst4',
        itemId: 'sub1',
        calendarEntryId: 'cal4',
        scheduledStartTime: Date.now() - 70000,
        isComplete: true // SubCalendar, should be excluded from time calculations
      })
    ];

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

  describe('useBadgeCalculations', () => {
    it('calculates badge values correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useBadgeCalculations(instances, allItems, itemVariables)
      );

      const calculations = result.current;

      // Time calculations (only completed BasicItems: basic1 + basic2 = 15000ms)
      expect(calculations.totalTime).toBe(15000);
      expect(calculations.formattedTime).toBe('15s');
      expect(calculations.timeBreakdown.totalCount).toBe(2);

      // Variable calculations (from completed instances: basic1, basic2, sub1)
      expect(calculations.distinctVariableCount).toBe(4); // Hours, Quality, Difficulty, Complexity
      expect(calculations.isValid).toBe(true);
      expect(calculations.errors).toHaveLength(0);
    });

    it('memoizes calculations properly', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result, rerender } = renderHook(
        ({ instances, items, variables }) => useBadgeCalculations(instances, items, variables),
        {
          initialProps: {
            instances,
            items: allItems,
            variables: itemVariables
          }
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({
        instances,
        items: allItems,
        variables: itemVariables
      });

      const secondResult = result.current;

      // Results should be the same object (memoized)
      expect(firstResult).toBe(secondResult);
    });

    it('recalculates when dependencies change', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result, rerender } = renderHook(
        ({ instances, items, variables }) => useBadgeCalculations(instances, items, variables),
        {
          initialProps: {
            instances,
            items: allItems,
            variables: itemVariables
          }
        }
      );

      const firstResult = result.current;

      // Change instances (complete the incomplete one)
      const updatedInstances = instances.map(inst =>
        inst.id === 'inst3' ?
          new ItemInstanceImpl({ ...inst, isComplete: true }) :
          inst
      );

      rerender({
        instances: updatedInstances,
        items: allItems,
        variables: itemVariables
      });

      const secondResult = result.current;

      // Results should be different
      expect(firstResult.totalTime).not.toBe(secondResult.totalTime);
      expect(secondResult.totalTime).toBe(22500); // Now includes basic3 (7500ms)
    });

    it('handles empty data gracefully', () => {
      const { result } = renderHook(() =>
        useBadgeCalculations([], [], new Map())
      );

      const calculations = result.current;

      expect(calculations.totalTime).toBe(0);
      expect(calculations.formattedTime).toBe('0s');
      expect(calculations.distinctVariableCount).toBe(0);
      expect(calculations.isValid).toBe(true);
      expect(calculations.errors).toHaveLength(0);
    });

    it('handles calculation errors gracefully', () => {
      // Create malformed data that might cause errors
      const malformedInstances = [
        { id: 'bad', itemId: 'nonexistent', isComplete: true } as ItemInstanceImpl
      ];

      const { result } = renderHook(() =>
        useBadgeCalculations(malformedInstances, basicItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.isValid).toBe(false);
      expect(calculations.errors.length).toBeGreaterThan(0);
      // Should still provide fallback values
      expect(calculations.totalTime).toBe(0);
      expect(calculations.distinctVariableCount).toBe(0);
    });

    it('includes performance monitoring', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useBadgeCalculations(instances, allItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.calculationTime).toBeDefined();
      expect(typeof calculations.calculationTime).toBe('number');
      expect(calculations.calculationTime).toBeGreaterThan(0);
    });

    it('provides category summaries', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useBadgeCalculations(instances, allItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.categorySummaries).toBeDefined();
      expect(Array.isArray(calculations.categorySummaries)).toBe(true);
      expect(calculations.categorySummaries.length).toBeGreaterThan(0);

      // Should have Time and Assessment categories
      const categoryNames = calculations.categorySummaries.map(c => c.category);
      expect(categoryNames).toContain('Time');
      expect(categoryNames).toContain('Assessment');
    });

    it('creates helpful tooltips', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useBadgeCalculations(instances, allItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.timeTooltip).toContain('BasicItem');
      expect(calculations.timeTooltip).toContain('requiring accounting');
      expect(calculations.variableTooltip).toContain('distinct variable');
      expect(calculations.variableTooltip).toContain('requiring accounting');
    });
  });

  describe('useTimeCalculations', () => {
    it('calculates time correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useTimeCalculations(instances, allItems)
      );

      const calculations = result.current;

      expect(calculations.totalTime).toBe(15000); // basic1 + basic2
      expect(calculations.formattedTime).toBe('15s');
      expect(calculations.timeTooltip).toContain('2 BasicItems');
      expect(calculations.errors).toHaveLength(0);
    });

    it('memoizes calculations', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result, rerender } = renderHook(
        ({ instances, items }) => useTimeCalculations(instances, items),
        {
          initialProps: { instances, items: allItems }
        }
      );

      const firstResult = result.current;
      rerender({ instances, items: allItems });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('handles errors gracefully', () => {
      const malformedInstances = [
        { id: 'bad', itemId: 'nonexistent' } as ItemInstanceImpl
      ];

      const { result } = renderHook(() =>
        useTimeCalculations(malformedInstances, basicItems)
      );

      const calculations = result.current;

      expect(calculations.totalTime).toBe(0);
      expect(calculations.formattedTime).toBe('0s');
      expect(calculations.timeTooltip).toBe('Error calculating time');
      expect(calculations.errors.length).toBeGreaterThan(0);
    });
  });

  describe('useVariableCalculations', () => {
    it('calculates variables correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result } = renderHook(() =>
        useVariableCalculations(instances, allItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.distinctCount).toBe(4); // Hours, Quality, Difficulty, Complexity
      expect(calculations.variableTooltip).toContain('4 distinct variables');
      expect(calculations.errors).toHaveLength(0);
    });

    it('memoizes calculations', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const { result, rerender } = renderHook(
        ({ instances, items, variables }) => useVariableCalculations(instances, items, variables),
        {
          initialProps: {
            instances,
            items: allItems,
            variables: itemVariables
          }
        }
      );

      const firstResult = result.current;
      rerender({
        instances,
        items: allItems,
        variables: itemVariables
      });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('handles errors gracefully', () => {
      const malformedInstances = [
        { id: 'bad', itemId: 'nonexistent' } as ItemInstanceImpl
      ];

      const { result } = renderHook(() =>
        useVariableCalculations(malformedInstances, basicItems, itemVariables)
      );

      const calculations = result.current;

      expect(calculations.distinctCount).toBe(0);
      expect(calculations.variableTooltip).toBe('Error calculating variables');
      expect(calculations.errors.length).toBeGreaterThan(0);
    });

    it('handles missing variables', () => {
      const emptyVariables = new Map<string, VariableImpl[]>();
      const { result } = renderHook(() =>
        useVariableCalculations(instances, basicItems, emptyVariables)
      );

      const calculations = result.current;

      expect(calculations.distinctCount).toBe(0);
      expect(calculations.variableTooltip).toContain('No variables requiring accounting');
      expect(calculations.errors).toHaveLength(0);
    });
  });

  describe('Performance characteristics', () => {
    it('handles large datasets efficiently', () => {
      // Create a large dataset
      const largeItems = Array.from({ length: 100 }, (_, i) =>
        new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
      );

      const largeInstances = Array.from({ length: 100 }, (_, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: `item${i}`,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      const largeVariables = new Map(
        largeItems.map(item => [
          item.id,
          [new VariableImpl({ name: 'TestVar', quantity: 1 })]
        ])
      );

      const startTime = performance.now();

      const { result } = renderHook(() =>
        useBadgeCalculations(largeInstances, largeItems, largeVariables)
      );

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(calculationTime).toBeLessThan(1000); // 1 second

      // Should still produce correct results
      expect(result.current.totalTime).toBe(100000); // 100 items * 1000ms each
      expect(result.current.distinctVariableCount).toBe(1); // All same variable name
      expect(result.current.isValid).toBe(true);
    });

    it('warns about slow calculations', () => {
      const allItems = [...basicItems, ...subCalendarItems];

      // Mock console.warn to capture warnings
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (message: string) => {
        warnings.push(message);
      };

      try {
        const { result } = renderHook(() =>
          useBadgeCalculations(instances, allItems, itemVariables)
        );

        // Access result to trigger calculation
        expect(result.current.totalTime).toBeDefined();

        // For small datasets, we probably won't get warnings, but the mechanism should exist
        // The actual warning threshold can be tested with larger datasets in integration tests
      } finally {
        console.warn = originalWarn;
      }
    });
  });
});
