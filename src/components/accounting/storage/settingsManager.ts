/**
 * Badge Settings Manager
 * 
 * Centralized settings management with caching, event system,
 * and performance optimization for badge threshold preferences.
 */

import type { BadgeSettings } from '../types/badgeSettings';
import {
  saveBadgeSettings,
  loadBadgeSettings,
  getDefaultBadgeSettings,
  validateBadgeSettingsData
} from './badgeSettingsStorage';
import { mergeWithDefaults } from '../types/badgeSettings';

/**
 * Event listener type for settings changes
 */
export type BadgeSettingsChangeListener = (settings: BadgeSettings) => void;

/**
 * Settings manager configuration
 */
export interface BadgeSettingsManagerConfig {
  /** Whether to enable caching (default: true) */
  enableCaching: boolean;
  /** Debounce delay for save operations in milliseconds (default: 500) */
  saveDebounceMs: number;
  /** Whether to enable event notifications (default: true) */
  enableEvents: boolean;
}

/**
 * Default configuration for the settings manager
 */
const DEFAULT_CONFIG: BadgeSettingsManagerConfig = {
  enableCaching: true,
  saveDebounceMs: 500,
  enableEvents: true
};

/**
 * Centralized badge settings manager with caching and event handling
 */
export class BadgeSettingsManager {
  private readonly config: BadgeSettingsManagerConfig;
  private cachedSettings: BadgeSettings | null = null;
  private readonly changeListeners: Set<BadgeSettingsChangeListener> = new Set();
  private saveTimeoutId: number | null = null;
  private isLoading = false;

  constructor(config: Partial<BadgeSettingsManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Gets current badge settings, loading from storage if necessary
   * @returns Promise resolving to current badge settings
   */
  public async getSettings(): Promise<BadgeSettings> {
    // Return cached settings if available and caching is enabled
    if (this.config.enableCaching && this.cachedSettings) {
      return this.cachedSettings;
    }

    // Prevent concurrent loading
    if (this.isLoading) {
      // Wait for current load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.cachedSettings || getDefaultBadgeSettings();
    }

    this.isLoading = true;

    try {
      const result = loadBadgeSettings();
      const settings = result.success ? result.data! : getDefaultBadgeSettings();

      if (this.config.enableCaching) {
        this.cachedSettings = settings;
      }

      return settings;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Updates badge settings with debounced save
   * @param settings - New settings to apply
   * @returns Promise resolving when settings are updated
   */
  public async updateSettings(settings: BadgeSettings): Promise<void> {
    // Validate settings before updating
    const validation = validateBadgeSettingsData(settings);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
    }

    // Merge with current settings to ensure completeness
    const currentSettings = await this.getSettings();
    const mergedSettings = mergeWithDefaults({
      ...currentSettings,
      ...settings,
      lastModified: Date.now()
    });

    // Update cache immediately
    if (this.config.enableCaching) {
      this.cachedSettings = mergedSettings;
    }

    // Notify listeners immediately
    if (this.config.enableEvents) {
      this.notifyListeners(mergedSettings);
    }

    // Debounce save operation
    this.debouncedSave(mergedSettings);
  }

  /**
   * Partially updates badge settings by merging with current settings
   * @param partialSettings - Partial settings to merge
   * @returns Promise resolving when settings are updated
   */
  public async updatePartialSettings(partialSettings: Partial<BadgeSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = mergeWithDefaults({
      ...currentSettings,
      ...partialSettings,
      lastModified: Date.now()
    });

    await this.updateSettings(updatedSettings);
  }

  /**
   * Resets settings to defaults
   * @returns Promise resolving when settings are reset
   */
  public async resetToDefaults(): Promise<void> {
    const defaultSettings = getDefaultBadgeSettings();
    await this.updateSettings(defaultSettings);
  }

  /**
   * Adds a change listener for settings updates
   * @param listener - Function to call when settings change
   * @returns Function to remove the listener
   */
  public addChangeListener(listener: BadgeSettingsChangeListener): () => void {
    this.changeListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Removes a change listener
   * @param listener - Listener function to remove
   */
  public removeChangeListener(listener: BadgeSettingsChangeListener): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Clears all change listeners
   */
  public clearChangeListeners(): void {
    this.changeListeners.clear();
  }

  /**
   * Forces a reload of settings from storage
   * @returns Promise resolving to reloaded settings
   */
  public async reloadSettings(): Promise<BadgeSettings> {
    this.cachedSettings = null;
    return this.getSettings();
  }

  /**
   * Immediately saves current settings without debouncing
   * @returns Promise resolving when save is complete
   */
  public async flushSave(): Promise<void> {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }

    if (this.cachedSettings) {
      const result = saveBadgeSettings(this.cachedSettings);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }
    }
  }

  /**
   * Gets current cache status
   * @returns Cache information
   */
  public getCacheStatus(): {
    hasCachedSettings: boolean;
    lastModified: number | null;
    pendingSave: boolean;
  } {
    return {
      hasCachedSettings: this.cachedSettings !== null,
      lastModified: this.cachedSettings?.lastModified || null,
      pendingSave: this.saveTimeoutId !== null
    };
  }

  /**
   * Disposes of the manager and cleans up resources
   */
  public dispose(): void {
    this.clearChangeListeners();
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }
    this.cachedSettings = null;
  }

  /**
   * Debounces save operations to avoid excessive storage writes
   * @private
   */
  private debouncedSave(settings: BadgeSettings): void {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = window.setTimeout(() => {
      this.saveTimeoutId = null;
      const result = saveBadgeSettings(settings);
      if (!result.success) {
        console.error('Failed to save badge settings:', result.error);
      }
    }, this.config.saveDebounceMs);
  }

  /**
   * Notifies all change listeners of settings update
   * @private
   */
  private notifyListeners(settings: BadgeSettings): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(settings);
      } catch (error) {
        console.error('Error in badge settings change listener:', error);
      }
    });
  }
}

/**
 * Singleton instance of the badge settings manager
 */
export const badgeSettingsManager = new BadgeSettingsManager();

/**
 * Convenience functions for common operations
 */

/**
 * Gets current badge settings using the singleton manager
 */
export function getCurrentBadgeSettings(): Promise<BadgeSettings> {
  return badgeSettingsManager.getSettings();
}

/**
 * Updates badge settings using the singleton manager
 */
export function updateCurrentBadgeSettings(settings: BadgeSettings): Promise<void> {
  return badgeSettingsManager.updateSettings(settings);
}

/**
 * Adds a change listener using the singleton manager
 */
export function onBadgeSettingsChange(listener: BadgeSettingsChangeListener): () => void {
  return badgeSettingsManager.addChangeListener(listener);
}
