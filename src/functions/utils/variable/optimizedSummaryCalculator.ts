/**
 * Optimized variable summary calculator with memoization and incremental updates
 * Part of Step 11: Performance Optimization
 */

import { VariableSummary } from '../variable/types';
import { Item } from '../item/Item';
import { VariableSummaryCalculator } from '../variable/variableSummaryCalculator';
import { RelationshipTracker } from '../variable/relationshipTracker';
import { measurePerformance, performanceMonitor } from '../performance/variablePerformanceMonitor';

interface CalculationCache {
  result: VariableSummary;
  dependencies: Set<string>;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  hash: string;
}

interface OptimizationConfig {
  enableMemoization: boolean;
  enableIncrementalUpdates: boolean;
  maxCacheSize: number;
  cacheTTL: number; // milliseconds
  batchSize: number;
  useWebWorkers: boolean;
}

interface VariableMapEntry {
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

export class OptimizedSummaryCalculator {
  private readonly baseCalculator: VariableSummaryCalculator;
  private readonly cache: Map<string, CalculationCache>;
  private readonly config: OptimizationConfig;
  private readonly dependencyGraph: Map<string, Set<string>>;
  private readonly worker: Worker | null = null;

  constructor(
    relationshipTracker: RelationshipTracker,
    config: Partial<OptimizationConfig> = {}
  ) {
    this.baseCalculator = new VariableSummaryCalculator(relationshipTracker);
    this.cache = new Map();
    this.dependencyGraph = new Map();
    this.config = {
      enableMemoization: true,
      enableIncrementalUpdates: true,
      maxCacheSize: 1000,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      batchSize: 50,
      useWebWorkers: false, // Disabled by default due to complexity
      ...config
    };

    // Start performance monitoring
    performanceMonitor.startMonitoring();
  }

  /**
   * Calculate variable summary with optimizations
   */
  public calculateSummary(
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): VariableSummary {
    return measurePerformance('variable-summary-calculation', () => {
      const cacheKey = this.generateCacheKey(item, variableMap);

      // Check cache first if memoization is enabled
      if (this.config.enableMemoization) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Calculate using base calculator
      const result = this.baseCalculator.calculateSummary(item, allItems, variableMap);

      // Cache the result if memoization is enabled
      if (this.config.enableMemoization) {
        this.cacheResult(cacheKey, result, item.id, variableMap);
      }

      return result;
    }, false);
  }

  /**
   * Batch calculate summaries for multiple items efficiently
   */
  public batchCalculateSummaries(
    items: Item[],
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Map<string, VariableSummary> {
    return measurePerformance('batch-variable-summary-calculation', () => {
      const results = new Map<string, VariableSummary>();
      const batches = this.createBatches(items, this.config.batchSize);

      for (const batch of batches) {
        for (const item of batch) {
          const summary = this.calculateSummary(item, allItems, variableMap);
          results.set(item.id, summary);
        }
      }

      return results;
    }, false);
  }

  /**
   * Invalidate cache entries affected by item changes
   */
  public invalidateCache(itemId: string): void {
    const affectedKeys = new Set<string>();

    // Find all cache entries that depend on this item
    for (const [key, entry] of this.cache) {
      if (entry.dependencies.has(itemId)) {
        affectedKeys.add(key);
      }
    }

    // Remove affected entries
    for (const key of affectedKeys) {
      this.cache.delete(key);
    }

    // Also invalidate base calculator cache
    this.baseCalculator.invalidateCache(itemId);
  }

  /**
   * Incrementally update summaries when variables change
   */
  public incrementalUpdate(
    changedItemId: string,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Map<string, VariableSummary> {
    if (!this.config.enableIncrementalUpdates) {
      // Fall back to full recalculation
      return this.batchCalculateSummaries(allItems, allItems, variableMap);
    }

    return measurePerformance('incremental-variable-update', () => {
      const results = new Map<string, VariableSummary>();

      // Find all items affected by the change
      const affectedItems = this.findAffectedItems(changedItemId, allItems);

      // Invalidate cache for affected items
      for (const item of affectedItems) {
        this.invalidateCache(item.id);
      }

      // Recalculate only affected items
      for (const item of affectedItems) {
        const summary = this.calculateSummary(item, allItems, variableMap);
        results.set(item.id, summary);
      }

      return results;
    }, false);
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    avgAccessCount: number;
    oldestEntry: number;
  } {
    let totalAccessCount = 0;
    let memoryUsage = 0;
    let oldestTimestamp = Date.now();

    for (const entry of this.cache.values()) {
      totalAccessCount += entry.accessCount;
      memoryUsage += this.estimateEntrySize(entry);
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
    }

    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      memoryUsage,
      avgAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      oldestEntry: Date.now() - oldestTimestamp
    };
  }

  /**
   * Clear cache and reset performance metrics
   */
  public clearCache(): void {
    this.cache.clear();
    this.baseCalculator.clearCache();
  }

  /**
   * Warm up cache with commonly accessed items
   */
  public warmCache(
    commonItems: Item[],
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): void {
    measurePerformance('cache-warmup', () => {
      for (const item of commonItems) {
        this.calculateSummary(item, allItems, variableMap);
      }
    }, false);
  }

  private generateCacheKey(item: Item, variableMap: Map<string, VariableMapEntry[]>): string {
    // Create a hash of the item and its variables for cache key
    const variableHash = this.hashVariableMap(variableMap, item.id);
    const itemWithTimestamp = item as Item & { lastModified?: number };
    const itemTimestamp = itemWithTimestamp.lastModified || Date.now();
    return `${item.id}-${itemTimestamp}-${variableHash}`;
  }

  private hashVariableMap(variableMap: Map<string, VariableMapEntry[]>, itemId: string): string {
    const variables = variableMap.get(itemId) || [];
    const sortedVars = variables
      .map(v => `${v.name}:${v.quantity}:${v.unit || ''}`)
      .sort((a, b) => a.localeCompare(b))
      .join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < sortedVars.length; i++) {
      const char = sortedVars.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }

  private getCachedResult(key: string): VariableSummary | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.result;
  }

  private cacheResult(
    key: string,
    result: VariableSummary,
    itemId: string,
    variableMap: Map<string, VariableMapEntry[]>
  ): void {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestEntries();
    }

    // Build dependency set
    const dependencies = new Set<string>([itemId]);
    this.addDependencies(itemId, dependencies);

    const entry: CalculationCache = {
      result,
      dependencies,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      hash: this.hashVariableMap(variableMap, itemId)
    };

    this.cache.set(key, entry);
  }

  private addDependencies(itemId: string, dependencies: Set<string>): void {
    // Add items that this calculation depends on
    // This would include parent and child relationships
    const deps = this.dependencyGraph.get(itemId);
    if (deps) {
      deps.forEach(dep => dependencies.add(dep));
    }
  }

  private findAffectedItems(changedItemId: string, allItems: Item[]): Item[] {
    const affected = new Set<string>([changedItemId]);

    // Add items that depend on the changed item
    for (const [itemId, deps] of this.dependencyGraph) {
      if (deps.has(changedItemId)) {
        affected.add(itemId);
      }
    }

    return allItems.filter(item => affected.has(item.id));
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private evictOldestEntries(): void {
    // Remove oldest 25% of entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private estimateEntrySize(entry: CalculationCache): number {
    // Rough estimation of memory usage in bytes
    let size = 0;

    // Summary object
    size += JSON.stringify(entry.result).length * 2; // UTF-16 chars

    // Dependencies set
    size += entry.dependencies.size * 50; // Rough estimate for string IDs

    // Other properties
    size += 100; // For timestamps, counts, etc.

    return size;
  }

  private calculateHitRate(): number {
    // This would need to be tracked separately in real implementation
    // For now, return the base calculator's hit rate
    const baseStats = this.baseCalculator.getCacheStats();
    return baseStats.hitRate;
  }
}

// Export a singleton instance factory
let globalOptimizedCalculator: OptimizedSummaryCalculator | null = null;

export function getOptimizedSummaryCalculator(
  relationshipTracker?: RelationshipTracker,
  config?: Partial<OptimizationConfig>
): OptimizedSummaryCalculator {
  if (!globalOptimizedCalculator && relationshipTracker) {
    globalOptimizedCalculator = new OptimizedSummaryCalculator(relationshipTracker, config);
  }
  return globalOptimizedCalculator!;
}
