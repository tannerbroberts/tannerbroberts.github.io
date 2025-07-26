// Step 4 Storage Management Utilities - Clean Exports

// Main storage utilities
export {
  exportDataToJSON,
  exportDataToFile,
  importDataFromJSON,
  importDataFromFile,
  createDataSnapshot,
  getStorageUsageReport,
  cleanupStorageData,
  validateStorageIntegrity,
  createAutoBackup,
  listBackups,
  restoreFromBackup,
  deleteOldBackups
} from './storageUtils';

// Data validation utilities
export {
  validateAllData,
  validateAndMigrateData
} from './dataValidation';

// Migration utilities
export {
  migrateToCurrentVersion,
  migrateFromVersion,
  getSupportedVersions,
  isCompatibleVersion,
  detectSchemaVersion
} from './migrationUtils';

// Debug utilities
export {
  generateDiagnosticReport,
  debugStorageContents,
  testStoragePerformance,
  generateTestData,
  clearStorageAndReset,
  startPerformanceMonitoring,
  getStorageMetrics
} from './debugUtils';

// Type exports
export type {
  ExportData,
  ImportResult,
  ImportOptions,
  StorageUsageReport,
  CleanupResult,
  IntegrityReport,
  BackupResult,
  BackupInfo,
  RestoreResult
} from './storageUtils';

export type {
  MigrationResult,
  SchemaVersion
} from './migrationUtils';

export type {
  DiagnosticReport,
  PerformanceMetrics,
  IntegrityStatus,
  StorageOperationLog,
  StorageMetrics
} from './debugUtils';

export type {
  ValidationResult,
  ValidationIssue,
  ValidationStats,
  ExtendedValidationResult
} from './dataValidation';
