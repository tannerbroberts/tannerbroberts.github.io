/**
 * Tests for Badge Settings React Context
 * 
 * Tests the React context provider and hooks for badge settings
 * state management and integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { BadgeSettingsProvider, useBadgeSettings } from '../BadgeSettingsContext';

// Mock the settings manager
vi.mock('../settingsManager', () => ({
  badgeSettingsManager: {
    getSettings: vi.fn(() => Promise.resolve({
      timeThresholds: {
        minimal: 5 * 60 * 1000,
        significant: 30 * 60 * 1000,
        critical: 2 * 60 * 60 * 1000
      },
      variableThresholds: {
        defaultMinimum: 3,
        categorySpecific: {},
        alertThresholds: {}
      },
      displaySettings: {
        showTimeBadge: true,
        showVariableBadge: true,
        colorCoding: true,
        notificationLevel: 'normal'
      },
      version: '1.0.0',
      lastModified: Date.now()
    })),
    updateSettings: vi.fn(() => Promise.resolve()),
    updatePartialSettings: vi.fn(() => Promise.resolve()),
    resetToDefaults: vi.fn(() => Promise.resolve()),
    reloadSettings: vi.fn(() => Promise.resolve({
      timeThresholds: {
        minimal: 5 * 60 * 1000,
        significant: 30 * 60 * 1000,
        critical: 2 * 60 * 60 * 1000
      },
      variableThresholds: {
        defaultMinimum: 3,
        categorySpecific: {},
        alertThresholds: {}
      },
      displaySettings: {
        showTimeBadge: true,
        showVariableBadge: true,
        colorCoding: true,
        notificationLevel: 'normal'
      },
      version: '1.0.0',
      lastModified: Date.now()
    })),
    addChangeListener: vi.fn(() => vi.fn()), // Return unsubscribe function
    removeChangeListener: vi.fn()
  }
}));

// Test component that uses the context
function TestComponent(): React.JSX.Element {
  const { settings, isLoading, error, updateSettings, resetToDefaults } = useBadgeSettings();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="version">{settings.version}</div>
      <div data-testid="minimal-threshold">{settings.timeThresholds.minimal}</div>
      <button
        data-testid="update-button"
        onClick={() => updateSettings({
          ...settings,
          timeThresholds: {
            ...settings.timeThresholds,
            minimal: 10 * 60 * 1000
          }
        })}
      >
        Update
      </button>
      <button
        data-testid="reset-button"
        onClick={() => resetToDefaults()}
      >
        Reset
      </button>
    </div>
  );
}

describe('BadgeSettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BadgeSettingsProvider', () => {
    it('should provide settings context to children', async () => {
      render(
        <BadgeSettingsProvider>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      // Should start loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      // Should display settings
      expect(screen.getByTestId('version')).toHaveTextContent('1.0.0');
      expect(screen.getByTestId('minimal-threshold')).toHaveTextContent('300000'); // 5 minutes in ms
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });

    it('should skip auto-loading when autoLoad is false', () => {
      render(
        <BadgeSettingsProvider autoLoad={false}>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      // Should not be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    it('should use fallback settings when provided', () => {
      const fallbackSettings = {
        timeThresholds: {
          minimal: 8 * 60 * 1000,
          significant: 35 * 60 * 1000,
          critical: 3 * 60 * 60 * 1000
        },
        variableThresholds: {
          defaultMinimum: 5,
          categorySpecific: {},
          alertThresholds: {}
        },
        displaySettings: {
          showTimeBadge: false,
          showVariableBadge: true,
          colorCoding: false,
          notificationLevel: 'minimal' as const
        },
        version: '1.1.0',
        lastModified: Date.now()
      };

      render(
        <BadgeSettingsProvider fallbackSettings={fallbackSettings} autoLoad={false}>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      expect(screen.getByTestId('version')).toHaveTextContent('1.1.0');
      expect(screen.getByTestId('minimal-threshold')).toHaveTextContent('480000'); // 8 minutes in ms
    });
  });

  describe('context operations', () => {
    it('should handle update operations', async () => {
      render(
        <BadgeSettingsProvider>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      // Click update button
      const updateButton = screen.getByTestId('update-button');
      await act(async () => {
        updateButton.click();
      });

      // Should not throw errors
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });

    it('should handle reset operations', async () => {
      render(
        <BadgeSettingsProvider>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      // Click reset button
      const resetButton = screen.getByTestId('reset-button');
      await act(async () => {
        resetButton.click();
      });

      // Should not throw errors
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useBadgeSettings must be used within a BadgeSettingsProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('provider lifecycle', () => {
    it('should handle provider unmounting', async () => {
      const { unmount } = render(
        <BadgeSettingsProvider>
          <TestComponent />
        </BadgeSettingsProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple children', async () => {
      function SecondTestComponent(): React.JSX.Element {
        const { settings } = useBadgeSettings();
        return <div data-testid="second-version">{settings.version}</div>;
      }

      render(
        <BadgeSettingsProvider>
          <TestComponent />
          <SecondTestComponent />
        </BadgeSettingsProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      // Both components should have access to the same settings
      expect(screen.getByTestId('version')).toHaveTextContent('1.0.0');
      expect(screen.getByTestId('second-version')).toHaveTextContent('1.0.0');
    });
  });
});
