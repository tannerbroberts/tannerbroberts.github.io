import { useCallback, useEffect, useRef, useState } from 'react';
import { RelationshipTracker } from '../functions/utils/variable/relationshipTracker';
import { VariableSummaryCalculator } from '../functions/utils/variable/variableSummaryCalculator';
import { SummaryUpdater } from '../functions/utils/variable/summaryUpdater';
import { VariableSummary } from '../functions/utils/variable/types';
import { RelationshipSummary, RelationshipUpdateContext } from '../functions/utils/variable/types/RelationshipTypes';
import { Item } from '../functions/utils/item/index';

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
 * Hook for relationship-aware variable summaries
 */
export function useRelationshipBasedSummary() {
  const [relationshipTracker] = useState(() => new RelationshipTracker());
  const [calculator] = useState(() => new VariableSummaryCalculator(relationshipTracker));
  const [updater] = useState(() => new SummaryUpdater(relationshipTracker, calculator));

  // Cache for relationship summaries
  const summaryCache = useRef<Map<string, RelationshipSummary>>(new Map());

  // Subscribe to relationship changes
  useEffect(() => {
    const unsubscribe = relationshipTracker.subscribe('*', (context: RelationshipUpdateContext) => {
      // Invalidate affected cache entries
      for (const cacheKey of context.invalidatedCacheKeys) {
        summaryCache.current.delete(cacheKey);
      }
    });

    return unsubscribe;
  }, [relationshipTracker]);

  /**
   * Calculate relationship-based summary for an item
   */
  const calculateSummary = useCallback((
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): VariableSummary => {
    return calculator.calculateSummary(item, allItems, variableMap);
  }, [calculator]);

  /**
   * Get comprehensive relationship summary including contributions
   */
  const getRelationshipSummary = useCallback((
    item: Item,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): RelationshipSummary => {
    const cached = summaryCache.current.get(item.id);
    if (cached) {
      return cached;
    }

    const summary = calculator.calculateRelationshipSummary(item, allItems, variableMap);
    summaryCache.current.set(item.id, summary);

    return summary;
  }, [calculator]);

  /**
   * Create a new relationship between items
   */
  const createRelationship = useCallback((
    relationshipId: string,
    parentItemId: string,
    childItemId: string,
    multiplier: number = 1
  ) => {
    try {
      return relationshipTracker.createRelationship(relationshipId, parentItemId, childItemId, multiplier);
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  }, [relationshipTracker]);

  /**
   * Remove a relationship
   */
  const removeRelationship = useCallback((relationshipId: string): boolean => {
    return relationshipTracker.removeRelationship(relationshipId);
  }, [relationshipTracker]);

  /**
   * Update relationship multiplier and cascade changes
   */
  const updateRelationshipMultiplier = useCallback(async (
    relationshipId: string,
    multiplier: number,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> => {
    return updater.updateRelationshipMultiplier(relationshipId, multiplier, allItems, variableMap);
  }, [updater]);

  /**
   * Update variables for an item and cascade changes
   */
  const updateVariables = useCallback(async (
    itemId: string,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> => {
    return updater.updateVariables(itemId, allItems, variableMap);
  }, [updater]);

  /**
   * Batch update multiple items
   */
  const batchUpdate = useCallback(async (
    itemIds: string[],
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> => {
    return updater.batchUpdate(itemIds, allItems, variableMap);
  }, [updater]);

  /**
   * Get relationships for an item
   */
  const getChildRelationships = useCallback((itemId: string) => {
    return relationshipTracker.getChildRelationships(itemId);
  }, [relationshipTracker]);

  const getParentRelationships = useCallback((itemId: string) => {
    return relationshipTracker.getParentRelationships(itemId);
  }, [relationshipTracker]);

  /**
   * Validate relationship consistency
   */
  const validateRelationships = useCallback(() => {
    return relationshipTracker.getMetrics();
  }, [relationshipTracker]);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return {
      ...calculator.getCacheStats(),
      relationshipCacheSize: summaryCache.current.size,
      relationshipMetrics: relationshipTracker.getMetrics()
    };
  }, [calculator, relationshipTracker]);

  /**
   * Clear all caches
   */
  const clearCaches = useCallback(() => {
    calculator.clearCache();
    summaryCache.current.clear();
  }, [calculator]);

  /**
   * Initialize relationships from existing item hierarchy
   */
  const initializeFromItems = useCallback((items: Item[]) => {
    let relationshipsCreated = 0;

    for (const item of items) {
      // Extract parent relationships from the item's parents array
      for (const parent of item.parents) {
        try {
          relationshipTracker.createRelationship(
            parent.relationshipId,
            parent.id,
            item.id,
            1 // Default multiplier
          );
          relationshipsCreated++;
        } catch (error) {
          console.warn(`Failed to create relationship ${parent.relationshipId}:`, error);
        }
      }
    }

    console.log(`Initialized ${relationshipsCreated} relationships from ${items.length} items`);

    return relationshipsCreated;
  }, [relationshipTracker]);

  /**
   * Rebuild relationships from scratch
   */
  const rebuildRelationships = useCallback((items: Item[]) => {
    relationshipTracker.clear();
    summaryCache.current.clear();
    return initializeFromItems(items);
  }, [relationshipTracker, initializeFromItems]);

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    return calculator.getPerformanceMetrics();
  }, [calculator]);

  return {
    // Core functionality
    calculateSummary,
    getRelationshipSummary,

    // Relationship management
    createRelationship,
    removeRelationship,
    updateRelationshipMultiplier,
    getChildRelationships,
    getParentRelationships,

    // Update operations
    updateVariables,
    batchUpdate,

    // Utility functions
    validateRelationships,
    getCacheStats,
    clearCaches,
    initializeFromItems,
    rebuildRelationships,
    getPerformanceMetrics,

    // Direct access to underlying components (for advanced usage)
    relationshipTracker,
    calculator,
    updater
  };
}
