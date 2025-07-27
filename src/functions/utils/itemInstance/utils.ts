import { ItemInstance, ItemInstanceImpl } from './types';
import { BaseCalendarEntry } from '../../reducers/AppReducer';

/**
 * Create an ItemInstance from a BaseCalendarEntry
 */
export function createInstanceFromCalendarEntry(
  calendarEntry: BaseCalendarEntry,
  additionalData?: Partial<ItemInstance>
): ItemInstanceImpl {
  return new ItemInstanceImpl({
    itemId: calendarEntry.itemId,
    calendarEntryId: calendarEntry.id,
    scheduledStartTime: calendarEntry.startTime,
    ...additionalData
  });
}

/**
 * Get instance by ID from instance map
 */
export function getInstanceById(
  instances: Map<string, ItemInstance>,
  instanceId: string | null
): ItemInstance | null {
  if (!instanceId) return null;
  return instances.get(instanceId) || null;
}

/**
 * Get instances by calendar entry ID
 */
export function getInstancesByCalendarEntryId(
  instances: Map<string, ItemInstance>,
  calendarEntryId: string
): ItemInstance[] {
  return Array.from(instances.values()).filter(
    instance => instance.calendarEntryId === calendarEntryId
  );
}

/**
 * Get instances by item ID
 */
export function getInstancesByItemId(
  instances: Map<string, ItemInstance>,
  itemId: string
): ItemInstance[] {
  return Array.from(instances.values()).filter(
    instance => instance.itemId === itemId
  );
}

/**
 * Get incomplete instances that are in the past
 */
export function getPastIncompleteInstances(
  instances: Map<string, ItemInstance>,
  currentTime: number = Date.now()
): ItemInstance[] {
  return Array.from(instances.values()).filter(instance => {
    // Not complete
    if (instance.isComplete) return false;

    // In the past (scheduled start time has passed)
    if (instance.scheduledStartTime > currentTime) return false;

    // Not currently executing (this will be determined by execution context)
    // For now, consider it past if it should have started
    return true;
  });
}

/**
 * Check if an instance is currently executing
 */
export function isInstanceCurrentlyExecuting(
  instance: ItemInstance,
  currentTaskChain: string[], // Array of currently executing item IDs
  currentTime: number = Date.now()
): boolean {
  // Instance must have started or be scheduled to start
  const startTime = instance.actualStartTime || instance.scheduledStartTime;
  if (startTime > currentTime) return false;

  // Must be in current execution chain
  return currentTaskChain.includes(instance.itemId);
}
