import { saveAllDataToStorage } from './localStorageService';
import { Item } from '../functions/utils/item/index';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';

interface PersistenceQueue {
  items: Item[] | null;
  baseCalendar: Map<string, BaseCalendarEntry> | null;
  timeoutId: number | null;
}

/**
 * Manages persistence of data to localStorage with debouncing and error handling
 */
export class PersistenceManager {
  private readonly queue: PersistenceQueue = {
    items: null,
    baseCalendar: null,
    timeoutId: null
  };

  private readonly debounceMs: number = 500;

  /**
   * Queues data for persistence with debouncing
   * @param items - Current items array
   * @param baseCalendar - Current base calendar map
   */
  public queuePersistence(items: Item[], baseCalendar: Map<string, BaseCalendarEntry>): void {
    // Store the latest data
    this.queue.items = items;
    this.queue.baseCalendar = baseCalendar;

    // Cancel any existing timeout
    if (this.queue.timeoutId !== null) {
      clearTimeout(this.queue.timeoutId);
    }

    // Set new timeout for debounced persistence
    this.queue.timeoutId = window.setTimeout(() => {
      this.persistData().catch(error => {
        console.error('Failed to persist data:', error);
        // Don't throw - just log the error to avoid breaking the app
      });
    }, this.debounceMs);
  }

  /**
   * Immediately flushes any queued persistence operations
   * @returns Promise that resolves when persistence is complete
   */
  public async flush(): Promise<void> {
    if (this.queue.timeoutId !== null) {
      clearTimeout(this.queue.timeoutId);
      this.queue.timeoutId = null;
    }

    if (this.queue.items !== null && this.queue.baseCalendar !== null) {
      await this.persistData();
    }
  }

  /**
   * Clears any queued persistence operations without saving
   */
  public clear(): void {
    if (this.queue.timeoutId !== null) {
      clearTimeout(this.queue.timeoutId);
      this.queue.timeoutId = null;
    }

    this.queue.items = null;
    this.queue.baseCalendar = null;
  }

  /**
   * Performs the actual persistence operation
   * @private
   */
  private async persistData(): Promise<void> {
    const { items, baseCalendar } = this.queue;

    if (items === null || baseCalendar === null) {
      return;
    }

    // Clear the queue first
    this.queue.items = null;
    this.queue.baseCalendar = null;
    this.queue.timeoutId = null;

    // Use requestIdleCallback if available for better performance
    const persistOperation = () => {
      const result = saveAllDataToStorage(items, baseCalendar);
      if (!result.success) {
        console.error('Failed to save data to storage:', result.error);
        // Log but don't throw - app should continue working
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(persistOperation, { timeout: 1000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      persistOperation();
    }
  }
}

/**
 * Singleton instance of the persistence manager
 */
export const persistenceManager = new PersistenceManager();

/**
 * Convenience function for queueing persistence
 * @param items - Current items array
 * @param baseCalendar - Current base calendar map
 */
export function queuePersistence(items: Item[], baseCalendar: Map<string, BaseCalendarEntry>): void {
  persistenceManager.queuePersistence(items, baseCalendar);
}

/**
 * Convenience function for immediate persistence flush
 * @returns Promise that resolves when persistence is complete
 */
export function flushPersistence(): Promise<void> {
  return persistenceManager.flush();
}

/**
 * Convenience function for clearing queued persistence
 */
export function clearPersistence(): void {
  persistenceManager.clear();
}
