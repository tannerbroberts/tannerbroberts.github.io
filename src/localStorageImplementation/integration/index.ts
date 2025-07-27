// Main integration components
export { StorageSystemInitializer } from './StorageSystemInitializer';
export { AppMigrator } from './AppMigrator';

// Migration services
export { migrationService, type MigrationResult, type MigrationOptions } from './migrationService';

// Feature flags
export { featureFlags, useFeatureFlag, useLocalStorage } from './featureFlags';

// Utility functions
export { performInitialMigration, checkMigrationStatus } from './migrationService';

// Integration helpers - import the instances directly
import { featureFlags } from './featureFlags';
import { checkMigrationStatus } from './migrationService';
import type { MigrationResult } from './migrationService';

export function isStorageSystemEnabled(): boolean {
  return featureFlags.isEnabled('enableLocalStorage');
}

export function getMigrationStatus(): Promise<{ needsMigration: boolean; currentVersion: string; targetVersion: string }> {
  return checkMigrationStatus();
}

export async function enableStorageSystem(): Promise<MigrationResult> {
  // Enable the storage system programmatically
  featureFlags.setOverride('enableLocalStorage', true);
  featureFlags.saveOverrides();
  return {
    success: true,
    migrationId: 'manual-enable',
    errors: [],
    warnings: [],
    executionTime: 0,
    rollbackAvailable: false
  };
}

export function disableStorageSystem(): void {
  // Disable the storage system
  featureFlags.setOverride('enableLocalStorage', false);
  featureFlags.saveOverrides();
}
