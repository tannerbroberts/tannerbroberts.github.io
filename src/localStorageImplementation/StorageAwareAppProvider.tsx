import React, { useReducer, useEffect, useState, ReactNode, useCallback } from 'react';
import enhancedAppReducer from './enhancedAppReducer';
import { initialState } from '../functions/reducers/AppReducer';
import { loadAllDataFromStorage } from './localStorageService';
import { validateAndMigrateData } from './dataValidation';
import { LoadingScreen } from './components/LoadingScreen';
import { CURRENT_SCHEMA_VERSION } from './constants';
import type { StorageStatus } from './hooks/useStorageStatus';
import { AppStateContext, AppDispatchContext, StorageStatusContext } from './contexts';

interface StorageAwareAppProviderProps {
  readonly children: ReactNode;
  readonly fallbackToDefault?: boolean; // Whether to use default state on storage errors
  readonly showLoadingIndicator?: boolean; // Whether to show loading UI
}

/**
 * Storage-aware context provider that initializes app state from localStorage
 * 
 * This provider:
 * - Loads data from localStorage on initialization
 * - Provides loading states during restoration
 * - Handles corrupted/missing data gracefully
 * - Maintains compatibility with existing hooks
 */
export function StorageAwareAppProvider({
  children,
  fallbackToDefault = true,
  showLoadingIndicator = true
}: StorageAwareAppProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(enhancedAppReducer, initialState);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isLoading: true,
    hasLoaded: false,
    error: null,
    dataSource: 'default',
    lastLoadTime: null,
    dataVersion: null
  });

  /**
   * Loads initial data from localStorage and initializes the app state
   */
  const loadInitialData = useCallback(async (): Promise<void> => {
    const startTime = Date.now();

    try {
      setStorageStatus(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Load data from storage
      const loadResult = loadAllDataFromStorage();

      if (!loadResult.success) {
        // Storage failed - handle gracefully
        const errorMessage = `Failed to load data: ${loadResult.error}`;

        if (fallbackToDefault) {
          setStorageStatus({
            isLoading: false,
            hasLoaded: true,
            error: errorMessage,
            dataSource: 'error-fallback',
            lastLoadTime: Date.now(),
            dataVersion: null
          });
          return; // Keep using initialState (empty data)
        } else {
          throw new Error(errorMessage);
        }
      }

      const { items, baseCalendar } = loadResult.data!;

      // Validate and repair the loaded data
      const validationResult = validateAndMigrateData({ items, baseCalendar });

      if (validationResult.isValid || validationResult.repairedData) {
        // Use validated/repaired data
        const dataToUse = validationResult.repairedData || { items, baseCalendar };

        // Update state with a single action that replaces items
        dispatch({
          type: 'UPDATE_ITEMS',
          payload: { updatedItems: dataToUse.items }
        });

        // Add each base calendar entry individually
        for (const [, entry] of dataToUse.baseCalendar) {
          dispatch({
            type: 'ADD_BASE_CALENDAR_ENTRY',
            payload: { entry }
          });
        }

        setStorageStatus({
          isLoading: false,
          hasLoaded: true,
          error: validationResult.warnings.length > 0
            ? `Data loaded with warnings: ${validationResult.warnings.join(', ')}`
            : null,
          dataSource: 'localStorage',
          lastLoadTime: Date.now(),
          dataVersion: CURRENT_SCHEMA_VERSION
        });

        console.log(`Data loaded successfully in ${Date.now() - startTime}ms`, {
          itemCount: dataToUse.items.length,
          calendarEntries: dataToUse.baseCalendar.size,
          warnings: validationResult.warnings,
          dataSource: 'localStorage'
        });
      } else if (fallbackToDefault) {
        setStorageStatus({
          isLoading: false,
          hasLoaded: true,
          error: `Data validation failed: ${validationResult.errors.join(', ')}. Using default settings.`,
          dataSource: 'error-fallback',
          lastLoadTime: Date.now(),
          dataVersion: null
        });
      } else {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (fallbackToDefault) {
        setStorageStatus({
          isLoading: false,
          hasLoaded: true,
          error: errorMessage,
          dataSource: 'error-fallback',
          lastLoadTime: Date.now(),
          dataVersion: null
        });

        console.warn('Failed to load data from storage, using defaults:', errorMessage);
      } else {
        setStorageStatus({
          isLoading: false,
          hasLoaded: false,
          error: errorMessage,
          dataSource: 'default',
          lastLoadTime: null,
          dataVersion: null
        });

        console.error('Failed to load data from storage:', errorMessage);
      }
    }
  }, [fallbackToDefault]); // Add fallbackToDefault as dependency

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Show loading UI while restoring data
  if (showLoadingIndicator && storageStatus.isLoading) {
    return <LoadingScreen status={storageStatus} />;
  }

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <StorageStatusContext.Provider value={storageStatus}>
          {children}
        </StorageStatusContext.Provider>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
