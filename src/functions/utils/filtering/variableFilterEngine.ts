import { Item } from '../item/Item';
import { VariableSummary } from '../variable/types';
import {
  VariableFilterCriteria,
  FilterCriteria,
  FilterResult,
  FilterPerformanceMetrics
} from './filterTypes';

/**
 * Cache for filter results to improve performance
 */
class FilterCache {
  private readonly cache = new Map<string, { result: boolean; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private createKey(itemId: string, criteria: VariableFilterCriteria): string {
    const { variableName, operator, value, maxValue, unit } = criteria;
    return `${itemId}:${variableName}:${operator}:${value}:${maxValue || ''}:${unit || ''}`;
  }

  get(itemId: string, criteria: VariableFilterCriteria): boolean | null {
    const key = this.createKey(itemId, criteria);
    const cached = this.cache.get(key);

    if (cached && (Date.now() - cached.timestamp) < this.TTL) {
      return cached.result;
    }

    return null;
  }

  set(itemId: string, criteria: VariableFilterCriteria, result: boolean): void {
    const key = this.createKey(itemId, criteria);
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateItem(itemId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${itemId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  size(): number {
    return this.cache.size;
  }
}

// Global filter cache instance
const filterCache = new FilterCache();

/**
 * Execute a single variable filter against an item's variable summary
 */
export function executeVariableFilter(
  criteria: VariableFilterCriteria,
  variableSummary: VariableSummary,
  itemId: string
): boolean {
  // Check cache first
  const cached = filterCache.get(itemId, criteria);
  if (cached !== null) {
    return cached;
  }

  const { variableName, operator, value, maxValue } = criteria;

  // Find the variable in the summary (case-insensitive)
  const variableKey = Object.keys(variableSummary).find(
    key => key.toLowerCase() === variableName.toLowerCase()
  );

  if (!variableKey) {
    // Variable not found in summary - doesn't match filter
    filterCache.set(itemId, criteria, false);
    return false;
  }

  const variableData = variableSummary[variableKey];
  if (!variableData || typeof variableData.quantity !== 'number') {
    filterCache.set(itemId, criteria, false);
    return false;
  }

  const actualValue = variableData.quantity;

  let result = false;

  switch (operator) {
    case 'eq':
      result = Math.abs(actualValue - value) < 0.001; // Handle floating point precision
      break;
    case 'gt':
      result = actualValue > value;
      break;
    case 'gte':
      result = actualValue >= value;
      break;
    case 'lt':
      result = actualValue < value;
      break;
    case 'lte':
      result = actualValue <= value;
      break;
    case 'ne':
      result = Math.abs(actualValue - value) >= 0.001;
      break;
    case 'range':
      if (maxValue !== undefined) {
        result = actualValue >= value && actualValue <= maxValue;
      }
      break;
    default:
      // No need to assign false since result is already false
      break;
  }

  // Cache the result
  filterCache.set(itemId, criteria, result);
  return result;
}

/**
 * Execute multiple variable filters against an item
 */
export function executeVariableFilters(
  items: Item[],
  itemVariableSummaries: Map<string, VariableSummary>,
  filterCriteria: FilterCriteria
): { results: FilterResult[]; performance: FilterPerformanceMetrics } {
  const startTime = performance.now();
  let cacheHits = 0;
  let cacheMisses = 0;

  const results: FilterResult[] = [];
  const { nameFilter, variableFilters, combineMode } = filterCriteria;

  for (const item of items) {
    // First apply name filter if present
    if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      continue;
    }

    const variableSummary = itemVariableSummaries.get(item.id) || {};
    const matchedFilters: string[] = [];
    const variableValues: Record<string, number> = {};

    // Apply variable filters
    let variableFiltersPassed = variableFilters.length === 0; // If no variable filters, pass by default

    if (variableFilters.length > 0) {
      const filterResults = variableFilters.map(criteria => {
        // Track cache hits/misses
        const cached = filterCache.get(item.id, criteria);
        if (cached !== null) {
          cacheHits++;
        } else {
          cacheMisses++;
        }

        const passed = executeVariableFilter(criteria, variableSummary, item.id);
        if (passed) {
          matchedFilters.push(`${criteria.variableName} ${criteria.operator} ${criteria.value}`);
        }
        return passed;
      });

      // Combine results based on mode
      if (combineMode === 'AND') {
        variableFiltersPassed = filterResults.every(result => result);
      } else { // OR
        variableFiltersPassed = filterResults.some(result => result);
      }
    }

    // If all filters passed, include in results
    if (variableFiltersPassed) {
      // Extract variable values for display
      Object.entries(variableSummary).forEach(([name, data]) => {
        if (data && typeof data === 'object' && 'quantity' in data && typeof data.quantity === 'number') {
          variableValues[name] = data.quantity;
        }
      });

      results.push({
        itemId: item.id,
        matchedFilters,
        variableValues
      });
    }
  }

  const endTime = performance.now();
  const performance_metrics: FilterPerformanceMetrics = {
    executionTime: endTime - startTime,
    itemsEvaluated: items.length,
    itemsFiltered: results.length,
    cacheHits,
    cacheMisses
  };

  return { results, performance: performance_metrics };
}

/**
 * Clear the filter cache
 */
export function clearFilterCache(): void {
  filterCache.clear();
}

/**
 * Invalidate cache entries for a specific item
 */
export function invalidateFilterCacheForItem(itemId: string): void {
  filterCache.invalidateItem(itemId);
}

/**
 * Get filter cache statistics
 */
export function getFilterCacheStats(): { size: number; hitRatio?: number } {
  return {
    size: filterCache.size()
  };
}

/**
 * Fuzzy match variable names for better user experience
 */
export function findBestVariableMatch(
  targetVariable: string,
  availableVariables: string[]
): string | null {
  const target = targetVariable.toLowerCase();

  // Exact match first
  const exactMatch = availableVariables.find(
    variable => variable.toLowerCase() === target
  );
  if (exactMatch) return exactMatch;

  // Partial match
  const partialMatch = availableVariables.find(
    variable => variable.toLowerCase().includes(target) || target.includes(variable.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Fuzzy match using simple distance algorithm
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const variable of availableVariables) {
    const score = calculateSimilarity(target, variable.toLowerCase());
    if (score > bestScore && score > 0.6) { // 60% similarity threshold
      bestScore = score;
      bestMatch = variable;
    }
  }

  return bestMatch;
}

/**
 * Calculate similarity between two strings using a simple algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = calculateLevenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Optimize filter criteria for better performance
 */
export function optimizeFilterCriteria(criteria: FilterCriteria): FilterCriteria {
  // Sort variable filters by selectivity (more restrictive filters first)
  const sortedVariableFilters = [...criteria.variableFilters].sort((a, b) => {
    // Exact matches and "not equal" are usually more selective
    if (a.operator === 'eq' && b.operator !== 'eq') return -1;
    if (b.operator === 'eq' && a.operator !== 'eq') return 1;
    if (a.operator === 'ne' && b.operator !== 'ne') return -1;
    if (b.operator === 'ne' && a.operator !== 'ne') return 1;

    // Range filters are typically more selective than single comparisons
    if (a.operator === 'range' && b.operator !== 'range') return -1;
    if (b.operator === 'range' && a.operator !== 'range') return 1;

    return 0;
  });

  return {
    ...criteria,
    variableFilters: sortedVariableFilters
  };
}
