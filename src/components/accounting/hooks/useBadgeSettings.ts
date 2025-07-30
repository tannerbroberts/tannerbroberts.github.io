/**
 * Badge Settings Hooks
 * 
 * Additional React hooks for accessing badge settings context
 * in more specific ways.
 */

import type { BadgeSettings } from '../types/badgeSettings';
import { useBadgeSettings } from '../contexts/BadgeSettingsContext';

/**
 * Hook to access only the current badge settings (without loading states)
 * @returns Current badge settings
 */
export function useBadgeSettingsValue(): BadgeSettings {
  const { settings } = useBadgeSettings();
  return settings;
}

/**
 * Hook to access badge settings update functions
 * @returns Settings update functions
 */
export function useBadgeSettingsActions(): {
  updateSettings: (settings: BadgeSettings) => Promise<void>;
  updatePartialSettings: (partialSettings: Partial<BadgeSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  reloadSettings: () => Promise<void>;
} {
  const { updateSettings, updatePartialSettings, resetToDefaults, reloadSettings } = useBadgeSettings();

  return {
    updateSettings,
    updatePartialSettings,
    resetToDefaults,
    reloadSettings
  };
}

/**
 * Hook to check if badge settings are loading
 * @returns Loading state and error information
 */
export function useBadgeSettingsStatus(): {
  isLoading: boolean;
  error: string | null;
  hasError: boolean;
} {
  const { isLoading, error } = useBadgeSettings();

  return {
    isLoading,
    error,
    hasError: error !== null
  };
}
