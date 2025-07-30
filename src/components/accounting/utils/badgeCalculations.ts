import { ItemInstance } from '../../../functions/utils/itemInstance/types';
import { Item } from '../../../functions/utils/item/Item';
import { Variable } from '../../../functions/utils/variable/types';

/**
 * Performance monitoring utility for tracking calculation times
 */
export class BadgeCalculationPerformanceMonitor {
  private static readonly measurements: Map<string, number[]> = new Map();

  static startMeasurement(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.measurements.get(operation) || [];
      existing.push(duration);

      // Keep only last 100 measurements to prevent memory bloat
      if (existing.length > 100) {
        existing.shift();
      }

      this.measurements.set(operation, existing);

      // Warn if calculation is taking too long
      if (duration > 50) {
        console.warn(`Badge calculation '${operation}' took ${duration.toFixed(2)}ms (threshold: 50ms)`);
      }
    };
  }

  static getAverageTime(operation: string): number {
    const measurements = this.measurements.get(operation) || [];
    if (measurements.length === 0) return 0;
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  static getReport(): Record<string, { average: number; count: number; max: number }> {
    const report: Record<string, { average: number; count: number; max: number }> = {};

    for (const [operation, measurements] of this.measurements.entries()) {
      if (measurements.length > 0) {
        report[operation] = {
          average: measurements.reduce((sum, time) => sum + time, 0) / measurements.length,
          count: measurements.length,
          max: Math.max(...measurements)
        };
      }
    }

    return report;
  }
}

/**
 * Validation utility for ensuring calculation data integrity
 */
export function validateCalculationData(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(instances)) {
    errors.push('Instances must be an array');
  }

  if (!Array.isArray(items)) {
    errors.push('Items must be an array');
  }

  if (!(itemVariables instanceof Map)) {
    errors.push('ItemVariables must be a Map');
  }

  // Only proceed with further validation if basic types are correct
  if (errors.length === 0) {
    // Check for orphaned instances (instances without corresponding items)
    const itemIds = new Set(items.map(item => item.id));
    const orphanedInstances = instances.filter(instance => !itemIds.has(instance.itemId));

    if (orphanedInstances.length > 0) {
      errors.push(`Found ${orphanedInstances.length} instances with missing items`);
    }

    // Check for malformed instances
    const malformedInstances = instances.filter(instance =>
      !instance.id ||
      !instance.itemId ||
      typeof instance.scheduledStartTime !== 'number' ||
      typeof instance.isComplete !== 'boolean'
    );

    if (malformedInstances.length > 0) {
      errors.push(`Found ${malformedInstances.length} malformed instances`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate total time from BasicItem instances in accounting view
 * Only counts completed but unaccounted BasicItem instances
 */
export function calculateTotalBasicTime(
  instances: ItemInstance[],
  items: Item[]
): { totalTime: number; breakdown: TimeBreakdown; errors: string[] } {
  const endMeasurement = BadgeCalculationPerformanceMonitor.startMeasurement('calculateTotalBasicTime');

  try {
    const validation = validateCalculationData(instances, items, new Map());
    if (!validation.isValid) {
      return {
        totalTime: 0,
        breakdown: { basicItems: [], totalCount: 0, averageDuration: 0 },
        errors: validation.errors
      };
    }

    const itemMap = new Map(items.map(item => [item.id, item]));
    const basicTimeBreakdown: BasicItemTimeInfo[] = [];
    let totalTime = 0;

    for (const instance of instances) {
      // Only count completed instances for accounting purposes
      if (!instance.isComplete) continue;

      const item = itemMap.get(instance.itemId);
      if (!item) continue;

      // Only count BasicItems, not SubCalendar or CheckList parents
      if (item.constructor.name !== 'BasicItem') continue;

      // Handle edge cases for duration
      const duration = item.duration || 0;
      if (duration <= 0 || !isFinite(duration)) continue;

      totalTime += duration;
      basicTimeBreakdown.push({
        instanceId: instance.id,
        itemId: item.id,
        itemName: item.name,
        duration: duration,
        scheduledTime: instance.scheduledStartTime,
        completedAt: instance.completedAt
      });
    }

    const breakdown: TimeBreakdown = {
      basicItems: basicTimeBreakdown,
      totalCount: basicTimeBreakdown.length,
      averageDuration: basicTimeBreakdown.length > 0 ? totalTime / basicTimeBreakdown.length : 0
    };

    return { totalTime, breakdown, errors: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error in time calculation';
    console.error('Error calculating basic time:', error);
    return {
      totalTime: 0,
      breakdown: { basicItems: [], totalCount: 0, averageDuration: 0 },
      errors: [errorMessage]
    };
  } finally {
    endMeasurement();
  }
}

/**
 * Calculate distinct variables across all items in accounting view
 * Handles complex hierarchies and deduplicates variables
 */
export function calculateDistinctVariables(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): { distinctCount: number; variableDetails: VariableDetails; errors: string[] } {
  const endMeasurement = BadgeCalculationPerformanceMonitor.startMeasurement('calculateDistinctVariables');

  try {
    const validation = validateCalculationData(instances, items, itemVariables);
    if (!validation.isValid) {
      return {
        distinctCount: 0,
        variableDetails: { byName: new Map(), byCategory: new Map(), totalQuantity: 0 },
        errors: validation.errors
      };
    }

    const itemMap = new Map(items.map(item => [item.id, item]));
    const variablesByName = new Map<string, AggregatedVariable>();
    const variablesByCategory = new Map<string, AggregatedVariable[]>();
    let totalQuantity = 0;

    // Collect variables from all completed instances
    for (const instance of instances) {
      // Only include completed instances
      if (!instance.isComplete) continue;

      const item = itemMap.get(instance.itemId);
      if (!item) continue;

      // Get direct variables for this item
      const variables = itemVariables.get(item.id) || [];

      for (const variable of variables) {
        const existing = variablesByName.get(variable.name);

        if (existing) {
          // Aggregate quantities for existing variables
          existing.totalQuantity += variable.quantity;
          existing.itemCount++;
          existing.instanceIds.add(instance.id);
        } else {
          // Create new aggregated variable entry
          const aggregated: AggregatedVariable = {
            name: variable.name,
            totalQuantity: variable.quantity,
            unit: variable.unit,
            category: variable.category || 'Uncategorized',
            itemCount: 1,
            instanceIds: new Set([instance.id])
          };

          variablesByName.set(variable.name, aggregated);
        }

        totalQuantity += variable.quantity;
      }
    }

    // Group by category for detailed breakdown
    for (const variable of variablesByName.values()) {
      const category = variable.category;
      const categoryVariables = variablesByCategory.get(category) || [];
      categoryVariables.push(variable);
      variablesByCategory.set(category, categoryVariables);
    }

    const variableDetails: VariableDetails = {
      byName: variablesByName,
      byCategory: variablesByCategory,
      totalQuantity
    };

    return {
      distinctCount: variablesByName.size,
      variableDetails,
      errors: []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error in variable calculation';
    console.error('Error calculating distinct variables:', error);
    return {
      distinctCount: 0,
      variableDetails: { byName: new Map(), byCategory: new Map(), totalQuantity: 0 },
      errors: [errorMessage]
    };
  } finally {
    endMeasurement();
  }
}

/**
 * Aggregate variables by category for detailed insights
 */
export function aggregateVariablesByCategory(
  variableDetails: VariableDetails
): CategorySummary[] {
  const endMeasurement = BadgeCalculationPerformanceMonitor.startMeasurement('aggregateVariablesByCategory');

  try {
    const summaries: CategorySummary[] = [];

    for (const [category, variables] of variableDetails.byCategory.entries()) {
      const totalQuantity = variables.reduce((sum, v) => sum + v.totalQuantity, 0);
      const uniqueVariableCount = variables.length;
      const totalItemCount = variables.reduce((sum, v) => sum + v.itemCount, 0);

      summaries.push({
        category,
        uniqueVariableCount,
        totalQuantity,
        totalItemCount,
        variables: [...variables] // Create a copy to avoid mutations
      });
    }

    // Sort by total quantity descending
    summaries.sort((a, b) => b.totalQuantity - a.totalQuantity);

    return summaries;
  } finally {
    endMeasurement();
  }
}

// Type definitions for detailed data structures

export interface TimeBreakdown {
  readonly basicItems: BasicItemTimeInfo[];
  readonly totalCount: number;
  readonly averageDuration: number;
}

export interface BasicItemTimeInfo {
  readonly instanceId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly duration: number;
  readonly scheduledTime: number;
  readonly completedAt?: number;
}

export interface VariableDetails {
  readonly byName: Map<string, AggregatedVariable>;
  readonly byCategory: Map<string, AggregatedVariable[]>;
  readonly totalQuantity: number;
}

export interface AggregatedVariable {
  name: string;
  totalQuantity: number;
  unit?: string;
  category: string;
  itemCount: number;
  instanceIds: Set<string>;
}

export interface CategorySummary {
  readonly category: string;
  readonly uniqueVariableCount: number;
  readonly totalQuantity: number;
  readonly totalItemCount: number;
  readonly variables: AggregatedVariable[];
}

/**
 * Format time duration for display in tooltips and badges
 */
export function formatDuration(milliseconds: number): string {
  if (!isFinite(milliseconds) || milliseconds < 0) return '0s';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Create a detailed tooltip text for time badges
 */
export function createTimeTooltip(timeBreakdown: TimeBreakdown): string {
  if (timeBreakdown.totalCount === 0) {
    return 'No BasicItem instances requiring accounting';
  }

  const { totalCount, averageDuration } = timeBreakdown;
  const avgFormatted = formatDuration(averageDuration);

  let tooltip = `${totalCount} BasicItem${totalCount === 1 ? '' : 's'} requiring accounting\n`;
  tooltip += `Average duration: ${avgFormatted}`;

  return tooltip;
}

/**
 * Create a detailed tooltip text for variable badges
 */
export function createVariableTooltip(variableDetails: VariableDetails): string {
  const { byName, byCategory, totalQuantity } = variableDetails;

  if (byName.size === 0) {
    return 'No variables requiring accounting';
  }

  let tooltip = `${byName.size} distinct variable${byName.size === 1 ? '' : 's'} requiring accounting\n`;
  tooltip += `Total quantity across all variables: ${totalQuantity}\n`;

  const categoryCount = byCategory.size;
  if (categoryCount > 1) {
    tooltip += `Across ${categoryCount} categories`;
  }

  return tooltip;
}
