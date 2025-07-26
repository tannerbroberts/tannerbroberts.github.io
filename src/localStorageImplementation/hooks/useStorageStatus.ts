import { useContext } from 'react';
import { StorageStatusContext } from '../contexts';

export interface StorageStatus {
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  dataSource: 'localStorage' | 'default' | 'error-fallback';
  lastLoadTime: number | null;
  dataVersion: string | null;
}

/**
 * Hook to access storage status information
 * @returns Current storage status
 */
export function useStorageStatus(): StorageStatus {
  const context = useContext(StorageStatusContext);
  if (!context) {
    throw new Error('useStorageStatus must be used within StorageAwareAppProvider');
  }
  return context;
}

/**
 * Hook to check if data has been loaded from storage
 * @returns True if data loading is complete
 */
export function useIsDataLoaded(): boolean {
  const { hasLoaded } = useStorageStatus();
  return hasLoaded;
}

/**
 * Hook to get current storage error, if any
 * @returns Error message or null if no error
 */
export function useStorageError(): string | null {
  const { error } = useStorageStatus();
  return error;
}

/**
 * Hook to get the data source used for current state
 * @returns Data source type
 */
export function useDataSource(): StorageStatus['dataSource'] {
  const { dataSource } = useStorageStatus();
  return dataSource;
}
