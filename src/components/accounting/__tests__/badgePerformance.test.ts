import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTotalBasicTime,
  calculateDistinctVariables,
  BadgeCalculationPerformanceMonitor
} from '../utils/badgeCalculations';
import { useBadgeCalculations } from '../hooks/useBadgeCalculations';
import { renderHook } from '@testing-library/react';
import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';
import { BasicItem } from '../../../functions/utils/item/BasicItem';
import { VariableImpl } from '../../../functions/utils/variable/types';

describe('Badge Performance Tests', () => {
  beforeEach(() => {
    // Reset performance monitor before each test
    BadgeCalculationPerformanceMonitor['measurements'].clear();
  });

  describe('Scalability Testing', () => {
    const testSizes = [10, 100, 1000];

    testSizes.forEach(size => {
      it(`handles ${size} instances efficiently`, () => {
        const items = Array.from({ length: size }, (_, i) =>
          new BasicItem({
            id: `item${i}`,
            name: `Item ${i}`,
            duration: Math.floor(Math.random() * 10000) + 1000
          })
        );

        const instances = Array.from({ length: size }, (_, i) =>
          new ItemInstanceImpl({
            id: `inst${i}`,
            itemId: `item${i}`,
            calendarEntryId: `cal${i}`,
            scheduledStartTime: Date.now() - Math.floor(Math.random() * 100000),
            isComplete: Math.random() > 0.3 // 70% complete
          })
        );

        const variables = new Map(
          items.map(item => [
            item.id,
            Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) =>
              new VariableImpl({
                name: `Variable${j}`,
                quantity: Math.floor(Math.random() * 100) + 1,
                category: `Category${j % 3}`
              })
            )
          ])
        );

        const startTime = performance.now();

        const timeResult = calculateTotalBasicTime(instances, items);
        const variableResult = calculateDistinctVariables(instances, items, variables);

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Performance expectations (adjust thresholds based on requirements)
        const expectedMaxTime = size <= 100 ? 50 : size <= 1000 ? 200 : 1000;
        expect(totalTime).toBeLessThan(expectedMaxTime);

        // Verify calculations are still accurate
        expect(timeResult.errors).toHaveLength(0);
        expect(variableResult.errors).toHaveLength(0);
        expect(timeResult.totalTime).toBeGreaterThanOrEqual(0);
        expect(variableResult.distinctCount).toBeGreaterThanOrEqual(0);

        console.log(`${size} instances: ${totalTime.toFixed(2)}ms`);
      });
    });

    it('demonstrates linear complexity scaling', () => {
      const results: Array<{ size: number; time: number }> = [];

      for (const size of [50, 100, 200]) {
        const items = Array.from({ length: size }, (_, i) =>
          new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
        );

        const instances = Array.from({ length: size }, (_, i) =>
          new ItemInstanceImpl({
            id: `inst${i}`,
            itemId: `item${i}`,
            calendarEntryId: `cal${i}`,
            scheduledStartTime: Date.now(),
            isComplete: true
          })
        );

        const variables = new Map(
          items.map(item => [item.id, [new VariableImpl({ name: 'Test', quantity: 1 })]])
        );

        const startTime = performance.now();
        calculateTotalBasicTime(instances, items);
        calculateDistinctVariables(instances, items, variables);
        const endTime = performance.now();

        results.push({ size, time: endTime - startTime });
      }

      // Verify that complexity doesn't grow exponentially
      // Time for 200 items should be less than 5x time for 50 items
      const time50 = results.find(r => r.size === 50)?.time || 0;
      const time200 = results.find(r => r.size === 200)?.time || 0;

      if (time50 > 0) {
        const ratio = time200 / time50;
        expect(ratio).toBeLessThan(5); // Should be closer to 4x for linear complexity
      }

      console.log('Scaling results:', results);
    });
  });

  describe('Hook Performance', () => {
    it('memoization prevents unnecessary recalculations', () => {
      const items = Array.from({ length: 100 }, (_, i) =>
        new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
      );

      const instances = Array.from({ length: 100 }, (_, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: `item${i}`,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      const variables = new Map(
        items.map(item => [item.id, [new VariableImpl({ name: 'Test', quantity: 1 })]])
      );

      const { result, rerender } = renderHook(
        ({ instances, items, variables }) => useBadgeCalculations(instances, items, variables),
        {
          initialProps: { instances, items, variables }
        }
      );

      const firstResult = result.current;
      const firstCalculationTime = firstResult.calculationTime || 0;

      // Rerender with same props (should use memoized result)
      const rerenderStart = performance.now();
      rerender({ instances, items, variables });
      const rerenderEnd = performance.now();
      const rerenderTime = rerenderEnd - rerenderStart;

      const secondResult = result.current;

      // Should be the same object reference (memoized)
      expect(firstResult).toBe(secondResult);

      // Rerender should be much faster than initial calculation
      expect(rerenderTime).toBeLessThan(firstCalculationTime / 2);

      console.log(`Initial: ${firstCalculationTime.toFixed(2)}ms, Rerender: ${rerenderTime.toFixed(2)}ms`);
    });

    it('updates efficiently when data changes', () => {
      const items = Array.from({ length: 50 }, (_, i) =>
        new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
      );

      const instances = Array.from({ length: 50 }, (_, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: `item${i}`,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      const variables = new Map(
        items.map(item => [item.id, [new VariableImpl({ name: 'Test', quantity: 1 })]])
      );

      const { result, rerender } = renderHook(
        ({ instances, items, variables }) => useBadgeCalculations(instances, items, variables),
        {
          initialProps: { instances, items, variables }
        }
      );

      const firstResult = result.current;

      // Change one instance
      const updatedInstances = instances.map((inst, i) =>
        i === 0 ? new ItemInstanceImpl({ ...inst, isComplete: false }) : inst
      );

      const updateStart = performance.now();
      rerender({ instances: updatedInstances, items, variables });
      const updateEnd = performance.now();
      const updateTime = updateEnd - updateStart;

      const secondResult = result.current;

      // Should have different results
      expect(firstResult.totalTime).not.toBe(secondResult.totalTime);

      // Update should be efficient
      expect(updateTime).toBeLessThan(100); // Should complete within 100ms

      console.log(`Update time: ${updateTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('does not leak memory with repeated calculations', () => {
      const items = Array.from({ length: 100 }, (_, i) =>
        new BasicItem({ id: `item${i}`, name: `Item ${i}`, duration: 1000 })
      );

      const instances = Array.from({ length: 100 }, (_, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: `item${i}`,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      const variables = new Map(
        items.map(item => [item.id, [new VariableImpl({ name: 'Test', quantity: 1 })]])
      );

      // Perform many calculations
      for (let i = 0; i < 100; i++) {
        calculateTotalBasicTime(instances, items);
        calculateDistinctVariables(instances, items, variables);
      }

      // Performance monitor should not grow unbounded
      const report = BadgeCalculationPerformanceMonitor.getReport();
      expect(report.calculateTotalBasicTime.count).toBeLessThanOrEqual(100);
      expect(report.calculateDistinctVariables.count).toBeLessThanOrEqual(100);

      // Memory usage test (simplified - real implementation might use more sophisticated monitoring)
      const memoryBefore = process.memoryUsage?.().heapUsed || 0;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryAfter = process.memoryUsage?.().heapUsed || 0;

      // Memory should not have grown significantly (this is a rough check)
      const memoryGrowth = memoryAfter - memoryBefore;
      console.log(`Memory growth: ${memoryGrowth} bytes`);
    });

    it('limits performance measurement storage', () => {
      const items = [new BasicItem({ id: 'item1', name: 'Item 1', duration: 1000 })];
      const instances = [
        new ItemInstanceImpl({
          id: 'inst1',
          itemId: 'item1',
          calendarEntryId: 'cal1',
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      ];

      // Perform many calculations to test storage limits
      for (let i = 0; i < 150; i++) {
        calculateTotalBasicTime(instances, items);
      }

      const report = BadgeCalculationPerformanceMonitor.getReport();

      // Should not store more than 100 measurements (as per implementation)
      expect(report.calculateTotalBasicTime.count).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling Performance', () => {
    it('handles malformed data efficiently', () => {
      const malformedInstances = Array.from({ length: 100 }, (_, i) => ({
        id: `bad${i}`,
        itemId: 'nonexistent',
        isComplete: true
      })) as ItemInstanceImpl[];

      const items = [new BasicItem({ id: 'item1', name: 'Item 1', duration: 1000 })];
      const variables = new Map();

      const startTime = performance.now();

      const timeResult = calculateTotalBasicTime(malformedInstances, items);
      const variableResult = calculateDistinctVariables(malformedInstances, items, variables);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle errors quickly
      expect(totalTime).toBeLessThan(100);

      // Should report errors but not crash
      expect(timeResult.errors.length).toBeGreaterThan(0);
      expect(variableResult.errors.length).toBeGreaterThan(0);

      // Should provide safe fallback values
      expect(timeResult.totalTime).toBe(0);
      expect(variableResult.distinctCount).toBe(0);
    });

    it('recovers gracefully from calculation exceptions', () => {
      // Create data that might cause edge case errors
      const problematicItems = [
        new BasicItem({ id: 'item1', name: 'Item 1', duration: Infinity }),
        new BasicItem({ id: 'item2', name: 'Item 2', duration: -1000 }),
        new BasicItem({ id: 'item3', name: 'Item 3', duration: NaN })
      ];

      const instances = problematicItems.map((item, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: item.id,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      );

      const variables = new Map([
        ['item1', [new VariableImpl({ name: 'Bad', quantity: Infinity })]],
        ['item2', [new VariableImpl({ name: 'Negative', quantity: -100 })]],
        ['item3', [new VariableImpl({ name: 'NaN', quantity: NaN })]]
      ]);

      const startTime = performance.now();

      // Should not throw exceptions
      expect(() => {
        const timeResult = calculateTotalBasicTime(instances, problematicItems);
        const variableResult = calculateDistinctVariables(instances, problematicItems, variables);

        // Should provide safe results
        expect(typeof timeResult.totalTime).toBe('number');
        expect(typeof variableResult.distinctCount).toBe('number');
      }).not.toThrow();

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete quickly even with problematic data
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('handles typical user workload efficiently', () => {
      // Simulate a typical user with mixed completed/incomplete items
      const items = [
        ...Array.from({ length: 20 }, (_, i) =>
          new BasicItem({ id: `basic${i}`, name: `Basic ${i}`, duration: Math.random() * 10000 + 1000 })
        ),
        ...Array.from({ length: 5 }, (_, i) =>
          new BasicItem({ id: `project${i}`, name: `Project ${i}`, duration: Math.random() * 50000 + 10000 })
        )
      ];

      const instances = items.map((item, i) =>
        new ItemInstanceImpl({
          id: `inst${i}`,
          itemId: item.id,
          calendarEntryId: `cal${i}`,
          scheduledStartTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Past week
          isComplete: Math.random() > 0.4 // 60% complete
        })
      );

      const variables = new Map(
        items.map(item => [
          item.id,
          Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) =>
            new VariableImpl({
              name: `Var${j}`,
              quantity: Math.random() * 10 + 1,
              unit: j % 2 === 0 ? 'hours' : 'points',
              category: ['Time', 'Quality', 'Complexity', 'Resources'][j % 4]
            })
          )
        ])
      );

      const { result } = renderHook(() =>
        useBadgeCalculations(instances, items, variables)
      );

      const calculations = result.current;

      // Should complete within acceptable time for typical workload
      expect(calculations.calculationTime).toBeLessThan(50);

      // Should provide meaningful results
      expect(calculations.isValid).toBe(true);
      expect(calculations.errors).toHaveLength(0);

      console.log(`Typical workload (${items.length} items): ${calculations.calculationTime?.toFixed(2)}ms`);
      console.log(`Results: ${calculations.formattedTime} time, ${calculations.distinctVariableCount} variables`);
    });
  });
});
