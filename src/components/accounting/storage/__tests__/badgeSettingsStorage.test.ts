/**
 * Tests for Badge Settings Storage
 * 
 * Tests save, load, validation, and migration functionality
 * for badge threshold preferences storage system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveBadgeSettings,
  loadBadgeSettings,
  getDefaultBadgeSettings,
  validateBadgeSettingsData,
  migrateBadgeSettings,
  badgeSettingsExist,
  clearBadgeSettings,
  getBadgeSettingsMetadata
} from '../badgeSettingsStorage';
import type { BadgeSettings } from '../../types/badgeSettings';
import { DEFAULT_BADGE_SETTINGS } from '../../types/badgeSettings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn()
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Badge Settings Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Reset mock implementations to default behavior
    const store: Record<string, string> = {};
    localStorageMock.getItem.mockImplementation((key: string) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete store[key];
    });
    localStorageMock.clear.mockImplementation(() => {
      Object.keys(store).forEach(key => delete store[key]);
    });
  });

  describe('saveBadgeSettings', () => {
    it('should save valid badge settings successfully', () => {
      const settings = getDefaultBadgeSettings();
      const result = saveBadgeSettings(settings);

      expect(result.success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'atp_badge_settings',
        expect.any(String)
      );
    });

    it('should reject invalid badge settings', () => {
      const invalidSettings = {
        timeThresholds: {
          minimal: -1, // Invalid negative value
          significant: 30 * 60 * 1000,
          critical: 2 * 60 * 60 * 1000
        }
      } as BadgeSettings;

      const result = saveBadgeSettings(invalidSettings);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid settings');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage quota exceeded error', () => {
      const settings = getDefaultBadgeSettings();
      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = saveBadgeSettings(settings);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage quota exceeded');
    });

    it('should update version and timestamp when saving', () => {
      const settings = getDefaultBadgeSettings();
      const originalTimestamp = settings.lastModified;

      // Wait a bit to ensure timestamp changes
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);

      saveBadgeSettings(settings);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.version).toBe('1.0.0');
      expect(savedData.lastModified).toBeGreaterThan(originalTimestamp);

      vi.useRealTimers();
    });
  });

  describe('loadBadgeSettings', () => {
    it('should return default settings when no data is stored', () => {
      const result = loadBadgeSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        timeThresholds: DEFAULT_BADGE_SETTINGS.timeThresholds,
        variableThresholds: DEFAULT_BADGE_SETTINGS.variableThresholds,
        displaySettings: DEFAULT_BADGE_SETTINGS.displaySettings
      }));
    });

    it('should load valid stored settings', () => {
      const settings = {
        ...getDefaultBadgeSettings(),
        timeThresholds: {
          ...getDefaultBadgeSettings().timeThresholds,
          minimal: 10 * 60 * 1000 // 10 minutes
        }
      };

      saveBadgeSettings(settings);
      const result = loadBadgeSettings();

      expect(result.success).toBe(true);
      expect(result.data?.timeThresholds.minimal).toBe(10 * 60 * 1000);
    });

    it('should return defaults when stored data is invalid', () => {
      localStorageMock.setItem('atp_badge_settings', JSON.stringify({
        timeThresholds: {
          minimal: 'invalid' // Invalid type
        }
      }));

      const result = loadBadgeSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        timeThresholds: DEFAULT_BADGE_SETTINGS.timeThresholds,
        variableThresholds: DEFAULT_BADGE_SETTINGS.variableThresholds,
        displaySettings: DEFAULT_BADGE_SETTINGS.displaySettings,
        version: DEFAULT_BADGE_SETTINGS.version
      }));
      expect(result.data?.lastModified).toBeTypeOf('number');
      expect(result.data?.lastModified).toBeGreaterThan(0);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.setItem('atp_badge_settings', 'invalid json');

      const result = loadBadgeSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        timeThresholds: DEFAULT_BADGE_SETTINGS.timeThresholds,
        variableThresholds: DEFAULT_BADGE_SETTINGS.variableThresholds,
        displaySettings: DEFAULT_BADGE_SETTINGS.displaySettings,
        version: DEFAULT_BADGE_SETTINGS.version
      }));
      expect(result.data?.lastModified).toBeTypeOf('number');
      expect(result.data?.lastModified).toBeGreaterThan(0);
    });

    it('should merge loaded settings with defaults', () => {
      // Save partial settings
      localStorageMock.setItem('atp_badge_settings', JSON.stringify({
        timeThresholds: {
          minimal: 15 * 60 * 1000 // Only set minimal
        }
      }));

      const result = loadBadgeSettings();

      expect(result.success).toBe(true);
      expect(result.data?.timeThresholds.minimal).toBe(15 * 60 * 1000);
      expect(result.data?.timeThresholds.significant).toBe(DEFAULT_BADGE_SETTINGS.timeThresholds.significant);
      expect(result.data?.displaySettings).toEqual(DEFAULT_BADGE_SETTINGS.displaySettings);
    });
  });

  describe('validateBadgeSettingsData', () => {
    it('should validate correct settings', () => {
      const settings = getDefaultBadgeSettings();
      const result = validateBadgeSettingsData(settings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object settings', () => {
      const result = validateBadgeSettingsData('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Settings must be an object');
    });

    it('should validate time thresholds', () => {
      const settings = {
        timeThresholds: {
          minimal: -1,
          significant: 'invalid',
          critical: 2 * 60 * 60 * 1000
        }
      };

      const result = validateBadgeSettingsData(settings);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timeThresholds.minimal must be a non-negative number');
      expect(result.errors).toContain('timeThresholds.significant must be a non-negative number');
    });

    it('should provide warnings for threshold ordering', () => {
      const settings = {
        timeThresholds: {
          minimal: 60 * 60 * 1000, // 1 hour
          significant: 30 * 60 * 1000, // 30 minutes (should be greater than minimal)
          critical: 2 * 60 * 60 * 1000
        }
      };

      const result = validateBadgeSettingsData(settings);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('minimal threshold should be less than significant threshold');
    });
  });

  describe('migrateBadgeSettings', () => {
    it('should migrate valid settings', () => {
      const settings = {
        timeThresholds: {
          minimal: 10 * 60 * 1000
        }
      };

      const result = migrateBadgeSettings(settings);

      expect(result).not.toBeNull();
      expect(result?.timeThresholds.minimal).toBe(10 * 60 * 1000);
      expect(result?.timeThresholds.significant).toBe(DEFAULT_BADGE_SETTINGS.timeThresholds.significant);
    });

    it('should return null for invalid settings', () => {
      const result = migrateBadgeSettings('invalid');

      expect(result).toBeNull();
    });

    it('should return null for settings with validation errors', () => {
      const settings = {
        timeThresholds: {
          minimal: -1
        }
      };

      const result = migrateBadgeSettings(settings);

      expect(result).toBeNull();
    });
  });

  describe('badgeSettingsExist', () => {
    it('should return false when no settings are stored', () => {
      expect(badgeSettingsExist()).toBe(false);
    });

    it('should return true when settings are stored', () => {
      localStorageMock.setItem('atp_badge_settings', '{}');
      expect(badgeSettingsExist()).toBe(true);
    });

    it('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(badgeSettingsExist()).toBe(false);
    });
  });

  describe('clearBadgeSettings', () => {
    it('should clear stored settings', () => {
      localStorageMock.setItem('atp_badge_settings', '{}');

      const result = clearBadgeSettings();

      expect(result.success).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('atp_badge_settings');
    });

    it('should handle localStorage errors when clearing', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove error');
      });

      const result = clearBadgeSettings();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Remove error');
    });
  });

  describe('getBadgeSettingsMetadata', () => {
    it('should return metadata for existing settings', () => {
      const settings = getDefaultBadgeSettings();
      saveBadgeSettings(settings);

      const metadata = getBadgeSettingsMetadata();

      expect(metadata.exists).toBe(true);
      expect(metadata.size).toBeGreaterThan(0);
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.lastModified).toBeGreaterThan(0);
    });

    it('should return empty metadata when no settings exist', () => {
      const metadata = getBadgeSettingsMetadata();

      expect(metadata.exists).toBe(false);
      expect(metadata.size).toBe(0);
      expect(metadata.version).toBeNull();
      expect(metadata.lastModified).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('atp_badge_settings', 'invalid json');

      const metadata = getBadgeSettingsMetadata();

      expect(metadata.exists).toBe(false);
      expect(metadata.size).toBe(0);
    });
  });

  describe('getDefaultBadgeSettings', () => {
    it('should return valid default settings', () => {
      const defaults = getDefaultBadgeSettings();

      expect(defaults.timeThresholds.minimal).toBe(5 * 60 * 1000);
      expect(defaults.timeThresholds.significant).toBe(30 * 60 * 1000);
      expect(defaults.timeThresholds.critical).toBe(2 * 60 * 60 * 1000);
      expect(defaults.variableThresholds.defaultMinimum).toBe(3);
      expect(defaults.displaySettings.showTimeBadge).toBe(true);
      expect(defaults.displaySettings.showVariableBadge).toBe(true);
      expect(defaults.version).toBe('1.0.0');
    });

    it('should set current timestamp for lastModified', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      const defaults = getDefaultBadgeSettings();

      expect(defaults.lastModified).toBe(now);

      vi.useRealTimers();
    });
  });
});
