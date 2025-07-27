import { useMemo } from 'react';
import { useAppState } from '../reducerContexts/App';
import {
  ItemInstance,
  getInstancesByItemId,
  getInstancesByCalendarEntryId,
  getPastIncompleteInstances
} from '../functions/utils/item/index';

/**
 * Hook for managing and accessing item instances
 */
export function useItemInstances() {
  const { itemInstances } = useAppState();

  const hooks = useMemo(() => {
    // Get past incomplete instances
    const pastIncompleteInstances = getPastIncompleteInstances(itemInstances);

    // For now, accounting instances are the same as past incomplete instances
    // In a more sophisticated implementation, we would filter out currently executing instances
    const accountingInstances = pastIncompleteInstances;

    return {
      // Get all instances
      allInstances: itemInstances,

      // Get past incomplete instances (includes currently executing)
      pastIncompleteInstances,

      // Get accounting instances (past incomplete but NOT currently executing)
      accountingInstances,

      // Get instances by item ID
      getInstancesByItemId: (itemId: string): ItemInstance[] => {
        return getInstancesByItemId(itemInstances, itemId);
      },

      // Get instances by calendar entry ID
      getInstancesByCalendarEntryId: (calendarEntryId: string): ItemInstance[] => {
        return getInstancesByCalendarEntryId(itemInstances, calendarEntryId);
      },

      // Get instance by ID
      getInstance: (instanceId: string): ItemInstance | null => {
        return itemInstances.get(instanceId) || null;
      },

      // Check if any instance is currently executing for an item
      hasExecutingInstance: (itemId: string): boolean => {
        const instances = getInstancesByItemId(itemInstances, itemId);
        return instances.some(instance =>
          instance.actualStartTime && !instance.isComplete
        );
      },

      // Get currently executing instance for an item
      getExecutingInstance: (itemId: string): ItemInstance | null => {
        const instances = getInstancesByItemId(itemInstances, itemId);
        return instances.find(instance =>
          instance.actualStartTime && !instance.isComplete
        ) || null;
      }
    };
  }, [itemInstances]);

  return hooks;
}

/**
 * Hook for getting execution context with instances
 */
export function useExecutionContext() {
  const { items, baseCalendar } = useAppState();
  const { allInstances } = useItemInstances();

  return useMemo(() => ({
    items,
    instances: allInstances,
    baseCalendar
  }), [items, allInstances, baseCalendar]);
}
