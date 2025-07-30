/**
 * Optimized variable filter engine with indexing and caching
 * Part of Step 11: Performance Optimization
 */

import { Item } from '../item/Item';
import { VariableSummary } from '../variable/types';
import {
  VariableFilterCriteria,
  FilterCriteria,
  FilterResult,
  FilterPerformanceMetrics
} from './filterTypes';
import { measurePerformance } from '../performance/variablePerformanceMonitor';

interface FilterIndex {
  variableName: string;
  sortedItems: { itemId: string; value: number }[];
  lastUpdated: number;
}

interface FilterCache {
  key: string;
  results: FilterResult[];
  timestamp: number;
  hitCount: number;
}

interface OptimizedFilterConfig {
  enableIndexing: boolean;
  enableCaching: boolean;
  maxCacheSize: number;
  cacheTTL: number;
  indexUpdateThreshold: number;
}

export class OptimizedVariableFilter {
  private readonly config: OptimizedFilterConfig;
  private readonly filterIndices: Map<string, FilterIndex>;
  private readonly filterCache: Map<string, FilterCache>;
  private totalFilterRequests: number = 0;
  private cacheHits: number = 0;

  constructor(config: Partial<OptimizedFilterConfig> = {}) {
    this.config = {
      enableIndexing: true,
      enableCaching: true,
      maxCacheSize: 500,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
      indexUpdateThreshold: 100, // Update index after 100 changes
      ...config
    };

    this.filterIndices = new Map();
    this.filterCache = new Map();
  }

  /**
   * Execute optimized variable filters with caching and indexing
   */
  public executeFilters(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>,
    filterCriteria: FilterCriteria
  ): { results: FilterResult[]; performance: FilterPerformanceMetrics } {
    return measurePerformance('variable-filter', () => {
      this.totalFilterRequests++;

      // Generate cache key
      const cacheKey = this.generateCacheKey(filterCriteria, items.map(i => i.id));

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedResults(cacheKey);
        if (cached) {
          this.cacheHits++;
          return {
            results: cached,
            performance: this.generatePerformanceMetrics(0, items.length, cached.length, true)
          };
        }
      }

      const startTime = performance.now();
      let results: FilterResult[];

      // Use indexed filtering if possible and enabled
      if (this.config.enableIndexing && this.canUseIndexedFiltering(filterCriteria)) {
        results = this.executeIndexedFilters(items, itemVariableSummaries, filterCriteria);
      } else {
        results = this.executeBruteForceFilters(items, itemVariableSummaries, filterCriteria);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Cache the results
      if (this.config.enableCaching) {
        this.cacheResults(cacheKey, results);
      }

      return {
        results,
        performance: this.generatePerformanceMetrics(executionTime, items.length, results.length, false)
      };
    }, false);
  }

  /**
   * Build or update filter indices for common variables
   */
  public buildIndices(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>
  ): void {
    if (!this.config.enableIndexing) return;

    measurePerformance('build-filter-indices', () => {
      // Find all unique variable names
      const variableNames = new Set<string>();
      for (const summary of itemVariableSummaries.values()) {
        Object.keys(summary).forEach(name => variableNames.add(name));
      }

      // Build index for each variable
      for (const variableName of variableNames) {
        this.buildVariableIndex(variableName, items, itemVariableSummaries);
      }
    }, false);
  }

  /**
   * Invalidate cache and indices when data changes
   */
  public invalidate(changedItemIds?: string[]): void {
    if (changedItemIds) {
      // Selective invalidation
      this.invalidateSelectiveCache(changedItemIds);
      this.invalidateSelectiveIndices(changedItemIds);
    } else {
      // Full invalidation
      this.filterCache.clear();
      this.filterIndices.clear();
    }
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    cacheHitRate: number;
    indexCount: number;
    cacheSize: number;
    avgFilterTime: number;
    totalRequests: number;
  } {
    return {
      cacheHitRate: this.totalFilterRequests > 0 ? this.cacheHits / this.totalFilterRequests : 0,
      indexCount: this.filterIndices.size,
      cacheSize: this.filterCache.size,
      avgFilterTime: 0, // Would need to track this separately
      totalRequests: this.totalFilterRequests
    };
  }

  /**
   * Clear all caches and indices
   */
  public clear(): void {
    this.filterCache.clear();
    this.filterIndices.clear();
    this.totalFilterRequests = 0;
    this.cacheHits = 0;
  }

  private executeIndexedFilters(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>,
    filterCriteria: FilterCriteria
  ): FilterResult[] {
    const results: FilterResult[] = [];
    const { nameFilter, variableFilters, combineMode } = filterCriteria;

    // Start with name filtering
    let candidateItems = items;
    if (nameFilter) {
      candidateItems = items.filter(item =>
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply variable filters using indices
    for (const variableFilter of variableFilters) {
      const matchedItems = this.executeIndexedVariableFilter(
        candidateItems,
        itemVariableSummaries,
        variableFilter
      );

      if (combineMode === 'AND') {
        candidateItems = candidateItems.filter(item =>
          matchedItems.some(matched => matched.itemId === item.id)
        );
      } else {
        // OR mode - add to results
        for (const matched of matchedItems) {
          if (!results.some(r => r.itemId === matched.itemId)) {
            results.push(matched);
          }
        }
      }
    }

    // For AND mode, convert final candidates to results
    if (combineMode === 'AND') {
      for (const item of candidateItems) {
        const variableSummary = itemVariableSummaries.get(item.id) || {};
        const variableValues: Record<string, number> = {};
        const matchedFilters: string[] = [];

        // Extract variable values and matched filters
        Object.entries(variableSummary).forEach(([name, data]) => {
          if (data && typeof data === 'object' && 'quantity' in data && typeof data.quantity === 'number') {
            variableValues[name] = data.quantity;
          }
        });

        for (const filter of variableFilters) {
          matchedFilters.push(`${filter.variableName} ${filter.operator} ${filter.value}`);
        }

        results.push({
          itemId: item.id,
          matchedFilters,
          variableValues
        });
      }
    }

    return results;
  }

  private executeIndexedVariableFilter(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>,
    criteria: VariableFilterCriteria
  ): FilterResult[] {
    const index = this.filterIndices.get(criteria.variableName.toLowerCase());
    if (!index) {
      // Fall back to brute force for this filter
      return this.executeBruteForceVariableFilter(items, itemVariableSummaries, criteria);
    }

    const results: FilterResult[] = [];
    const { operator, value, maxValue } = criteria;

    // Use binary search for range queries
    let matchedItems: { itemId: string; value: number }[] = [];

    switch (operator) {
      case 'eq':
        matchedItems = index.sortedItems.filter(item =>
          Math.abs(item.value - value) < 0.001
        );
        break;
      case 'gt':
        matchedItems = this.binarySearchGreaterThan(index.sortedItems, value);
        break;
      case 'gte':
        matchedItems = this.binarySearchGreaterThanOrEqual(index.sortedItems, value);
        break;
      case 'lt':
        matchedItems = this.binarySearchLessThan(index.sortedItems, value);
        break;
      case 'lte':
        matchedItems = this.binarySearchLessThanOrEqual(index.sortedItems, value);
        break;
      case 'ne':
        matchedItems = index.sortedItems.filter(item =>
          Math.abs(item.value - value) >= 0.001
        );
        break;
      case 'range':
        if (maxValue !== undefined) {
          matchedItems = index.sortedItems.filter(item =>
            item.value >= value && item.value <= maxValue
          );
        }
        break;
    }

    // Convert to FilterResult format
    for (const item of matchedItems) {
      if (items.some(i => i.id === item.itemId)) {
        results.push({
          itemId: item.itemId,
          matchedFilters: [`${criteria.variableName} ${criteria.operator} ${criteria.value}`],
          variableValues: { [criteria.variableName]: item.value }
        });
      }
    }

    return results;
  }

  private executeBruteForceFilters(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>,
    filterCriteria: FilterCriteria
  ): FilterResult[] {
    const results: FilterResult[] = [];
    const { nameFilter, variableFilters, combineMode } = filterCriteria;

    for (const item of items) {
      // Apply name filter
      if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        continue;
      }

      const variableSummary = itemVariableSummaries.get(item.id) || {};
      const matchedFilters: string[] = [];
      const variableValues: Record<string, number> = {};

      // Apply variable filters
      const filterResults = variableFilters.map(criteria => {
        const passed = this.executeVariableFilter(criteria, variableSummary);
        if (passed) {
          matchedFilters.push(`${criteria.variableName} ${criteria.operator} ${criteria.value}`);
        }
        return passed;
      });

      let variableFiltersPassed = variableFilters.length === 0;
      if (variableFilters.length > 0) {
        if (combineMode === 'AND') {
          variableFiltersPassed = filterResults.every(result => result);
        } else {
          variableFiltersPassed = filterResults.some(result => result);
        }
      }

      if (variableFiltersPassed) {
        // Extract variable values
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

    return results;
  }

  private executeBruteForceVariableFilter(
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>,
    criteria: VariableFilterCriteria
  ): FilterResult[] {
    const results: FilterResult[] = [];

    for (const item of items) {
      const variableSummary = itemVariableSummaries.get(item.id) || {};
      if (this.executeVariableFilter(criteria, variableSummary)) {
        results.push({
          itemId: item.id,
          matchedFilters: [`${criteria.variableName} ${criteria.operator} ${criteria.value}`],
          variableValues: this.extractVariableValues(variableSummary)
        });
      }
    }

    return results;
  }

  private executeVariableFilter(
    criteria: VariableFilterCriteria,
    variableSummary: VariableSummary
  ): boolean {
    const { variableName, operator, value, maxValue } = criteria;

    const variableKey = Object.keys(variableSummary).find(
      key => key.toLowerCase() === variableName.toLowerCase()
    );

    if (!variableKey) {
      return false;
    }

    const variableData = variableSummary[variableKey];
    if (!variableData || typeof variableData.quantity !== 'number') {
      return false;
    }

    const actualValue = variableData.quantity;

    switch (operator) {
      case 'eq':
        return Math.abs(actualValue - value) < 0.001;
      case 'gt':
        return actualValue > value;
      case 'gte':
        return actualValue >= value;
      case 'lt':
        return actualValue < value;
      case 'lte':
        return actualValue <= value;
      case 'ne':
        return Math.abs(actualValue - value) >= 0.001;
      case 'range':
        return maxValue !== undefined && actualValue >= value && actualValue <= maxValue;
      default:
        return false;
    }
  }

  private buildVariableIndex(
    variableName: string,
    items: Item[],
    itemVariableSummaries: Map<string, VariableSummary>
  ): void {
    const sortedItems: { itemId: string; value: number }[] = [];

    for (const item of items) {
      const summary = itemVariableSummaries.get(item.id);
      if (summary) {
        const variableKey = Object.keys(summary).find(
          key => key.toLowerCase() === variableName.toLowerCase()
        );
        if (variableKey && summary[variableKey] && typeof summary[variableKey].quantity === 'number') {
          sortedItems.push({
            itemId: item.id,
            value: summary[variableKey].quantity
          });
        }
      }
    }

    // Sort by value for binary search
    sortedItems.sort((a, b) => a.value - b.value);

    this.filterIndices.set(variableName.toLowerCase(), {
      variableName,
      sortedItems,
      lastUpdated: Date.now()
    });
  }

  private canUseIndexedFiltering(filterCriteria: FilterCriteria): boolean {
    // Can use indexing if all variable filters target indexed variables
    return filterCriteria.variableFilters.every(filter =>
      this.filterIndices.has(filter.variableName.toLowerCase())
    );
  }

  private generateCacheKey(filterCriteria: FilterCriteria, itemIds: string[]): string {
    const criteriaStr = JSON.stringify(filterCriteria);
    const itemsHash = this.hashArray(itemIds);
    return `${criteriaStr}-${itemsHash}`;
  }

  private hashArray(items: string[]): string {
    const sorted = items.slice().sort((a, b) => a.localeCompare(b));
    return sorted.join('|');
  }

  private getCachedResults(key: string): FilterResult[] | null {
    const cached = this.filterCache.get(key);
    if (!cached) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.config.cacheTTL) {
      this.filterCache.delete(key);
      return null;
    }

    cached.hitCount++;
    return cached.results;
  }

  private cacheResults(key: string, results: FilterResult[]): void {
    // Clean up old entries if cache is full
    if (this.filterCache.size >= this.config.maxCacheSize) {
      this.evictOldestCacheEntries();
    }

    this.filterCache.set(key, {
      key,
      results,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.filterCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.filterCache.delete(entries[i][0]);
    }
  }

  private invalidateSelectiveCache(changedItemIds: string[]): void {
    const keysToRemove: string[] = [];
    for (const [key, cached] of this.filterCache) {
      // Check if any changed item affects this cached result
      const affectedByChange = cached.results.some(result =>
        changedItemIds.includes(result.itemId)
      );
      if (affectedByChange) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.filterCache.delete(key));
  }

  private invalidateSelectiveIndices(changedItemIds: string[]): void {
    // Mark indices as needing update (they'll be rebuilt on next use)
    for (const index of this.filterIndices.values()) {
      const needsUpdate = index.sortedItems.some(item =>
        changedItemIds.includes(item.itemId)
      );
      if (needsUpdate) {
        index.lastUpdated = 0; // Mark as stale
      }
    }
  }

  private generatePerformanceMetrics(
    executionTime: number,
    itemsEvaluated: number,
    itemsFiltered: number,
    wasCacheHit: boolean
  ): FilterPerformanceMetrics {
    return {
      executionTime,
      itemsEvaluated,
      itemsFiltered,
      cacheHits: wasCacheHit ? 1 : 0,
      cacheMisses: wasCacheHit ? 0 : 1
    };
  }

  private extractVariableValues(variableSummary: VariableSummary): Record<string, number> {
    const values: Record<string, number> = {};
    Object.entries(variableSummary).forEach(([name, data]) => {
      if (data && typeof data === 'object' && 'quantity' in data && typeof data.quantity === 'number') {
        values[name] = data.quantity;
      }
    });
    return values;
  }

  // Binary search helper methods
  private binarySearchGreaterThan(sortedItems: { value: number }[], target: number): { itemId: string; value: number }[] {
    const result: { itemId: string; value: number }[] = [];
    let left = 0;
    let right = sortedItems.length - 1;

    // Find first element greater than target
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedItems[mid].value > target) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // Add all elements from left to end
    for (let i = left; i < sortedItems.length; i++) {
      result.push(sortedItems[i] as { itemId: string; value: number });
    }

    return result;
  }

  private binarySearchGreaterThanOrEqual(sortedItems: { value: number }[], target: number): { itemId: string; value: number }[] {
    const result: { itemId: string; value: number }[] = [];
    let left = 0;
    let right = sortedItems.length - 1;

    // Find first element greater than or equal to target
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedItems[mid].value >= target) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // Add all elements from left to end
    for (let i = left; i < sortedItems.length; i++) {
      result.push(sortedItems[i] as { itemId: string; value: number });
    }

    return result;
  }

  private binarySearchLessThan(sortedItems: { value: number }[], target: number): { itemId: string; value: number }[] {
    const result: { itemId: string; value: number }[] = [];
    let left = 0;
    let right = sortedItems.length - 1;

    // Find last element less than target
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedItems[mid].value < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Add all elements from start to right
    for (let i = 0; i <= right; i++) {
      result.push(sortedItems[i] as { itemId: string; value: number });
    }

    return result;
  }

  private binarySearchLessThanOrEqual(sortedItems: { value: number }[], target: number): { itemId: string; value: number }[] {
    const result: { itemId: string; value: number }[] = [];
    let left = 0;
    let right = sortedItems.length - 1;

    // Find last element less than or equal to target
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedItems[mid].value <= target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Add all elements from start to right
    for (let i = 0; i <= right; i++) {
      result.push(sortedItems[i] as { itemId: string; value: number });
    }

    return result;
  }
}

// Export singleton instance
let globalOptimizedFilter: OptimizedVariableFilter | null = null;

export function getOptimizedVariableFilter(config?: Partial<OptimizedFilterConfig>): OptimizedVariableFilter {
  globalOptimizedFilter ??= new OptimizedVariableFilter(config);
  return globalOptimizedFilter;
}
