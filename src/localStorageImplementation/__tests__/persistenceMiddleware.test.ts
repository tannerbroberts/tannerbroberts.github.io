import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PersistenceManager, persistenceManager } from '../persistenceMiddleware';
import * as storageService from '../localStorageService';
import { BasicItem, Item } from '../../functions/utils/item/index';
import { BaseCalendarEntry } from '../../functions/reducers/AppReducer';

// Mock the storage service
vi.mock('../localStorageService', () => ({
  saveAllDataToStorage: vi.fn()
}));

describe('Persistence Middleware', () => {
  let manager: PersistenceManager;
  let mockItems: Item[];
  let mockBaseCalendar: Map<string, BaseCalendarEntry>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storageService, 'saveAllDataToStorage').mockReturnValue({ success: true });

    manager = new PersistenceManager();
    mockItems = [new BasicItem({ name: 'Test Item', duration: 1000 })];
    mockBaseCalendar = new Map();

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('PersistenceManager', () => {
    it('should queue persistence and debounce rapid calls', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Queue multiple persistence calls
      manager.queuePersistence(mockItems, mockBaseCalendar);
      manager.queuePersistence(mockItems, mockBaseCalendar);
      manager.queuePersistence(mockItems, mockBaseCalendar);

      // Storage should not be called yet
      expect(storageService.saveAllDataToStorage).not.toHaveBeenCalled();

      // Fast-forward time past debounce period
      vi.advanceTimersByTime(500);

      // Now storage should be called once
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledTimes(1);
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledWith(mockItems, mockBaseCalendar);

      consoleSpy.mockRestore();
    });

    it('should handle storage failures gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      vi.mocked(storageService.saveAllDataToStorage).mockReturnValue({
        success: false,
        error: 'Storage failed'
      });

      manager.queuePersistence(mockItems, mockBaseCalendar);

      // Fast-forward time past debounce period
      vi.advanceTimersByTime(500);

      // Should log error but not throw
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save data to storage:',
        'Storage failed'
      );

      consoleSpy.mockRestore();
    });

    it('should flush immediately when requested', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      manager.queuePersistence(mockItems, mockBaseCalendar);

      // Flush immediately
      await manager.flush();

      // Storage should be called immediately
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should clear queued operations when requested', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      manager.queuePersistence(mockItems, mockBaseCalendar);
      manager.clear();

      // Fast-forward time past debounce period
      vi.advanceTimersByTime(500);

      // Storage should not be called
      expect(storageService.saveAllDataToStorage).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should cancel previous timeout when new persistence is queued', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Queue first persistence
      manager.queuePersistence(mockItems, mockBaseCalendar);

      // Advance time partially
      vi.advanceTimersByTime(250);

      // Queue another persistence (should cancel the first)
      const newItems = [new BasicItem({ name: 'New Item', duration: 2000 })];
      manager.queuePersistence(newItems, mockBaseCalendar);

      // Advance time to complete the debounce period
      vi.advanceTimersByTime(500);

      // Should be called only once, with the latest data
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledTimes(1);
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledWith(newItems, mockBaseCalendar);

      consoleSpy.mockRestore();
    });
  });

  describe('Singleton persistence manager', () => {
    it('should provide the same instance', () => {
      expect(persistenceManager).toBeDefined();
      expect(persistenceManager).toBe(persistenceManager);
    });
  });

  describe('Convenience functions', () => {
    it('should export convenience functions that work with singleton', async () => {
      const { queuePersistence, flushPersistence, clearPersistence } = await import('../persistenceMiddleware');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Test queuePersistence
      queuePersistence(mockItems, mockBaseCalendar);
      vi.advanceTimersByTime(500);
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledWith(mockItems, mockBaseCalendar);

      vi.clearAllMocks();

      // Test flushPersistence
      queuePersistence(mockItems, mockBaseCalendar);
      await flushPersistence();
      expect(storageService.saveAllDataToStorage).toHaveBeenCalledWith(mockItems, mockBaseCalendar);

      vi.clearAllMocks();

      // Test clearPersistence
      queuePersistence(mockItems, mockBaseCalendar);
      clearPersistence();
      vi.advanceTimersByTime(500);
      expect(storageService.saveAllDataToStorage).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
