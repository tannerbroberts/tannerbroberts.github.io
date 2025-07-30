import { useRef, useCallback } from 'react';
import {
  Variable,
  VariableSummary,
  calculateVariableSummary,
  Item,
  getRelationshipTracker,
  synchronizeRelationships
} from '../functions/utils/item/index';

interface CacheEntry {
  summary: VariableSummary;
  timestamp: number;
  dependencies: string[]; // Item IDs that affect this calculation
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useVariableSummaryCache() {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const relationshipsSyncedRef = useRef(false);

  const getCachedSummary = useCallback((
    itemId: string,
    item: Item,
    allItems: Item[],
    variableMap: Map<string, Variable[]>
  ): VariableSummary => {
    // Ensure relationships are synchronized on first use
    if (!relationshipsSyncedRef.current) {
      synchronizeRelationships(allItems);
      relationshipsSyncedRef.current = true;
    }

    const cache = cacheRef.current;
    const cached = cache.get(itemId);
    const now = Date.now();

    // Check if cache is valid
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      // Verify dependencies haven't changed
      const dependenciesValid = cached.dependencies.every(depId =>
        allItems.find(i => i.id === depId) !== undefined
      );

      if (dependenciesValid) {
        return cached.summary;
      }
    }

    // Calculate fresh summary using relationship-based calculation
    const summary = calculateVariableSummary(item, allItems, variableMap);

    // Determine dependencies using relationship tracker
    const dependencies = [itemId];
    const tracker = getRelationshipTracker();

    // Add child dependencies from relationships
    const childRelationships = tracker.getChildRelationships(itemId);
    for (const relationship of childRelationships) {
      if (!dependencies.includes(relationship.childItemId)) {
        dependencies.push(relationship.childItemId);
      }
    }

    // Add parent dependencies from relationships  
    const parentRelationships = tracker.getParentRelationships(itemId);
    for (const relationship of parentRelationships) {
      if (!dependencies.includes(relationship.parentItemId)) {
        dependencies.push(relationship.parentItemId);
      }
    }

    // Cache the result
    cache.set(itemId, {
      summary,
      timestamp: now,
      dependencies
    });

    return summary;
  }, []);

  const invalidateCache = useCallback((itemId?: string) => {
    const cache = cacheRef.current;

    if (itemId) {
      // Invalidate specific item and anything that depends on it using relationship tracking
      const tracker = getRelationshipTracker();
      const toInvalidate = new Set<string>();

      // Add the item itself
      toInvalidate.add(itemId);

      // Add all items that have this item as a relationship dependency
      const affectedRelationships = tracker.getAffectedRelationships(itemId);
      for (const relationshipId of affectedRelationships) {
        const relationship = tracker.getRelationship(relationshipId);
        if (relationship) {
          toInvalidate.add(relationship.parentItemId);
          toInvalidate.add(relationship.childItemId);
        }
      }

      // Also check cache dependencies (legacy support)
      for (const [cachedItemId, entry] of cache) {
        if (entry.dependencies.includes(itemId)) {
          toInvalidate.add(cachedItemId);
        }
      }

      for (const id of toInvalidate) {
        cache.delete(id);
      }
    } else {
      // Clear entire cache
      cache.clear();
      relationshipsSyncedRef.current = false; // Force re-sync on next use
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of cache) {
      if ((now - entry.timestamp) < CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: cache.size,
      validEntries,
      expiredEntries,
      relationshipsSynced: relationshipsSyncedRef.current
    };
  }, []);

  // Force synchronization of relationships
  const syncRelationships = useCallback((allItems: Item[]) => {
    const count = synchronizeRelationships(allItems);
    relationshipsSyncedRef.current = true;
    // Clear cache to force recalculation with new relationships
    cacheRef.current.clear();
    return count;
  }, []);

  return {
    getCachedSummary,
    invalidateCache,
    getCacheStats,
    syncRelationships
  };
}
