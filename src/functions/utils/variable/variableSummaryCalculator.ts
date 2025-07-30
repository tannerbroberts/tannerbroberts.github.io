import { VariableSummary } from './types';
import { Item, hasChildren, getChildren } from '../item/index';
import { getChildId } from '../item/itemUtils';
import { RelationshipTracker } from './relationshipTracker';
import {
  RelationshipSummary,
  RelationshipCacheEntry,
  RelationshipCalculationConfig,
  RelationshipPerformanceMetrics
} from './types/RelationshipTypes';

/**
 * Mutable version of VariableSummary for internal calculations
 */
interface MutableVariableSummary {
  [variableName: string]: {
    quantity: number;
    unit?: string;
    category?: string;
  };
}

/**
 * Type for variable objects in the map
 */
interface VariableMapEntry {
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

/**
 * Advanced variable summary calculator using relationship tracking
 */
export class VariableSummaryCalculator {
  private readonly relationshipTracker: RelationshipTracker;
  private readonly cache: Map<string, RelationshipCacheEntry>;
  private readonly config: RelationshipCalculationConfig;
  private performanceMetrics: RelationshipPerformanceMetrics;

  constructor(
    relationshipTracker: RelationshipTracker,
    config: Partial<RelationshipCalculationConfig> = {}
  ) {
    this.relationshipTracker = relationshipTracker;
    this.cache = new Map();
    this.config = {
      maxCascadeDepth: 10,
      enableCaching: true,
      batchSize: 50,
      timeoutMs: 5000,
      validateCircularReferences: true,
      ...config
    };

    this.performanceMetrics = {
      calculationTime: 0,
      cacheHitRate: 0,
      relationshipsProcessed: 0,
      cascadeDepth: 0,
      memoryUsage: 0
    };
  }

  /**
   * Calculate variable summary using relationship-based tracking
   */
  public calculateSummary(
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): VariableSummary {
    const startTime = performance.now();
    const stats = { cacheHits: 0, cacheMisses: 0 };

    try {
      const result = this.calculateSummaryInternal(
        item,
        allItems,
        variableMap,
        new Set(),
        0,
        stats
      );

      // Update performance metrics
      const endTime = performance.now();
      this.updatePerformanceMetrics(endTime - startTime, stats.cacheHits, stats.cacheMisses);

      return result;
    } catch (error) {
      console.error('Error calculating relationship-based summary:', error);
      // Fallback to basic calculation if relationship-based fails
      return this.fallbackCalculation(item, allItems, variableMap);
    }
  }

  /**
   * Calculate comprehensive relationship summary including all contributions
   */
  public calculateRelationshipSummary(
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): RelationshipSummary {
    const directVariables = this.getDirectVariables(item.id, variableMap);
    const relationshipContributions = new Map<string, VariableSummary>();

    // Get all child relationships for this item
    const childRelationships = this.relationshipTracker.getChildRelationships(item.id);

    for (const relationship of childRelationships) {
      const childItem = allItems.find(i => i.id === relationship.childItemId);
      if (childItem) {
        const childSummary = this.calculateSummary(childItem, allItems, variableMap);
        const multipliedSummary = this.multiplyVariableSummary(childSummary, relationship.multiplier);
        relationshipContributions.set(relationship.relationshipId, multipliedSummary);
      }
    }

    // Combine all summaries
    const totalSummary = this.combineVariableSummaries([
      directVariables,
      ...relationshipContributions.values()
    ]);

    return {
      itemId: item.id,
      directVariables,
      relationshipContributions,
      totalSummary,
      lastUpdated: Date.now()
    };
  }

  /**
   * Invalidate cache entries affected by item changes
   */
  public invalidateCache(itemId: string): void {
    // Get all relationships that would be affected
    const affectedRelationships = this.relationshipTracker.getAffectedRelationships(itemId);

    // Remove cache entries that depend on these relationships
    for (const [cacheKey, entry] of this.cache) {
      const hasAffectedDependency = Array.from(affectedRelationships).some(relationshipId =>
        entry.dependencies.has(relationshipId)
      );

      if (hasAffectedDependency || cacheKey === itemId) {
        this.cache.delete(cacheKey);
      }
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    avgAccessCount: number;
  } {
    let totalAccessCount = 0;
    let memoryUsage = 0;

    for (const entry of this.cache.values()) {
      totalAccessCount += entry.accessCount;
      memoryUsage += this.estimateEntrySize(entry);
    }

    return {
      size: this.cache.size,
      hitRate: this.performanceMetrics.cacheHitRate,
      memoryUsage,
      avgAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0
    };
  }

  /**
   * Clear cache (useful for testing and memory management)
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): RelationshipPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Private helper methods

  private calculateSummaryInternal(
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>,
    visited: Set<string>,
    depth: number,
    stats: { cacheHits: number; cacheMisses: number }
  ): VariableSummary {
    // Prevent infinite recursion
    if (visited.has(item.id)) {
      console.warn(`Circular dependency detected for item ${item.id}`);
      return {};
    }

    if (depth >= this.config.maxCascadeDepth) {
      console.warn(`Maximum cascade depth reached for item ${item.id}`);
      return {};
    }

    // Check cache if enabled
    if (this.config.enableCaching) {
      const cached = this.getCachedSummary(item.id);
      if (cached) {
        stats.cacheHits++;
        return cached.summary.totalSummary;
      }
      stats.cacheMisses++;
    }

    visited.add(item.id);

    // Start with direct variables
    const summary = this.getDirectVariables(item.id, variableMap) as MutableVariableSummary;

    // Add variables from child relationships
    const childRelationships = this.relationshipTracker.getChildRelationships(item.id);

    for (const relationship of childRelationships) {
      const childItem = allItems.find(i => i.id === relationship.childItemId);
      if (childItem) {
        const childSummary = this.calculateSummaryInternal(
          childItem,
          allItems,
          variableMap,
          visited,
          depth + 1,
          stats
        );

        // Apply multiplier and combine with parent summary
        const multipliedSummary = this.multiplyVariableSummary(childSummary, relationship.multiplier);
        this.combineIntoSummary(summary, multipliedSummary);
      }
    }

    // Cache the result if enabled
    if (this.config.enableCaching) {
      this.setCachedSummary(item.id, summary as VariableSummary, childRelationships.map(r => r.relationshipId));
    }

    visited.delete(item.id);
    return summary as VariableSummary;
  }

  private getDirectVariables(itemId: string, variableMap: Map<string, VariableMapEntry[]>): VariableSummary {
    const variables = variableMap.get(itemId) || [];
    const summary: MutableVariableSummary = {};

    for (const variable of variables) {
      const key = variable.name;
      if (summary[key]) {
        summary[key] = {
          quantity: summary[key].quantity + variable.quantity,
          unit: summary[key].unit || variable.unit,
          category: summary[key].category || variable.category
        };
      } else {
        summary[key] = {
          quantity: variable.quantity,
          unit: variable.unit,
          category: variable.category
        };
      }
    }

    return summary as VariableSummary;
  }

  private multiplyVariableSummary(summary: VariableSummary, multiplier: number): VariableSummary {
    const result: MutableVariableSummary = {};

    for (const [name, variable] of Object.entries(summary)) {
      result[name] = {
        quantity: variable.quantity * multiplier,
        unit: variable.unit,
        category: variable.category
      };
    }

    return result as VariableSummary;
  }

  private combineVariableSummaries(summaries: VariableSummary[]): VariableSummary {
    const result: MutableVariableSummary = {};

    for (const summary of summaries) {
      this.combineIntoSummary(result, summary);
    }

    return result as VariableSummary;
  }

  private combineIntoSummary(target: MutableVariableSummary, source: VariableSummary): void {
    for (const [name, variable] of Object.entries(source)) {
      if (target[name]) {
        target[name] = {
          quantity: target[name].quantity + variable.quantity,
          unit: target[name].unit || variable.unit,
          category: target[name].category || variable.category
        };
      } else {
        target[name] = { ...variable };
      }
    }
  }

  private getCachedSummary(itemId: string): RelationshipCacheEntry | undefined {
    const entry = this.cache.get(itemId);
    if (!entry) {
      return undefined;
    }

    // Check if cache entry is still valid (you might want to add TTL logic here)
    const now = Date.now();
    const cacheAge = now - entry.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (cacheAge > maxAge) {
      this.cache.delete(itemId);
      return undefined;
    }

    // Update access statistics
    const updatedEntry: RelationshipCacheEntry = {
      ...entry,
      accessCount: entry.accessCount + 1,
      lastAccessed: now
    };
    this.cache.set(itemId, updatedEntry);

    return updatedEntry;
  }

  private setCachedSummary(
    itemId: string,
    summary: VariableSummary,
    dependencies: string[]
  ): void {
    const relationshipSummary: RelationshipSummary = {
      itemId,
      directVariables: this.getDirectVariables(itemId, new Map()), // Note: This is a simplified version
      relationshipContributions: new Map(),
      totalSummary: summary,
      lastUpdated: Date.now()
    };

    const cacheEntry: RelationshipCacheEntry = {
      summary: relationshipSummary,
      dependencies: new Set(dependencies),
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(itemId, cacheEntry);

    // Cleanup old entries if cache gets too large
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    // Remove oldest entries based on last accessed time
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private updatePerformanceMetrics(
    calculationTime: number,
    cacheHits: number,
    cacheMisses: number
  ): void {
    const totalRequests = cacheHits + cacheMisses;
    this.performanceMetrics = {
      calculationTime,
      cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      relationshipsProcessed: this.relationshipTracker.getMetrics().totalRelationships,
      cascadeDepth: this.relationshipTracker.getMetrics().maxDepth,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    let usage = 0;
    for (const entry of this.cache.values()) {
      usage += this.estimateEntrySize(entry);
    }
    return usage;
  }

  private estimateEntrySize(entry: RelationshipCacheEntry): number {
    // Rough estimation of memory usage in bytes
    let size = 0;

    // Summary object
    size += JSON.stringify(entry.summary.totalSummary).length * 2; // UTF-16 chars

    // Dependencies set
    size += entry.dependencies.size * 50; // Rough estimate for string IDs

    // Other properties
    size += 100; // For timestamps, counts, etc.

    return size;
  }

  private fallbackCalculation(
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): VariableSummary {
    // Basic fallback calculation without relationship tracking
    console.warn('Falling back to basic variable calculation for item:', item.id);

    const summary = this.getDirectVariables(item.id, variableMap) as MutableVariableSummary;

    // Add child variables using basic parent-child relationships
    if (hasChildren(item)) {
      const children = getChildren(item);
      for (const childRef of children) {
        const childId = getChildId(childRef);
        const childItem = allItems.find(i => i.id === childId);
        if (childItem) {
          const childSummary = this.fallbackCalculation(childItem, allItems, variableMap);
          this.combineIntoSummary(summary, childSummary);
        }
      }
    }

    return summary as VariableSummary;
  }
}
