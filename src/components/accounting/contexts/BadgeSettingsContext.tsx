/**
 * Badge Settings React Context
 * 
 * Provides React context for badge settings state management
 * with hooks for accessing and updating settings.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { BadgeSettings } from '../types/badgeSettings';
import { badgeSettingsManager, type BadgeSettingsChangeListener } from '../storage/settingsManager';
import { getDefaultBadgeSettings } from '../storage/badgeSettingsStorage';

/**
 * Badge settings context value interface
 */
export interface BadgeSettingsContextValue {
  /** Current badge settings */
  settings: BadgeSettings;
  /** Whether settings are currently loading */
  isLoading: boolean;
  /** Error message if settings failed to load */
  error: string | null;
  /** Updates badge settings */
  updateSettings: (settings: BadgeSettings) => Promise<void>;
  /** Updates partial badge settings */
  updatePartialSettings: (partialSettings: Partial<BadgeSettings>) => Promise<void>;
  /** Resets settings to defaults */
  resetToDefaults: () => Promise<void>;
  /** Reloads settings from storage */
  reloadSettings: () => Promise<void>;
}

/**
 * Badge settings context
 */
const BadgeSettingsContext = createContext<BadgeSettingsContextValue | null>(null);

/**
 * Props for BadgeSettingsProvider
 */
export interface BadgeSettingsProviderProps {
  readonly children: ReactNode;
  /** Whether to load settings automatically on mount (default: true) */
  readonly autoLoad?: boolean;
  /** Fallback settings if loading fails (default: uses defaults) */
  readonly fallbackSettings?: BadgeSettings;
}

/**
 * Badge settings provider component
 */
export function BadgeSettingsProvider({
  children,
  autoLoad = true,
  fallbackSettings
}: BadgeSettingsProviderProps): React.JSX.Element {
  const [settings, setSettings] = useState<BadgeSettings>(fallbackSettings || getDefaultBadgeSettings());
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    if (!autoLoad) return;

    let mounted = true;

    const loadInitialSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const initialSettings = await badgeSettingsManager.getSettings();

        if (mounted) {
          setSettings(initialSettings);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load badge settings';
          setError(errorMessage);
          console.error('Failed to load initial badge settings:', err);

          // Use fallback settings if provided, otherwise use defaults
          setSettings(fallbackSettings || getDefaultBadgeSettings());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialSettings();

    return () => {
      mounted = false;
    };
  }, [autoLoad, fallbackSettings]);

  // Set up change listener
  useEffect(() => {
    const handleSettingsChange: BadgeSettingsChangeListener = (newSettings) => {
      setSettings(newSettings);
      setError(null); // Clear any previous errors on successful update
    };

    const unsubscribe = badgeSettingsManager.addChangeListener(handleSettingsChange);

    return unsubscribe;
  }, []);

  // Update settings function
  const updateSettings = useCallback(async (newSettings: BadgeSettings) => {
    try {
      setError(null);
      await badgeSettingsManager.updateSettings(newSettings);
      // Settings will be updated via the change listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update badge settings';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  // Update partial settings function
  const updatePartialSettings = useCallback(async (partialSettings: Partial<BadgeSettings>) => {
    try {
      setError(null);
      await badgeSettingsManager.updatePartialSettings(partialSettings);
      // Settings will be updated via the change listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update badge settings';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  // Reset to defaults function
  const resetToDefaults = useCallback(async () => {
    try {
      setError(null);
      await badgeSettingsManager.resetToDefaults();
      // Settings will be updated via the change listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset badge settings';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  // Reload settings function
  const reloadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const reloadedSettings = await badgeSettingsManager.reloadSettings();
      setSettings(reloadedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reload badge settings';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue: BadgeSettingsContextValue = useMemo(() => ({
    settings,
    isLoading,
    error,
    updateSettings,
    updatePartialSettings,
    resetToDefaults,
    reloadSettings
  }), [settings, isLoading, error, updateSettings, updatePartialSettings, resetToDefaults, reloadSettings]);

  return (
    <BadgeSettingsContext.Provider value={contextValue}>
      {children}
    </BadgeSettingsContext.Provider>
  );
}

/**
 * Hook to access badge settings context
 * @returns Badge settings context value
 * @throws Error if used outside of BadgeSettingsProvider
 */
export function useBadgeSettings(): BadgeSettingsContextValue {
  const context = useContext(BadgeSettingsContext);

  if (!context) {
    throw new Error('useBadgeSettings must be used within a BadgeSettingsProvider');
  }

  return context;
}
