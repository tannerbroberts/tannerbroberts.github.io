import React, { createContext, useContext } from 'react';
import { AppState, AppAction } from '../functions/reducers/AppReducer';
import type { StorageStatus } from './hooks/useStorageStatus';

// Create contexts
export const AppStateContext = createContext<AppState | undefined>(undefined);
export const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(undefined);
export const StorageStatusContext = createContext<StorageStatus | undefined>(undefined);

/**
 * Hook to access app state
 * @returns Current application state
 */
export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within StorageAwareAppProvider');
  }
  return context;
}

/**
 * Hook to access app dispatch function
 * @returns Dispatch function for app actions
 */
export function useAppDispatch(): React.Dispatch<AppAction> {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within StorageAwareAppProvider');
  }
  return context;
}
