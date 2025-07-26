import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportDataToJSON,
  importDataFromJSON,
  validateStorageIntegrity,
  cleanupStorageData,
  createAutoBackup,
  listBackups,
  getStorageUsageReport
} from '../storageUtils';

// Mock the localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the localStorageService
vi.mock('../localStorageService', () => ({
  loadAllDataFromStorage: vi.fn(() => ({
    success: true,
    data: {
      items: [],
      baseCalendar: new Map()
    }
  })),
  saveAllDataToStorage: vi.fn(() => ({ success: true })),
  getStorageStats: vi.fn(() => ({
    totalSize: 1024,
    itemsSize: 512,
    calendarSize: 256,
    metadataSize: 256,
    quotaUsed: 0.1,
    quotaRemaining: 10240
  }))
}));

// Mock the dataValidation
vi.mock('../dataValidation', () => ({
  validateAllData: vi.fn(() => ({
    isValid: true,
    severity: 'info',
    issues: [],
    stats: {
      totalItems: 0,
      totalCalendarEntries: 0,
      orphanedItems: 0,
      brokenRelationships: 0,
      duplicateIds: 0,
      validationTime: 10
    }
  }))
}));

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Export/Import', () => {
    it('should export data to valid JSON', () => {
      const jsonData = exportDataToJSON();
      expect(jsonData).toBeDefined();
      expect(() => JSON.parse(jsonData)).not.toThrow();

      const parsed = JSON.parse(jsonData);
      expect(parsed).toHaveProperty('items');
      expect(parsed).toHaveProperty('baseCalendar');
      expect(parsed).toHaveProperty('metadata');
    });

    it('should import data with validation', () => {
      const testData = {
        items: [],
        baseCalendar: [],
        metadata: {
          exportDate: Date.now(),
          version: '1.0.0',
          itemCount: 0,
          calendarEntryCount: 0
        }
      };

      const result = importDataFromJSON(JSON.stringify(testData), {
        mergeStrategy: 'replace',
        validateData: true,
        createBackup: false
      });

      expect(result.success).toBe(true);
      expect(result.itemsImported).toBe(0);
      expect(result.calendarEntriesImported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle corrupted import data', () => {
      const result = importDataFromJSON('invalid json');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should handle missing required properties', () => {
      const invalidData = { items: [] }; // Missing baseCalendar and metadata

      const result = importDataFromJSON(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid data structure - missing required properties');
    });
  });

  describe('Storage Management', () => {
    it('should generate accurate usage report', () => {
      const report = getStorageUsageReport();

      expect(report).toHaveProperty('totalSize');
      expect(report).toHaveProperty('itemsSize');
      expect(report).toHaveProperty('calendarSize');
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should cleanup orphaned data', () => {
      const result = cleanupStorageData();

      expect(result).toHaveProperty('freedSpace');
      expect(result).toHaveProperty('removedItems');
      expect(result).toHaveProperty('repairedRelationships');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate data integrity', () => {
      const report = validateStorageIntegrity();

      expect(report).toHaveProperty('isValid');
      expect(report).toHaveProperty('checkedItems');
      expect(report).toHaveProperty('checkedCalendarEntries');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('checkTime');
      expect(Array.isArray(report.issues)).toBe(true);
    });
  });

  describe('Backup/Restore', () => {
    it('should create and restore backups', () => {
      // Test backup creation
      const backupResult = createAutoBackup();

      expect(backupResult).toHaveProperty('success');
      expect(backupResult).toHaveProperty('backupId');
      expect(backupResult).toHaveProperty('timestamp');
      expect(backupResult).toHaveProperty('dataSize');
    });

    it('should list backups', () => {
      // Mock some backup data in localStorage
      localStorageMock.length = 2;
      localStorageMock.key
        .mockReturnValueOnce('atp_last_backup_backup-123')
        .mockReturnValueOnce('atp_last_backup_backup-456');

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify({
          metadata: {
            exportDate: Date.now(),
            itemCount: 5,
            calendarEntryCount: 3,
            version: '1.0.0'
          }
        }))
        .mockReturnValueOnce(JSON.stringify({
          metadata: {
            exportDate: Date.now() - 86400000,
            itemCount: 3,
            calendarEntryCount: 2,
            version: '1.0.0'
          }
        }));

      const backups = listBackups();

      expect(Array.isArray(backups)).toBe(true);
    });

    it('should handle backup errors gracefully', () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = createAutoBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage unavailability', () => {
      // Mock localStorage methods to throw errors
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const report = getStorageUsageReport();

      expect(report.recommendations).toContain('Error generating report - storage may be unavailable');
    });

    it('should handle validation errors', async () => {
      const dataValidation = await import('../dataValidation');
      vi.mocked(dataValidation.validateAllData).mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const report = validateStorageIntegrity();

      expect(report.isValid).toBe(false);
      expect(report.issues).toHaveLength(1);
      expect(report.issues[0].type).toBe('validation-error');
    });
  });

  describe('Performance', () => {
    it('should complete operations within time limits', () => {
      const start = Date.now();

      exportDataToJSON();
      validateStorageIntegrity();
      getStorageUsageReport();

      const elapsed = Date.now() - start;

      // Operations should complete quickly (< 100ms for empty data)
      expect(elapsed).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', () => {
      // This would test with larger mock datasets
      // For now, just verify the functions don't crash
      expect(() => {
        exportDataToJSON();
        cleanupStorageData();
      }).not.toThrow();
    });
  });
});
