import { Item, ItemFactory } from '../functions/utils/item/index';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';
import {
  loadAllDataFromStorage,
  saveAllDataToStorage,
  getStorageStats
} from './localStorageService';
import { validateAllData } from './dataValidation';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './constants';

// Export/Import functionality
export interface ExportData {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  metadata: {
    exportDate: number;
    version: string;
    itemCount: number;
    calendarEntryCount: number;
    appVersion?: string;
  };
}

export interface ImportResult {
  success: boolean;
  itemsImported: number;
  calendarEntriesImported: number;
  errors: string[];
  warnings: string[];
  skippedItems: number;
}

export interface ImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'skip-duplicates';
  validateData: boolean;
  createBackup: boolean;
}

export interface MergeStrategy {
  onDuplicate: 'skip' | 'replace' | 'rename';
  preserveRelationships: boolean;
}

export interface StorageUsageReport {
  totalSize: number;
  itemsSize: number;
  calendarSize: number;
  metadataSize: number;
  backupsSize: number;
  quotaUsed: number;
  quotaRemaining: number;
  recommendations: string[];
}

export interface CleanupResult {
  freedSpace: number;
  removedItems: number;
  repairedRelationships: number;
  errors: string[];
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  spaceSaved: number;
  errors: string[];
}

export interface IntegrityReport {
  isValid: boolean;
  checkedItems: number;
  checkedCalendarEntries: number;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    itemId?: string;
  }>;
  checkTime: number;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  timestamp: number;
  dataSize: number;
  error?: string;
}

export interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  itemCount: number;
  calendarEntryCount: number;
  version: string;
}

export interface RestoreResult {
  success: boolean;
  restoredItems: number;
  restoredCalendarEntries: number;
  errors: string[];
  warnings: string[];
}

/**
 * Creates a snapshot of current data for export
 */
export function createDataSnapshot(): ExportData {
  try {
    const result = loadAllDataFromStorage();

    if (!result.success || !result.data) {
      return {
        items: [],
        baseCalendar: new Map(),
        metadata: {
          exportDate: Date.now(),
          version: CURRENT_SCHEMA_VERSION,
          itemCount: 0,
          calendarEntryCount: 0,
          appVersion: process.env.npm_package_version
        }
      };
    }

    return {
      items: result.data.items,
      baseCalendar: result.data.baseCalendar,
      metadata: {
        exportDate: Date.now(),
        version: CURRENT_SCHEMA_VERSION,
        itemCount: result.data.items.length,
        calendarEntryCount: result.data.baseCalendar.size,
        appVersion: process.env.npm_package_version
      }
    };
  } catch (error) {
    console.error('Error creating data snapshot:', error);
    return {
      items: [],
      baseCalendar: new Map(),
      metadata: {
        exportDate: Date.now(),
        version: CURRENT_SCHEMA_VERSION,
        itemCount: 0,
        calendarEntryCount: 0,
        appVersion: process.env.npm_package_version
      }
    };
  }
}

/**
 * Exports current data to JSON string
 */
export function exportDataToJSON(): string {
  try {
    const snapshot = createDataSnapshot();

    // Convert Map to Array for JSON serialization
    const serializable = {
      ...snapshot,
      baseCalendar: Array.from(snapshot.baseCalendar.entries())
    };

    return JSON.stringify(serializable, null, 2);
  } catch (error) {
    console.error('Error exporting data to JSON:', error);
    throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exports data to downloadable file
 */
export function exportDataToFile(filename?: string): void {
  try {
    const jsonData = exportDataToJSON();
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `atp-backup-${timestamp}.json`;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data to file:', error);
    throw new Error(`Failed to export file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Imports data from JSON string
 */
export function importDataFromJSON(jsonData: string, options: ImportOptions = {
  mergeStrategy: 'replace',
  validateData: true,
  createBackup: true
}): ImportResult {
  const result: ImportResult = {
    success: false,
    itemsImported: 0,
    calendarEntriesImported: 0,
    errors: [],
    warnings: [],
    skippedItems: 0
  };

  try {
    // Create backup if requested
    if (options.createBackup) {
      try {
        createAutoBackup();
      } catch (error) {
        result.warnings.push(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Parse JSON data
    let importedData: Record<string, unknown>;
    try {
      importedData = JSON.parse(jsonData) as Record<string, unknown>;
    } catch {
      result.errors.push('Invalid JSON format');
      return result;
    }

    // Validate structure
    if (!importedData.items || !importedData.baseCalendar || !importedData.metadata) {
      result.errors.push('Invalid data structure - missing required properties');
      return result;
    }

    // Convert baseCalendar back to Map with proper typing
    const baseCalendarArray = importedData.baseCalendar as Array<[string, BaseCalendarEntry]>;
    const baseCalendar = new Map<string, BaseCalendarEntry>(baseCalendarArray);

    // Deserialize items using ItemFactory
    const items: Item[] = [];
    const itemsArray = importedData.items as unknown[];

    for (const itemData of itemsArray) {
      try {
        // ItemFactory.fromJSON handles unknown types internally and throws on invalid data
        const item = ItemFactory.fromJSON(itemData as never);
        items.push(item);
      } catch (error) {
        result.errors.push(`Failed to deserialize item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.skippedItems++;
      }
    }

    // Validate data if requested
    if (options.validateData) {
      const validationResult = validateAllData();
      if (!validationResult.isValid) {
        result.warnings.push(`Data validation found ${validationResult.issues.length} issues`);
      }
    }

    // Apply merge strategy
    if (options.mergeStrategy === 'replace') {
      // Replace all data
      const saveResult = saveAllDataToStorage(items, baseCalendar);
      if (!saveResult.success) {
        result.errors.push(saveResult.error || 'Failed to save imported data');
        return result;
      }
    } else {
      // For now, use replace strategy for all other options
      result.warnings.push('Merge strategies not yet implemented, using replace');
      const saveResult = saveAllDataToStorage(items, baseCalendar);
      if (!saveResult.success) {
        result.errors.push(saveResult.error || 'Failed to save imported data');
        return result;
      }
    }

    result.success = true;
    result.itemsImported = items.length;
    result.calendarEntriesImported = baseCalendar.size;

    return result;
  } catch (error) {
    result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Imports data from uploaded file
 */
export function importDataFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const result: ImportResult = {
      success: false,
      itemsImported: 0,
      calendarEntriesImported: 0,
      errors: [],
      warnings: [],
      skippedItems: 0
    };

    if (!file.type.includes('json')) {
      result.errors.push('File must be a JSON file');
      resolve(result);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const importResult = importDataFromJSON(jsonData);
        resolve(importResult);
      } catch (error) {
        result.errors.push(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        resolve(result);
      }
    };

    reader.onerror = () => {
      result.errors.push('Failed to read file');
      resolve(result);
    };

    reader.readAsText(file);
  });
}

/**
 * Generates storage usage report
 */
export function getStorageUsageReport(): StorageUsageReport {
  try {
    const stats = getStorageStats();
    const recommendations: string[] = [];

    // Generate recommendations based on usage
    if (stats.quotaUsed > 0.8) {
      recommendations.push('Storage is nearly full. Consider cleaning up old data or exporting for backup.');
    }

    if (stats.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Large dataset detected. Consider using data compression utilities.');
    }

    // Calculate backup size estimate
    const backupsSize = getBackupStorageSize();

    return {
      totalSize: stats.totalSize,
      itemsSize: stats.itemsSize,
      calendarSize: stats.calendarSize,
      metadataSize: stats.metadataSize,
      backupsSize,
      quotaUsed: stats.quotaUsed,
      quotaRemaining: stats.quotaRemaining,
      recommendations
    };
  } catch (error) {
    console.error('Error generating storage usage report:', error);
    return {
      totalSize: 0,
      itemsSize: 0,
      calendarSize: 0,
      metadataSize: 0,
      backupsSize: 0,
      quotaUsed: 0,
      quotaRemaining: 0,
      recommendations: ['Error generating report - storage may be unavailable']
    };
  }
}

/**
 * Cleans up storage data by removing orphaned and invalid entries
 */
export function cleanupStorageData(): CleanupResult {
  const result: CleanupResult = {
    freedSpace: 0,
    removedItems: 0,
    repairedRelationships: 0,
    errors: []
  };

  try {
    const sizeBefore = getStorageStats().totalSize;

    // Load current data
    const dataResult = loadAllDataFromStorage();
    if (!dataResult.success || !dataResult.data) {
      result.errors.push('Failed to load storage data for cleanup');
      return result;
    }

    // Validate and repair data
    const validationResult = validateAllData();

    if (validationResult.repairedData) {
      // Save cleaned data back to storage
      const saveResult = saveAllDataToStorage(
        validationResult.repairedData.items,
        validationResult.repairedData.baseCalendar
      );

      if (saveResult.success) {
        const sizeAfter = getStorageStats().totalSize;
        result.freedSpace = sizeBefore - sizeAfter;
        result.removedItems = dataResult.data.items.length - validationResult.repairedData.items.length;
        result.repairedRelationships = validationResult.issues.filter(issue => issue.autoRepairable).length;
      } else {
        result.errors.push(saveResult.error || 'Failed to save cleaned data');
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Validates storage data integrity
 */
export function validateStorageIntegrity(): IntegrityReport {
  const startTime = Date.now();

  try {
    const validationResult = validateAllData();

    return {
      isValid: validationResult.isValid,
      checkedItems: validationResult.stats.totalItems,
      checkedCalendarEntries: validationResult.stats.totalCalendarEntries,
      issues: validationResult.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        itemId: issue.itemId
      })),
      checkTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      isValid: false,
      checkedItems: 0,
      checkedCalendarEntries: 0,
      issues: [{
        type: 'validation-error',
        severity: 'error',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      checkTime: Date.now() - startTime
    };
  }
}

/**
 * Creates automatic backup of current data
 */
export function createAutoBackup(): BackupResult {
  try {
    const snapshot = createDataSnapshot();
    const backupId = `backup-${Date.now()}`;
    const backupData = JSON.stringify({
      ...snapshot,
      baseCalendar: Array.from(snapshot.baseCalendar.entries())
    });

    // Store backup in localStorage with special key
    localStorage.setItem(`${STORAGE_KEYS.LAST_BACKUP}_${backupId}`, backupData);

    return {
      success: true,
      backupId,
      timestamp: Date.now(),
      dataSize: backupData.length
    };
  } catch (error) {
    return {
      success: false,
      backupId: '',
      timestamp: Date.now(),
      dataSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Lists all available backups
 */
export function listBackups(): BackupInfo[] {
  const backups: BackupInfo[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_KEYS.LAST_BACKUP}_backup-`)) {
        const backupData = localStorage.getItem(key);
        if (backupData) {
          try {
            const parsed = JSON.parse(backupData);
            backups.push({
              id: key.replace(`${STORAGE_KEYS.LAST_BACKUP}_`, ''),
              timestamp: parsed.metadata.exportDate,
              size: backupData.length,
              itemCount: parsed.metadata.itemCount,
              calendarEntryCount: parsed.metadata.calendarEntryCount,
              version: parsed.metadata.version
            });
          } catch (error) {
            console.warn(`Failed to parse backup ${key}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing backups:', error);
  }

  return backups.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Restores data from backup
 */
export function restoreFromBackup(backupId: string): RestoreResult {
  const result: RestoreResult = {
    success: false,
    restoredItems: 0,
    restoredCalendarEntries: 0,
    errors: [],
    warnings: []
  };

  try {
    const backupData = localStorage.getItem(`${STORAGE_KEYS.LAST_BACKUP}_${backupId}`);
    if (!backupData) {
      result.errors.push('Backup not found');
      return result;
    }

    // Create current backup before restoring
    const currentBackup = createAutoBackup();
    if (!currentBackup.success) {
      result.warnings.push('Failed to create backup of current data before restore');
    }

    const importResult = importDataFromJSON(backupData, {
      mergeStrategy: 'replace',
      validateData: true,
      createBackup: false
    });

    result.success = importResult.success;
    result.restoredItems = importResult.itemsImported;
    result.restoredCalendarEntries = importResult.calendarEntriesImported;
    result.errors = importResult.errors;
    result.warnings = [...result.warnings, ...importResult.warnings];

    return result;
  } catch (error) {
    result.errors.push(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Deletes old backups beyond retention period
 */
export function deleteOldBackups(retentionDays: number): void {
  try {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const backups = listBackups();

    for (const backup of backups) {
      if (backup.timestamp < cutoffTime) {
        try {
          localStorage.removeItem(`${STORAGE_KEYS.LAST_BACKUP}_${backup.id}`);
        } catch (error) {
          console.warn(`Failed to delete backup ${backup.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting old backups:', error);
  }
}

/**
 * Helper function to estimate backup storage size
 */
function getBackupStorageSize(): number {
  let totalSize = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_KEYS.LAST_BACKUP}_`)) {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating backup storage size:', error);
  }

  return totalSize;
}
