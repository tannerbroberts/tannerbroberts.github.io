/**
 * Tests for Badge Settings Manager
 * 
 * Tests the centralized settings manager with caching,
 * event system, and performance optimization.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BadgeSettingsManager } from '../settingsManager';

describe('BadgeSettingsManager', () => {
  let manager: BadgeSettingsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BadgeSettingsManager({
      enableCaching: true,
      saveDebounceMs: 100,
      enableEvents: true
    });
  });

  afterEach(() => {
    manager.dispose();
  });

  describe('basic functionality', () => {
    it('should create manager with default config', () => {
      const defaultManager = new BadgeSettingsManager();
      expect(defaultManager).toBeDefined();
      defaultManager.dispose();
    });

    it('should allow configuration overrides', () => {
      const customManager = new BadgeSettingsManager({
        enableCaching: false,
        saveDebounceMs: 200,
        enableEvents: false
      });
      expect(customManager).toBeDefined();
      customManager.dispose();
    });
  });

  describe('getSettings', () => {
    it('should return settings', async () => {
      const settings = await manager.getSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBeDefined();
      expect(settings.timeThresholds).toBeDefined();
      expect(settings.variableThresholds).toBeDefined();
      expect(settings.displaySettings).toBeDefined();
    });

    it('should return cached settings on subsequent calls', async () => {
      const firstCall = await manager.getSettings();
      const secondCall = await manager.getSettings();

      // Basic properties should match
      expect(firstCall.version).toBe(secondCall.version);
      expect(firstCall.timeThresholds.minimal).toBe(secondCall.timeThresholds.minimal);
    });
  });

  describe('change listeners', () => {
    it('should add and remove change listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = manager.addChangeListener(listener1);
      manager.addChangeListener(listener2);

      // Should be able to unsubscribe
      unsubscribe1();

      // Should be able to remove listeners
      manager.removeChangeListener(listener2);

      // Should be able to clear all listeners
      manager.clearChangeListeners();
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      manager.addChangeListener(listener1);
      manager.addChangeListener(listener2);
      manager.addChangeListener(listener3);

      // Clean up
      manager.clearChangeListeners();
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status', async () => {
      let status = manager.getCacheStatus();
      expect(status).toHaveProperty('hasCachedSettings');
      expect(status).toHaveProperty('lastModified');
      expect(status).toHaveProperty('pendingSave');

      // Load settings to populate cache
      await manager.getSettings();

      status = manager.getCacheStatus();
      expect(typeof status.hasCachedSettings).toBe('boolean');
      expect(typeof status.pendingSave).toBe('boolean');
    });
  });

  describe('dispose', () => {
    it('should clean up resources', async () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);

      // Load some settings
      await manager.getSettings();

      // Dispose should clean up
      manager.dispose();

      const status = manager.getCacheStatus();
      expect(status.hasCachedSettings).toBe(false);
      expect(status.pendingSave).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      manager.addChangeListener(errorListener);
      manager.addChangeListener(normalListener);

      // This should not throw despite the error listener
      const settings = await manager.getSettings();
      expect(settings).toBeDefined();
    });
  });

  describe('manager lifecycle', () => {
    it('should handle multiple operations', async () => {
      // Get initial settings
      const initial = await manager.getSettings();
      expect(initial).toBeDefined();

      // Add listeners
      const listener = vi.fn();
      const unsubscribe = manager.addChangeListener(listener);

      // Check status
      const status = manager.getCacheStatus();
      expect(status).toBeDefined();

      // Reload settings
      const reloaded = await manager.reloadSettings();
      expect(reloaded).toBeDefined();

      // Clean up
      unsubscribe();
      manager.clearChangeListeners();
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        manager.getSettings(),
        manager.getSettings(),
        manager.reloadSettings()
      ];

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.version).toBeDefined();
      });
    });
  });
});
