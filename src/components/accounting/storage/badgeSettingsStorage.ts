/**
 * Badge Settings Storage Utilities
 * 
 * Handles persistence and retrieval of badge threshold preferences
 * in localStorage with validation and error handling.
 */

import type { BadgeSettings } from '../types/badgeSettings';
import {
  DEFAULT_BADGE_SETTINGS,
  validateBadgeSettings,
  mergeWithDefaults
} from '../types/badgeSettings';
import type { StorageResult } from '../../../localStorageImplementation/types';
import { STORAGE_KEYS } from '../../../localStorageImplementation/constants';

/**
 * Storage key for badge settings in localStorage
 */
const BADGE_SETTINGS_KEY = STORAGE_KEYS.BADGE_SETTINGS;

/**
 * Current badge settings schema version
 */
const CURRENT_BADGE_SETTINGS_VERSION = '1.0.0';

/**
 * Saves badge settings to localStorage
 * @param settings - Badge settings to save
 * @returns StorageResult indicating success/failure
 */
export function saveBadgeSettings(settings: BadgeSettings): StorageResult<void> {
  try {
    // Validate settings before saving
    const validation = validateBadgeSettings(settings);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid settings: ${validation.errors.join(', ')}`
      };
    }

    // Ensure settings have current version and timestamp
    const settingsToSave: BadgeSettings = {
      ...settings,
      version: CURRENT_BADGE_SETTINGS_VERSION,
      lastModified: Date.now()
    };

    const jsonString = JSON.stringify(settingsToSave);
    localStorage.setItem(BADGE_SETTINGS_KEY, jsonString);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Unable to save badge settings.'
        };
      }
      return {
        success: false,
        error: `Failed to save badge settings: ${error.message}`
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while saving badge settings'
    };
  }
}

/**
 * Loads badge settings from localStorage
 * @returns StorageResult with badge settings or error
 */
export function loadBadgeSettings(): StorageResult<BadgeSettings> {
  try {
    const storedData = localStorage.getItem(BADGE_SETTINGS_KEY);

    if (!storedData) {
      // No settings stored yet - return defaults
      return {
        success: true,
        data: getDefaultBadgeSettings()
      };
    }

    const parsedData = JSON.parse(storedData);

    // First merge with defaults to handle partial settings
    const mergedSettings = mergeWithDefaults(parsedData);

    // Then validate the complete merged settings
    const validation = validateBadgeSettings(mergedSettings);
    if (!validation.isValid) {
      console.warn('Invalid badge settings in storage, using defaults:', validation.errors);
      return {
        success: true,
        data: getDefaultBadgeSettings()
      };
    }

    return {
      success: true,
      data: mergedSettings
    };
  } catch (error) {
    console.warn('Failed to load badge settings, using defaults:', error);
    return {
      success: true,
      data: getDefaultBadgeSettings()
    };
  }
}

/**
 * Gets default badge settings
 * @returns Default badge settings configuration
 */
export function getDefaultBadgeSettings(): BadgeSettings {
  return {
    ...DEFAULT_BADGE_SETTINGS,
    lastModified: Date.now()
  };
}

/**
 * Validates badge settings data integrity
 * @param settings - Settings to validate
 * @returns Validation result with errors and warnings
 */
export function validateBadgeSettingsData(settings: unknown): { isValid: boolean; errors: string[]; warnings: string[] } {
  return validateBadgeSettings(settings);
}

/**
 * Migrates badge settings to current schema version
 * @param settings - Settings to migrate
 * @returns Migrated settings or null if migration failed
 */
export function migrateBadgeSettings(settings: unknown): BadgeSettings | null {
  try {
    if (!settings || typeof settings !== 'object') {
      return null;
    }

    const s = settings as Partial<BadgeSettings>;

    // For now, we only have version 1.0.0, so no migration needed
    // Future versions would implement migration logic here

    // First merge with defaults to create a complete settings object
    const mergedSettings = mergeWithDefaults(s);

    // Then validate the complete settings
    const validation = validateBadgeSettings(mergedSettings);
    if (!validation.isValid) {
      console.warn('Cannot migrate invalid badge settings:', validation.errors);
      return null;
    }

    return mergedSettings;
  } catch (error) {
    console.error('Error migrating badge settings:', error);
    return null;
  }
}

/**
 * Checks if badge settings exist in storage
 * @returns True if settings exist, false otherwise
 */
export function badgeSettingsExist(): boolean {
  try {
    return localStorage.getItem(BADGE_SETTINGS_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Clears badge settings from storage
 * @returns StorageResult indicating success/failure
 */
export function clearBadgeSettings(): StorageResult<void> {
  try {
    localStorage.removeItem(BADGE_SETTINGS_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear badge settings'
    };
  }
}

/**
 * Gets badge settings storage metadata
 * @returns Metadata about stored badge settings
 */
export function getBadgeSettingsMetadata(): {
  exists: boolean;
  size: number;
  version: string | null;
  lastModified: number | null;
} {
  try {
    const storedData = localStorage.getItem(BADGE_SETTINGS_KEY);

    if (!storedData) {
      return {
        exists: false,
        size: 0,
        version: null,
        lastModified: null
      };
    }

    const parsedData = JSON.parse(storedData);

    return {
      exists: true,
      size: storedData.length,
      version: parsedData.version || null,
      lastModified: parsedData.lastModified || null
    };
  } catch {
    return {
      exists: false,
      size: 0,
      version: null,
      lastModified: null
    };
  }
}
