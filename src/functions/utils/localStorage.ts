import { Item, ItemFactory, ItemJSON, ItemInstanceImpl, ItemInstanceJSON } from './item/index';
import { BaseCalendarEntry } from '../reducers/AppReducer';

// Storage keys
const STORAGE_KEYS = {
  ITEMS: 'about-time-items',
  BASE_CALENDAR: 'about-time-base-calendar',
  ITEM_INSTANCES: 'about-time-item-instances',
  APP_SETTINGS: 'about-time-app-settings'
} as const;

// Types for persisted data
export interface PersistedAppSettings {
  millisecondsPerSegment?: number;
  pixelsPerSegment?: number;
  expandSearchItems?: boolean;
  focusedItemId?: string | null;
  currentView?: 'execution' | 'accounting' | 'day';
  itemSearchWindowRange?: { min: number; max: number };
}

export interface PersistedBaseCalendarEntry {
  id: string;
  itemId: string;
  startTime: number;
}

// Save functions
export function saveItemsToLocalStorage(items: Item[]): void {
  try {
    const itemsJSON = items.map(item => item.toJSON());
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(itemsJSON));
  } catch (error) {
    console.warn('Failed to save items to localStorage:', error);
  }
}

export function saveBaseCalendarToLocalStorage(baseCalendar: Map<string, BaseCalendarEntry>): void {
  try {
    const calendarArray = Array.from(baseCalendar.values()).map(entry => ({
      id: entry.id,
      itemId: entry.itemId,
      startTime: entry.startTime
    }));
    localStorage.setItem(STORAGE_KEYS.BASE_CALENDAR, JSON.stringify(calendarArray));
  } catch (error) {
    console.warn('Failed to save base calendar to localStorage:', error);
  }
}

export function saveItemInstancesToLocalStorage(itemInstances: Map<string, ItemInstanceImpl>): void {
  try {
    const instancesArray = Array.from(itemInstances.values()).map(instance => instance.toJSON());
    localStorage.setItem(STORAGE_KEYS.ITEM_INSTANCES, JSON.stringify(instancesArray));
  } catch (error) {
    console.warn('Failed to save item instances to localStorage:', error);
  }
}

export function saveAppSettingsToLocalStorage(settings: PersistedAppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save app settings to localStorage:', error);
  }
}

// Load functions
export function loadItemsFromLocalStorage(): Item[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!stored) return [];

    const itemsJSON: ItemJSON[] = JSON.parse(stored);
    return itemsJSON.map(json => ItemFactory.fromJSON(json));
  } catch (error) {
    console.warn('Failed to load items from localStorage:', error);
    return [];
  }
}

export function loadBaseCalendarFromLocalStorage(): Map<string, BaseCalendarEntry> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BASE_CALENDAR);
    if (!stored) return new Map();

    const calendarArray: PersistedBaseCalendarEntry[] = JSON.parse(stored);
    const baseCalendar = new Map<string, BaseCalendarEntry>();

    calendarArray.forEach(entry => {
      baseCalendar.set(entry.itemId, {
        id: entry.id,
        itemId: entry.itemId,
        startTime: entry.startTime
      });
    });

    return baseCalendar;
  } catch (error) {
    console.warn('Failed to load base calendar from localStorage:', error);
    return new Map();
  }
}

export function loadItemInstancesFromLocalStorage(): Map<string, ItemInstanceImpl> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ITEM_INSTANCES);
    if (!stored) return new Map();

    const instancesArray: ItemInstanceJSON[] = JSON.parse(stored);
    const itemInstances = new Map<string, ItemInstanceImpl>();

    instancesArray.forEach(json => {
      const instance = ItemInstanceImpl.fromJSON(json);
      itemInstances.set(instance.id, instance);
    });

    return itemInstances;
  } catch (error) {
    console.warn('Failed to load item instances from localStorage:', error);
    return new Map();
  }
}

export function loadAppSettingsFromLocalStorage(): PersistedAppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!stored) return {};

    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load app settings from localStorage:', error);
    return {};
  }
}

// Clear functions
export function clearAllPersistedData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear persisted data:', error);
  }
}
