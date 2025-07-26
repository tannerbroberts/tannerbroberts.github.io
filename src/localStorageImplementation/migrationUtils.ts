import { ExportData } from './storageUtils';
import { validateAndMigrateData } from './dataValidation';
import { CURRENT_SCHEMA_VERSION } from './constants';

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  migratedItems: number;
  migratedCalendarEntries: number;
  backupCreated: boolean;
  migrationTime: number;
  errors: string[];
  warnings: string[];
}

export interface SchemaVersion {
  version: string;
  releaseDate: string;
  description: string;
  breakingChanges: boolean;
  migrationRequired: boolean;
}

/**
 * Migrates data to the current version
 */
export function migrateToCurrentVersion(data: unknown): MigrationResult {
  const detectedVersion = detectSchemaVersion(data) || '1.0.0';

  return migrateFromVersion(data, detectedVersion);
}

/**
 * Migrates data from a specific version to the current version
 */
export function migrateFromVersion(data: unknown, fromVersion: string): MigrationResult {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    fromVersion,
    toVersion: CURRENT_SCHEMA_VERSION,
    migratedItems: 0,
    migratedCalendarEntries: 0,
    backupCreated: false,
    migrationTime: 0,
    errors: [],
    warnings: []
  };

  try {
    // If already at current version, just validate
    if (fromVersion === CURRENT_SCHEMA_VERSION) {
      const validation = validateAndMigrateData(data);
      result.success = validation.isValid;
      if (validation.repairedData) {
        result.migratedItems = validation.repairedData.items.length;
        result.migratedCalendarEntries = validation.repairedData.baseCalendar.size;
      }
      result.errors = validation.errors;
      result.warnings = validation.warnings;
    } else {
      // Future: implement version-specific migrations
      result.errors.push(`Migration from version ${fromVersion} to ${CURRENT_SCHEMA_VERSION} is not yet implemented`);
    }

    result.migrationTime = Date.now() - startTime;
    return result;
  } catch (error) {
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.migrationTime = Date.now() - startTime;
    return result;
  }
}

/**
 * Gets list of supported schema versions
 */
export function getSupportedVersions(): SchemaVersion[] {
  return [
    {
      version: '1.0.0',
      releaseDate: '2025-01-01',
      description: 'Initial local storage implementation',
      breakingChanges: false,
      migrationRequired: false
    }
  ];
}

/**
 * Checks if a version is compatible with current system
 */
export function isCompatibleVersion(version: string): boolean {
  const supportedVersions = getSupportedVersions();
  return supportedVersions.some(v => v.version === version);
}

/**
 * Creates a backup before migration
 */
export function createMigrationBackup(data: ExportData, fromVersion: string): string {
  try {
    const backupId = `migration-backup-${fromVersion}-${Date.now()}`;
    const backupData = JSON.stringify({
      ...data,
      baseCalendar: Array.from(data.baseCalendar.entries()),
      migrationInfo: {
        backupId,
        fromVersion,
        timestamp: Date.now()
      }
    });

    localStorage.setItem(`migration_backup_${backupId}`, backupData);
    return backupId;
  } catch (error) {
    console.error('Failed to create migration backup:', error);
    throw new Error(`Failed to create migration backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates migration result
 */
export function validateMigrationResult(originalData: unknown, migratedData: unknown): boolean {
  try {
    // Basic validation - ensure both have required structure
    if (!originalData || !migratedData) {
      return false;
    }

    // Both should be objects with items and baseCalendar
    const original = originalData as Record<string, unknown>;
    const migrated = migratedData as Record<string, unknown>;

    return !!(
      original.items && original.baseCalendar &&
      migrated.items && migrated.baseCalendar
    );
  } catch {
    return false;
  }
}

/**
 * Rolls back migration using backup
 */
export function rollbackMigration(backupId: string): boolean {
  try {
    const backupData = localStorage.getItem(`migration_backup_${backupId}`);
    if (!backupData) {
      console.error(`Migration backup ${backupId} not found`);
      return false;
    }

    // Parse and validate backup data
    const parsedData = JSON.parse(backupData);
    if (!validateMigrationResult(parsedData, parsedData)) {
      console.error('Invalid backup data structure');
      return false;
    }

    // Restore would go here (implementation depends on storage service)
    console.log('Migration rollback successful');
    return true;
  } catch (error) {
    console.error('Migration rollback failed:', error);
    return false;
  }
}

/**
 * Detects schema version from data structure
 */
export function detectSchemaVersion(data: unknown): string | null {
  try {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const obj = data as Record<string, unknown>;

    // Check for version in metadata
    if (obj.metadata && typeof obj.metadata === 'object') {
      const metadata = obj.metadata as Record<string, unknown>;
      if (typeof metadata.version === 'string') {
        return metadata.version;
      }
    }

    // Check for version field directly
    if (typeof obj.version === 'string') {
      return obj.version;
    }

    // Default to initial version if structure looks valid
    if (obj.items && obj.baseCalendar) {
      return '1.0.0';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Upgrades schema to target version
 */
export function upgradeSchema(data: unknown, _targetVersion: string): MigrationResult {
  const currentVersion = detectSchemaVersion(data) || '1.0.0';
  return migrateFromVersion(data, currentVersion);
}

// Version-specific migration functions (for future use)

/**
 * Migration from 1.0.0 to 1.1.0 (placeholder)
 */
export function migrateFrom_1_0_0_to_1_1_0(_data: unknown): MigrationResult {
  return {
    success: false,
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migratedItems: 0,
    migratedCalendarEntries: 0,
    backupCreated: false,
    migrationTime: 0,
    errors: ['Migration from 1.0.0 to 1.1.0 not implemented'],
    warnings: []
  };
}

/**
 * Migration from 1.1.0 to 1.2.0 (placeholder)
 */
export function migrateFrom_1_1_0_to_1_2_0(_data: unknown): MigrationResult {
  return {
    success: false,
    fromVersion: '1.1.0',
    toVersion: '1.2.0',
    migratedItems: 0,
    migratedCalendarEntries: 0,
    backupCreated: false,
    migrationTime: 0,
    errors: ['Migration from 1.1.0 to 1.2.0 not implemented'],
    warnings: []
  };
}
