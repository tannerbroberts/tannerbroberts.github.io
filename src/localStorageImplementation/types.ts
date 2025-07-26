import type { Item } from '../functions/utils/item/index';

// Note: BaseCalendarEntry is imported from AppReducer since it's defined there
export interface BaseCalendarEntry {
  readonly id: string;
  readonly itemId: string;
  readonly startTime: number; // Milliseconds from Apple epoch
}

export interface StorageData {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  version: string;
  timestamp: number;
}

export interface SerializedStorageData {
  items: unknown[];
  baseCalendar: Array<[string, BaseCalendarEntry]>;
  version: string;
  timestamp: number;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageMetadata {
  size: number;
  itemCount: number;
  calendarEntryCount: number;
  lastModified: number;
  version: string;
}
