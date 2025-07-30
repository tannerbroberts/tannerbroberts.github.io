import { useMemo, useCallback } from 'react';
import { ItemInstance } from '../../../functions/utils/itemInstance/types';
import { Item } from '../../../functions/utils/item/Item';
import { Variable } from '../../../functions/utils/variable/types';
import {
  calculateTotalBasicTime,
  calculateDistinctVariables,
  aggregateVariablesByCategory,
  formatDuration,
  createTimeTooltip,
  createVariableTooltip,
  BadgeCalculationPerformanceMonitor,
  TimeBreakdown,
  VariableDetails,
  CategorySummary
} from '../utils/badgeCalculations';
import { validateVariableHierarchy } from '../utils/variableAggregator';

export interface BadgeCalculationResult {
  // Time-related calculations
  totalTime: number;
  formattedTime: string;
  timeBreakdown: TimeBreakdown;
  timeTooltip: string;

  // Variable-related calculations
  distinctVariableCount: number;
  variableDetails: VariableDetails;
  variableTooltip: string;
  categorySummaries: CategorySummary[];

  // Error handling
  errors: string[];
  warnings: string[];
  isValid: boolean;

  // Performance metrics
  calculationTime?: number;
}

/**
 * Custom hook for managing badge calculations with memoization and error handling
 */
export function useBadgeCalculations(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): BadgeCalculationResult {

  // Memoize the expensive calculations
  const calculations = useMemo(() => {
    const startTime = performance.now();

    try {
      // Validate data integrity first
      const validation = validateVariableHierarchy(instances, items, itemVariables);

      // Calculate time-related metrics
      const timeResult = calculateTotalBasicTime(instances, items);
      const formattedTime = formatDuration(timeResult.totalTime);
      const timeTooltip = createTimeTooltip(timeResult.breakdown);

      // Calculate variable-related metrics
      const variableResult = calculateDistinctVariables(instances, items, itemVariables);
      const variableTooltip = createVariableTooltip(variableResult.variableDetails);
      const categorySummaries = aggregateVariablesByCategory(variableResult.variableDetails);

      // Combine all errors and warnings
      const allErrors = [
        ...timeResult.errors,
        ...variableResult.errors,
        ...validation.issues
      ];

      const allWarnings = [
        ...validation.warnings
      ];

      const calculationTime = performance.now() - startTime;

      return {
        totalTime: timeResult.totalTime,
        formattedTime,
        timeBreakdown: timeResult.breakdown,
        timeTooltip,
        distinctVariableCount: variableResult.distinctCount,
        variableDetails: variableResult.variableDetails,
        variableTooltip,
        categorySummaries,
        errors: allErrors,
        warnings: allWarnings,
        isValid: allErrors.length === 0,
        calculationTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
      console.error('Badge calculation error:', error);

      return {
        totalTime: 0,
        formattedTime: '0s',
        timeBreakdown: { basicItems: [], totalCount: 0, averageDuration: 0 },
        timeTooltip: 'Error calculating time',
        distinctVariableCount: 0,
        variableDetails: { byName: new Map(), byCategory: new Map(), totalQuantity: 0 },
        variableTooltip: 'Error calculating variables',
        categorySummaries: [],
        errors: [errorMessage],
        warnings: [],
        isValid: false,
        calculationTime: performance.now() - startTime
      };
    }
  }, [instances, items, itemVariables]);

  // Optional: Performance monitoring
  const getPerformanceReport = useCallback(() => {
    return BadgeCalculationPerformanceMonitor.getReport();
  }, []);

  // Log performance issues if they occur
  if (calculations.calculationTime && calculations.calculationTime > 100) {
    console.warn(
      `Badge calculations took ${calculations.calculationTime.toFixed(2)}ms ` +
      `(instances: ${instances.length}, items: ${items.length})`
    );
  }

  return {
    ...calculations,
    // Expose performance report for debugging
    getPerformanceReport
  } as BadgeCalculationResult & { getPerformanceReport: () => Record<string, { average: number; count: number; max: number }> };
}

/**
 * Lightweight hook for just time calculations when variables aren't needed
 */
export function useTimeCalculations(
  instances: ItemInstance[],
  items: Item[]
): { totalTime: number; formattedTime: string; timeTooltip: string; errors: string[] } {

  return useMemo(() => {
    try {
      const timeResult = calculateTotalBasicTime(instances, items);
      const formattedTime = formatDuration(timeResult.totalTime);
      const timeTooltip = createTimeTooltip(timeResult.breakdown);

      return {
        totalTime: timeResult.totalTime,
        formattedTime,
        timeTooltip,
        errors: timeResult.errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        totalTime: 0,
        formattedTime: '0s',
        timeTooltip: 'Error calculating time',
        errors: [errorMessage]
      };
    }
  }, [instances, items]);
}

/**
 * Lightweight hook for just variable calculations when time isn't needed
 */
export function useVariableCalculations(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): { distinctCount: number; variableTooltip: string; errors: string[] } {

  return useMemo(() => {
    try {
      const variableResult = calculateDistinctVariables(instances, items, itemVariables);
      const variableTooltip = createVariableTooltip(variableResult.variableDetails);

      return {
        distinctCount: variableResult.distinctCount,
        variableTooltip,
        errors: variableResult.errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        distinctCount: 0,
        variableTooltip: 'Error calculating variables',
        errors: [errorMessage]
      };
    }
  }, [instances, items, itemVariables]);
}

/**
 * Debounced version of badge calculations for rapid data changes
 */
export function useDebouncedBadgeCalculations(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): BadgeCalculationResult {

  // This would typically use a debounce utility, but for now we'll use the regular hook
  // In a real implementation, you'd want to debounce the inputs before passing to useBadgeCalculations
  return useBadgeCalculations(instances, items, itemVariables);
}

/**
 * Hook with circuit breaker pattern for handling calculation errors gracefully
 */
export function useBadgeCalculationsWithCircuitBreaker(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): BadgeCalculationResult & { isCircuitOpen: boolean } {

  // This is a simplified version - a full implementation would track error counts and timing
  const result = useBadgeCalculations(instances, items, itemVariables);

  return {
    ...result,
    isCircuitOpen: false // Simplified - would be true if too many errors occurred recently
  };
}
