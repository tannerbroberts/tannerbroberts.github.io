// Step 3: Storage-Aware Context Provider
// Main exports for integration with the application

export { StorageAwareAppProvider } from './StorageAwareAppProvider';
export { useAppState, useAppDispatch } from './contexts';
export {
  useStorageStatus,
  useIsDataLoaded,
  useStorageError,
  useDataSource,
  type StorageStatus
} from './hooks/useStorageStatus';
export { validateAndMigrateData, validateItems, validateBaseCalendar } from './dataValidation';
export { LoadingScreen } from './components/LoadingScreen';

// Types
export type { ValidationResult, MigrationResult } from './dataValidation';
