import { Item, ItemFactory, ItemInstanceImpl, VariableImpl } from '../functions/utils/item/index';
import type { ItemJSON, ItemInstanceJSON, VariableJSON, VariableSummary } from '../functions/utils/item/index';
import type { VariableDefinition, VariableDescription } from '../functions/utils/item/types/VariableTypes';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION, MAX_STORAGE_SIZE } from './constants';
import type { StorageResult, StorageMetadata, SerializedStorageData } from './types';
import {
  serializeVariableDefinitions,
  deserializeVariableDefinitions,
  serializeVariableDescriptions,
  deserializeVariableDescriptions
} from './variableStorageUtils';

/**
 * Core storage operations for Items
 */

/**
 * Saves an array of items to localStorage
 * @param items - Array of Item instances to save
 * @returns StorageResult indicating success/failure
 */
export function saveItemsToStorage(items: Item[]): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const serializedItems = serializeItems(items);
    const dataToSave = {
      items: serializedItems,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(dataToSave);

    // Check storage size before saving
    if (jsonString.length > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Data size (${jsonString.length} bytes) exceeds maximum allowed size (${MAX_STORAGE_SIZE} bytes)`
      };
    }

    localStorage.setItem(STORAGE_KEYS.ITEMS, jsonString);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please clear some data and try again.'
        };
      }
      return {
        success: false,
        error: `Failed to save items: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving items'
    };
  }
}

/**
 * Loads items array from localStorage
 * @returns StorageResult with items array or error
 */
export function loadItemsFromStorage(): StorageResult<Item[]> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const storedData = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!storedData) {
      // No data stored yet - return empty array
      return {
        success: true,
        data: []
      };
    }

    const parsedData = JSON.parse(storedData);

    // Validate the data structure
    if (!isValidItemStorageData(parsedData)) {
      return {
        success: false,
        error: 'Invalid or corrupted item data in storage'
      };
    }

    const items = deserializeItems(parsedData.items);

    return {
      success: true,
      data: items
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to load items: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while loading items'
    };
  }
}

/**
 * Saves baseCalendar Map to localStorage
 * @param baseCalendar - Map of calendar entries to save
 * @returns StorageResult indicating success/failure
 */
export function saveBaseCalendarToStorage(baseCalendar: Map<string, BaseCalendarEntry>): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const serializedCalendar = serializeBaseCalendar(baseCalendar);
    const dataToSave = {
      baseCalendar: serializedCalendar,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(dataToSave);

    // Check storage size before saving
    if (jsonString.length > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Data size (${jsonString.length} bytes) exceeds maximum allowed size (${MAX_STORAGE_SIZE} bytes)`
      };
    }

    localStorage.setItem(STORAGE_KEYS.BASE_CALENDAR, jsonString);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please clear some data and try again.'
        };
      }
      return {
        success: false,
        error: `Failed to save base calendar: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving base calendar'
    };
  }
}

/**
 * Loads baseCalendar Map from localStorage
 * @returns StorageResult with baseCalendar Map or error
 */
export function loadBaseCalendarFromStorage(): StorageResult<Map<string, BaseCalendarEntry>> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const storedData = localStorage.getItem(STORAGE_KEYS.BASE_CALENDAR);
    if (!storedData) {
      // No data stored yet - return empty Map
      return {
        success: true,
        data: new Map<string, BaseCalendarEntry>()
      };
    }

    const parsedData = JSON.parse(storedData);

    // Validate the data structure
    if (!isValidCalendarStorageData(parsedData)) {
      return {
        success: false,
        error: 'Invalid or corrupted calendar data in storage'
      };
    }

    const baseCalendar = deserializeBaseCalendar(parsedData.baseCalendar);

    return {
      success: true,
      data: baseCalendar
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to load base calendar: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while loading base calendar'
    };
  }
}

/**
 * Combined operations
 */

/**
 * Saves both items and baseCalendar to localStorage
 * @param items - Array of Item instances to save
 * @param baseCalendar - Map of calendar entries to save
 * @returns StorageResult indicating success/failure
 */
export function saveAllDataToStorage(items: Item[], baseCalendar: Map<string, BaseCalendarEntry>): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const serializedItems = serializeItems(items);
    const serializedCalendar = serializeBaseCalendar(baseCalendar);

    const dataToSave: SerializedStorageData = {
      items: serializedItems,
      baseCalendar: serializedCalendar,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(dataToSave);

    // Check storage size before saving
    if (jsonString.length > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Data size (${jsonString.length} bytes) exceeds maximum allowed size (${MAX_STORAGE_SIZE} bytes)`
      };
    }

    // Save items
    const itemsResult = saveItemsToStorage(items);
    if (!itemsResult.success) {
      return itemsResult;
    }

    // Save calendar
    const calendarResult = saveBaseCalendarToStorage(baseCalendar);
    if (!calendarResult.success) {
      return calendarResult;
    }

    // Update schema version
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to save all data: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving all data'
    };
  }
}

/**
 * Loads both items and baseCalendar from localStorage
 * @returns StorageResult with both datasets or error
 */
export function loadAllDataFromStorage(): StorageResult<{ items: Item[]; baseCalendar: Map<string, BaseCalendarEntry> }> {
  try {
    const itemsResult = loadItemsFromStorage();
    if (!itemsResult.success) {
      return {
        success: false,
        error: itemsResult.error
      };
    }

    const calendarResult = loadBaseCalendarFromStorage();
    if (!calendarResult.success) {
      return {
        success: false,
        error: calendarResult.error
      };
    }

    return {
      success: true,
      data: {
        items: itemsResult.data || [],
        baseCalendar: calendarResult.data || new Map<string, BaseCalendarEntry>()
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to load all data: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while loading all data'
    };
  }
}

/**
 * Utility functions
 */

/**
 * Clears all ATP-related data from localStorage
 * @returns StorageResult indicating success/failure
 */
export function clearAllStorageData(): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to clear storage data: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while clearing storage data'
    };
  }
}

/**
 * Gets metadata about the current storage state
 * @returns StorageMetadata with size and count information
 */
export function getStorageMetadata(): StorageMetadata {
  if (!isStorageAvailable()) {
    return createEmptyMetadata();
  }

  try {
    const itemsMetadata = getItemsMetadata();
    const calendarMetadata = getCalendarMetadata();
    const versionMetadata = getVersionMetadata();

    return {
      size: itemsMetadata.size + calendarMetadata.size + versionMetadata.size,
      itemCount: itemsMetadata.itemCount,
      calendarEntryCount: calendarMetadata.calendarEntryCount,
      lastModified: Math.max(itemsMetadata.lastModified, calendarMetadata.lastModified),
      version: versionMetadata.version
    };
  } catch {
    return createEmptyMetadata();
  }
}

/**
 * Helper function to create empty metadata
 */
function createEmptyMetadata(): StorageMetadata {
  return {
    size: 0,
    itemCount: 0,
    calendarEntryCount: 0,
    lastModified: 0,
    version: CURRENT_SCHEMA_VERSION
  };
}

/**
 * Gets metadata for items storage
 */
function getItemsMetadata(): { size: number; itemCount: number; lastModified: number } {
  const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (!itemsData) {
    return { size: 0, itemCount: 0, lastModified: 0 };
  }

  try {
    const parsedItems = JSON.parse(itemsData);
    return {
      size: itemsData.length,
      itemCount: Array.isArray(parsedItems.items) ? parsedItems.items.length : 0,
      lastModified: parsedItems.timestamp || 0
    };
  } catch {
    return { size: itemsData.length, itemCount: 0, lastModified: 0 };
  }
}

/**
 * Gets metadata for calendar storage
 */
function getCalendarMetadata(): { size: number; calendarEntryCount: number; lastModified: number } {
  const calendarData = localStorage.getItem(STORAGE_KEYS.BASE_CALENDAR);
  if (!calendarData) {
    return { size: 0, calendarEntryCount: 0, lastModified: 0 };
  }

  try {
    const parsedCalendar = JSON.parse(calendarData);
    return {
      size: calendarData.length,
      calendarEntryCount: Array.isArray(parsedCalendar.baseCalendar) ? parsedCalendar.baseCalendar.length : 0,
      lastModified: parsedCalendar.timestamp || 0
    };
  } catch {
    return { size: calendarData.length, calendarEntryCount: 0, lastModified: 0 };
  }
}

/**
 * Gets metadata for version storage
 */
function getVersionMetadata(): { size: number; version: string } {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
  return {
    size: storedVersion ? storedVersion.length : 0,
    version: storedVersion || CURRENT_SCHEMA_VERSION
  };
}

/**
 * Checks if localStorage is available in the current environment
 * @returns boolean indicating localStorage availability
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__atp_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current storage size used by ATP data
 * @returns Size in bytes
 */
export function getStorageSize(): number {
  try {
    if (!isStorageAvailable()) {
      return 0;
    }

    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    });

    return totalSize;
  } catch {
    return 0;
  }
}

/**
 * Internal helper functions
 */

/**
 * Serializes an array of Item instances to JSON-compatible format
 * @param items - Array of Item instances
 * @returns Array of serialized item objects
 */
function serializeItems(items: Item[]): unknown[] {
  return items.map(item => item.toJSON());
}

/**
 * Deserializes an array of JSON objects back to Item instances
 * @param serializedItems - Array of serialized item objects
 * @returns Array of Item instances
 */
function deserializeItems(serializedItems: unknown[]): Item[] {
  if (!Array.isArray(serializedItems)) {
    throw new Error('serializedItems must be an array');
  }

  // Type assertion is safe here because we validate the structure in the calling function
  return ItemFactory.fromJSONArray(serializedItems as ItemJSON[]);
}

/**
 * Serializes a Map of BaseCalendarEntry to JSON-compatible format
 * @param baseCalendar - Map of calendar entries
 * @returns Array of [key, value] tuples
 */
function serializeBaseCalendar(baseCalendar: Map<string, BaseCalendarEntry>): Array<[string, BaseCalendarEntry]> {
  return Array.from(baseCalendar.entries());
}

/**
 * Deserializes an array of tuples back to a Map of BaseCalendarEntry
 * @param serializedCalendar - Array of [key, value] tuples
 * @returns Map of BaseCalendarEntry
 */
function deserializeBaseCalendar(serializedCalendar: Array<[string, BaseCalendarEntry]>): Map<string, BaseCalendarEntry> {
  if (!Array.isArray(serializedCalendar)) {
    throw new Error('serializedCalendar must be an array');
  }

  return new Map(serializedCalendar);
}

/**
 * Validates that stored data has the expected structure for items
 * @param data - Unknown data from storage
 * @returns Type guard indicating if data is valid
 */
function isValidItemStorageData(data: unknown): data is { items: unknown[]; version: string; timestamp: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'version' in data &&
    'timestamp' in data &&
    Array.isArray((data as Record<string, unknown>).items) &&
    typeof (data as Record<string, unknown>).version === 'string' &&
    typeof (data as Record<string, unknown>).timestamp === 'number'
  );
}

/**
 * Validates that stored data has the expected structure for calendar
 * @param data - Unknown data from storage
 * @returns Type guard indicating if data is valid
 */
function isValidCalendarStorageData(data: unknown): data is { baseCalendar: Array<[string, BaseCalendarEntry]>; version: string; timestamp: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'baseCalendar' in data &&
    'version' in data &&
    'timestamp' in data &&
    Array.isArray((data as Record<string, unknown>).baseCalendar) &&
    typeof (data as Record<string, unknown>).version === 'string' &&
    typeof (data as Record<string, unknown>).timestamp === 'number'
  );
}

/**
 * Gets storage statistics and usage information
 * @returns Storage statistics including sizes and quota usage
 */
export function getStorageStats(): {
  totalSize: number;
  itemsSize: number;
  calendarSize: number;
  metadataSize: number;
  quotaUsed: number;
  quotaRemaining: number;
} {
  try {
    if (!isStorageAvailable()) {
      return {
        totalSize: 0,
        itemsSize: 0,
        calendarSize: 0,
        metadataSize: 0,
        quotaUsed: 0,
        quotaRemaining: 0
      };
    }

    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS) || '';
    const calendarData = localStorage.getItem(STORAGE_KEYS.BASE_CALENDAR) || '';
    const versionData = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || '';

    const itemsSize = itemsData.length;
    const calendarSize = calendarData.length;
    const metadataSize = versionData.length;
    const totalSize = itemsSize + calendarSize + metadataSize;

    // Estimate quota usage (localStorage typically has 5MB limit)
    const estimatedQuota = MAX_STORAGE_SIZE;
    const quotaUsed = totalSize / estimatedQuota;
    const quotaRemaining = estimatedQuota - totalSize;

    return {
      totalSize,
      itemsSize,
      calendarSize,
      metadataSize,
      quotaUsed,
      quotaRemaining
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalSize: 0,
      itemsSize: 0,
      calendarSize: 0,
      metadataSize: 0,
      quotaUsed: 0,
      quotaRemaining: 0
    };
  }
}

/**
 * Clears all storage data (items, calendar, and metadata)
 * @returns Result indicating success or failure
 */
export function clearAllDataFromStorage(): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.BASE_CALENDAR);
    localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear storage data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Enhanced App State Storage Operations for Step 2
 */

/**
 * Serialize item instances map to array for storage
 */
export function serializeItemInstances(instances: Map<string, ItemInstanceImpl>): Array<[string, ItemInstanceJSON]> {
  return Array.from(instances.entries()).map(([id, instance]) => [
    id,
    instance.toJSON()
  ]);
}

/**
 * Deserialize item instances from array to map
 */
export function deserializeItemInstances(serializedInstances: Array<[string, ItemInstanceJSON]>): Map<string, ItemInstanceImpl> {
  const instances = new Map();
  for (const [id, instanceData] of serializedInstances) {
    instances.set(id, ItemInstanceImpl.fromJSON(instanceData));
  }
  return instances;
}

/**
 * Serialize item variables map to array for storage
 */
export function serializeItemVariables(variables: Map<string, VariableImpl[]>): Array<[string, VariableJSON[]]> {
  return Array.from(variables.entries()).map(([itemId, varArray]) => [
    itemId,
    varArray.map(v => v.toJSON())
  ]);
}

/**
 * Deserialize item variables from array to map
 */
export function deserializeItemVariables(serializedVariables: Array<[string, VariableJSON[]]>): Map<string, VariableImpl[]> {
  const variables = new Map();
  for (const [itemId, varArray] of serializedVariables) {
    variables.set(itemId, varArray.map(v => VariableImpl.fromJSON(v)));
  }
  return variables;
}

/**
 * Serialize variable summary cache map to array for storage
 */
export function serializeVariableSummaryCache(cache: Map<string, VariableSummary>): Array<[string, VariableSummary]> {
  return Array.from(cache.entries());
}

/**
 * Deserialize variable summary cache from array to map
 */
export function deserializeVariableSummaryCache(serializedCache: Array<[string, VariableSummary]>): Map<string, VariableSummary> {
  return new Map(serializedCache);
}

/**
 * Variable system storage functions (Step 3)
 */

/**
 * Saves variable definitions Map to localStorage
 */
export function saveVariableDefinitionsToStorage(definitions: Map<string, VariableDefinition>): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const serializedDefinitions = serializeVariableDefinitions(definitions);
    const dataToSave = {
      variableDefinitions: serializedDefinitions,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(dataToSave);

    // Check storage size before saving
    if (jsonString.length > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Data size (${jsonString.length} bytes) exceeds maximum allowed size (${MAX_STORAGE_SIZE} bytes)`
      };
    }

    localStorage.setItem(STORAGE_KEYS.VARIABLE_DEFINITIONS, jsonString);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please clear some data and try again.'
        };
      }
      return {
        success: false,
        error: `Failed to save variable definitions: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving variable definitions'
    };
  }
}

/**
 * Loads variable definitions Map from localStorage
 */
export function loadVariableDefinitionsFromStorage(): StorageResult<Map<string, VariableDefinition>> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const storedData = localStorage.getItem(STORAGE_KEYS.VARIABLE_DEFINITIONS);
    if (!storedData) {
      // No data stored yet - return empty Map
      return {
        success: true,
        data: new Map<string, VariableDefinition>()
      };
    }

    const parsedData = JSON.parse(storedData);

    // Validate the data structure
    if (!parsedData || !Array.isArray(parsedData.variableDefinitions)) {
      return {
        success: false,
        error: 'Invalid or corrupted variable definitions data in storage'
      };
    }

    const definitions = deserializeVariableDefinitions(parsedData.variableDefinitions);

    return {
      success: true,
      data: definitions
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to load variable definitions: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while loading variable definitions'
    };
  }
}

/**
 * Saves variable descriptions Map to localStorage
 */
export function saveVariableDescriptionsToStorage(descriptions: Map<string, VariableDescription>): StorageResult<void> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const serializedDescriptions = serializeVariableDescriptions(descriptions);
    const dataToSave = {
      variableDescriptions: serializedDescriptions,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now()
    };

    const jsonString = JSON.stringify(dataToSave);

    // Check storage size before saving
    if (jsonString.length > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Data size (${jsonString.length} bytes) exceeds maximum allowed size (${MAX_STORAGE_SIZE} bytes)`
      };
    }

    localStorage.setItem(STORAGE_KEYS.VARIABLE_DESCRIPTIONS, jsonString);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please clear some data and try again.'
        };
      }
      return {
        success: false,
        error: `Failed to save variable descriptions: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving variable descriptions'
    };
  }
}

/**
 * Loads variable descriptions Map from localStorage
 */
export function loadVariableDescriptionsFromStorage(): StorageResult<Map<string, VariableDescription>> {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available in this environment'
      };
    }

    const storedData = localStorage.getItem(STORAGE_KEYS.VARIABLE_DESCRIPTIONS);
    if (!storedData) {
      // No data stored yet - return empty Map
      return {
        success: true,
        data: new Map<string, VariableDescription>()
      };
    }

    const parsedData = JSON.parse(storedData);

    // Validate the data structure
    if (!parsedData || !Array.isArray(parsedData.variableDescriptions)) {
      return {
        success: false,
        error: 'Invalid or corrupted variable descriptions data in storage'
      };
    }

    const descriptions = deserializeVariableDescriptions(parsedData.variableDescriptions);

    return {
      success: true,
      data: descriptions
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to load variable descriptions: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while loading variable descriptions'
    };
  }
}
