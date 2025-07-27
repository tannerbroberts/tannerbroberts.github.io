import type { Item, ItemInstanceJSON, VariableJSON, VariableSummary } from '../functions/utils/item/index';

// Note: BaseCalendarEntry is imported from AppReducer since it's defined there
export interface BaseCalendarEntry {
  readonly id: string;
  readonly itemId: string;
  readonly startTime: number; // Milliseconds from Apple epoch
}

export interface StorageData {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  itemInstances?: Map<string, ItemInstanceJSON>;
  itemVariables?: Map<string, VariableJSON[]>;
  variableSummaryCache?: Map<string, VariableSummary>;
  version: string;
  timestamp: number;
}

export interface SerializedStorageData {
  items: unknown[];
  baseCalendar: Array<[string, BaseCalendarEntry]>;
  itemInstances?: Array<[string, ItemInstanceJSON]>;
  itemVariables?: Array<[string, VariableJSON[]]>;
  variableSummaryCache?: Array<[string, VariableSummary]>;
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
  instanceCount?: number;
  variableCount?: number;
  lastModified: number;
  version: string;
}
