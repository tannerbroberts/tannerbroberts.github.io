import { useRef, useCallback } from 'react';
import { Variable, VariableSummary, calculateVariableSummary, Item, SubCalendarItem, CheckListItem } from '../functions/utils/item/index';

interface CacheEntry {
  summary: VariableSummary;
  timestamp: number;
  dependencies: string[]; // Item IDs that affect this calculation
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useVariableSummaryCache() {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const getCachedSummary = useCallback((
    itemId: string,
    item: Item,
    allItems: Item[],
    variableMap: Map<string, Variable[]>
  ): VariableSummary => {
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

    // Calculate fresh summary
    const summary = calculateVariableSummary(item, allItems, variableMap);

    // Determine dependencies (items in hierarchy)
    const dependencies = [itemId];
    const addChildDependencies = (parentItem: Item) => {
      if (parentItem instanceof SubCalendarItem || parentItem instanceof CheckListItem) {
        const children = parentItem.children;
        for (const child of children) {
          const childId = 'id' in child ? child.id : child.itemId;
          if (!dependencies.includes(childId)) {
            dependencies.push(childId);
            const childItem = allItems.find(i => i.id === childId);
            if (childItem) {
              addChildDependencies(childItem);
            }
          }
        }
      }
    };
    addChildDependencies(item);

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
      // Invalidate specific item and anything that depends on it
      const toInvalidate = new Set<string>();

      for (const [cachedItemId, entry] of cache) {
        if (cachedItemId === itemId || entry.dependencies.includes(itemId)) {
          toInvalidate.add(cachedItemId);
        }
      }

      for (const id of toInvalidate) {
        cache.delete(id);
      }
    } else {
      // Clear entire cache
      cache.clear();
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
      expiredEntries
    };
  }, []);

  return {
    getCachedSummary,
    invalidateCache,
    getCacheStats
  };
}
