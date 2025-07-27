import { describe, it, expect, beforeEach, vi } from 'vitest';
import { featureFlags, FeatureFlagManager } from '../integration/featureFlags';
import { checkMigrationStatus } from '../integration/migrationService';

describe('Storage System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    featureFlags.clearAllOverrides();
    localStorage.clear();
  });

  describe('Feature Flags', () => {
    it('should respect feature flag settings', () => {
      featureFlags.setOverride('enableLocalStorage', true);
      expect(featureFlags.isEnabled('enableLocalStorage')).toBe(true);

      featureFlags.setOverride('enableLocalStorage', false);
      expect(featureFlags.isEnabled('enableLocalStorage')).toBe(false);
    });

    it('should persist feature flag overrides', () => {
      featureFlags.setOverride('enableLocalStorage', true);
      featureFlags.saveOverrides();

      // Create new instance to test persistence
      const newFlags = new FeatureFlagManager();
      expect(newFlags.isEnabled('enableLocalStorage')).toBe(true);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => {
        featureFlags.setOverride('enableLocalStorage', true);
        featureFlags.saveOverrides();
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('should return default values for unknown flags', () => {
      expect(featureFlags.isEnabled('enableLocalStorage')).toBe(false); // Default is false
      expect(featureFlags.isEnabled('enableDataValidation')).toBe(true); // Default is true
    });

    it('should clear all overrides', () => {
      featureFlags.setOverride('enableLocalStorage', true);
      featureFlags.setOverride('enableAutoMigration', true);

      featureFlags.clearAllOverrides();

      expect(featureFlags.isEnabled('enableLocalStorage')).toBe(false); // Back to default
    });
  });

  describe('Migration Status', () => {
    it('should detect migration needed when no metadata exists', async () => {
      localStorage.clear();

      const status = await checkMigrationStatus();
      expect(status.needsMigration).toBe(true);
      expect(status.currentVersion).toBe('0.0.0');
      expect(status.targetVersion).toBe('1.0.0');
    });

    it('should detect no migration needed when metadata exists', async () => {
      localStorage.setItem('atp-metadata', JSON.stringify({ version: '1.0.0' }));

      const status = await checkMigrationStatus();
      expect(status.needsMigration).toBe(false);
      expect(status.currentVersion).toBe('1.0.0');
      expect(status.targetVersion).toBe('1.0.0');
    });

    it('should handle corrupted metadata gracefully', async () => {
      localStorage.setItem('atp-metadata', 'invalid json');

      const status = await checkMigrationStatus();
      expect(status.needsMigration).toBe(true);
      expect(status.currentVersion).toBe('0.0.0');
      expect(status.targetVersion).toBe('1.0.0');
    });
  });

  describe('Integration Components', () => {
    it('should export all necessary components and functions', () => {
      // Test that imports work
      expect(featureFlags).toBeDefined();
      expect(FeatureFlagManager).toBeDefined();
      expect(checkMigrationStatus).toBeDefined();

      // Test that main functions exist
      expect(typeof featureFlags.isEnabled).toBe('function');
      expect(typeof featureFlags.setOverride).toBe('function');
      expect(typeof checkMigrationStatus).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle storage availability gracefully', () => {
      // Mock localStorage to be unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      expect(() => {
        const flags = new FeatureFlagManager();
        flags.setOverride('test', true);
      }).not.toThrow();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    it('should validate feature flag types', () => {
      featureFlags.setOverride('enableLocalStorage', true);
      expect(typeof featureFlags.isEnabled('enableLocalStorage')).toBe('boolean');

      featureFlags.setOverride('storageSystemVersion', '1.0.0');
      expect(typeof featureFlags.getString('storageSystemVersion')).toBe('string');
    });
  });
});
