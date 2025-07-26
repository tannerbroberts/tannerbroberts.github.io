import { loadAllDataFromStorage, getStorageStats } from './localStorageService';
import { validateAllData } from './dataValidation';
import { ExportData } from './storageUtils';
import { Item, ItemFactory } from '../functions/utils/item/index';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';

export interface DiagnosticReport {
  timestamp: number;
  storageAvailable: boolean;
  dataLoaded: boolean;
  lastError: string | null;
  performance: PerformanceMetrics;
  dataIntegrity: IntegrityStatus;
  recommendations: string[];
}

export interface PerformanceMetrics {
  loadTime: number;
  saveTime: number;
  storageOperations: number;
  memoryUsage: number;
  renderTime: number;
}

export interface IntegrityStatus {
  itemsValid: boolean;
  calendarValid: boolean;
  relationshipsValid: boolean;
  schemaValid: boolean;
  issueCount: number;
}

export interface StorageOperationLog {
  timestamp: number;
  operation: 'load' | 'save' | 'delete' | 'validate';
  duration: number;
  dataSize: number;
  success: boolean;
  error?: string;
}

export interface StorageMetrics {
  operationsPerSecond: number;
  averageLoadTime: number;
  averageSaveTime: number;
  errorRate: number;
  dataGrowthRate: number;
}

// Performance monitoring state
let operationLogs: StorageOperationLog[] = [];
let startTime = 0;

/**
 * Generates comprehensive diagnostic report
 */
export function generateDiagnosticReport(): DiagnosticReport {
  const timestamp = Date.now();
  let lastError: string | null = null;
  let dataLoaded = false;

  // Test storage availability
  const storageAvailable = isStorageTestable();

  // Test data loading
  try {
    const loadStart = Date.now();
    const dataResult = loadAllDataFromStorage();
    const loadTime = Date.now() - loadStart;

    dataLoaded = dataResult.success;
    if (!dataResult.success) {
      lastError = dataResult.error || 'Failed to load data';
    }

    // Validate data integrity
    const validationResult = validateAllData();

    const performanceMetrics: PerformanceMetrics = {
      loadTime,
      saveTime: 0, // Would need to be tracked separately
      storageOperations: operationLogs.length,
      memoryUsage: getMemoryUsageEstimate(),
      renderTime: 0 // Would need to be tracked separately
    };

    const dataIntegrity: IntegrityStatus = {
      itemsValid: validationResult.isValid,
      calendarValid: validationResult.isValid,
      relationshipsValid: validationResult.isValid,
      schemaValid: validationResult.isValid,
      issueCount: validationResult.issues.length
    };

    const recommendations = generateRecommendations(dataIntegrity, performanceMetrics);

    return {
      timestamp,
      storageAvailable,
      dataLoaded,
      lastError,
      performance: performanceMetrics,
      dataIntegrity,
      recommendations
    };
  } catch (error) {
    return {
      timestamp,
      storageAvailable,
      dataLoaded: false,
      lastError: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        loadTime: 0,
        saveTime: 0,
        storageOperations: 0,
        memoryUsage: 0,
        renderTime: 0
      },
      dataIntegrity: {
        itemsValid: false,
        calendarValid: false,
        relationshipsValid: false,
        schemaValid: false,
        issueCount: 1
      },
      recommendations: ['Storage system appears to be unavailable or corrupted']
    };
  }
}

/**
 * Debug storage contents
 */
export function debugStorageContents(): { raw: string; parsed: unknown; issues: string[] } {
  const issues: string[] = [];

  try {
    const rawData = {
      items: localStorage.getItem('atp_items'),
      baseCalendar: localStorage.getItem('atp_base_calendar'),
      version: localStorage.getItem('atp_schema_version')
    };

    const raw = JSON.stringify(rawData, null, 2);

    // Try to parse the data
    let parsed: unknown = {};
    try {
      parsed = {
        items: rawData.items ? JSON.parse(rawData.items) : null,
        baseCalendar: rawData.baseCalendar ? JSON.parse(rawData.baseCalendar) : null,
        version: rawData.version
      };
    } catch (error) {
      issues.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate structure
    if (!rawData.items) {
      issues.push('No items data found in storage');
    }
    if (!rawData.baseCalendar) {
      issues.push('No base calendar data found in storage');
    }
    if (!rawData.version) {
      issues.push('No version information found in storage');
    }

    return { raw, parsed, issues };
  } catch (error) {
    return {
      raw: '',
      parsed: null,
      issues: [`Failed to debug storage: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Tests storage performance
 */
export function testStoragePerformance(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    loadTime: 0,
    saveTime: 0,
    storageOperations: 0,
    memoryUsage: getMemoryUsageEstimate(),
    renderTime: 0
  };

  try {
    // Test load performance
    const loadStart = Date.now();
    loadAllDataFromStorage();
    metrics.loadTime = Date.now() - loadStart;

    // Test save performance would go here
    // (not implemented to avoid corrupting actual data)

    metrics.storageOperations = operationLogs.length;

    return metrics;
  } catch (error) {
    console.error('Performance test failed:', error);
    return metrics;
  }
}

/**
 * Starts performance monitoring
 */
export function startPerformanceMonitoring(): () => PerformanceMetrics {
  startTime = Date.now();
  operationLogs = [];

  return () => {
    return {
      loadTime: 0,
      saveTime: 0,
      storageOperations: operationLogs.length,
      memoryUsage: getMemoryUsageEstimate(),
      renderTime: Date.now() - startTime
    };
  };
}

/**
 * Gets storage operation logs
 */
export function trackStorageOperations(): StorageOperationLog[] {
  return [...operationLogs];
}

/**
 * Gets storage metrics
 */
export function getStorageMetrics(): StorageMetrics {
  const logs = operationLogs;
  const totalOps = logs.length;

  if (totalOps === 0) {
    return {
      operationsPerSecond: 0,
      averageLoadTime: 0,
      averageSaveTime: 0,
      errorRate: 0,
      dataGrowthRate: 0
    };
  }

  const loadOps = logs.filter(log => log.operation === 'load');
  const saveOps = logs.filter(log => log.operation === 'save');
  const errorOps = logs.filter(log => !log.success);

  const timeSpan = logs[logs.length - 1].timestamp - logs[0].timestamp;
  const operationsPerSecond = timeSpan > 0 ? (totalOps / timeSpan) * 1000 : 0;

  const averageLoadTime = loadOps.length > 0
    ? loadOps.reduce((sum, op) => sum + op.duration, 0) / loadOps.length
    : 0;

  const averageSaveTime = saveOps.length > 0
    ? saveOps.reduce((sum, op) => sum + op.duration, 0) / saveOps.length
    : 0;

  const errorRate = errorOps.length / totalOps;

  return {
    operationsPerSecond,
    averageLoadTime,
    averageSaveTime,
    errorRate,
    dataGrowthRate: 0 // Would need historical data to calculate
  };
}

// Development utilities (only available in dev mode)

/**
 * Generates test data for development
 */
export function generateTestData(itemCount: number, calendarEntries: number): ExportData {
  const items: Item[] = [];
  const baseCalendar = new Map<string, BaseCalendarEntry>();

  // Generate basic items for testing
  for (let i = 0; i < itemCount; i++) {
    try {
      // Create a proper ItemJSON structure
      const itemData = {
        id: `test-item-${i}`,
        name: `Test Item ${i}`,
        type: 'BasicItem',
        duration: 60000 * (i + 1), // Variable duration
        estimatedDuration: 60000 * (i + 1),
        priority: Math.floor(Math.random() * 3) + 1,
        parents: [],
        allOrNothing: false
      };

      const item = ItemFactory.fromJSON(itemData);
      items.push(item);
    } catch (error) {
      console.warn(`Failed to create test item ${i}:`, error);
    }
  }

  // Generate calendar entries
  for (let i = 0; i < calendarEntries && i < items.length; i++) {
    baseCalendar.set(`test-entry-${i}`, {
      id: `test-entry-${i}`,
      itemId: items[i].id,
      startTime: Date.now() + (i * 60000) // Spaced 1 minute apart
    });
  }

  return {
    items,
    baseCalendar,
    metadata: {
      exportDate: Date.now(),
      version: '1.0.0',
      itemCount: items.length,
      calendarEntryCount: baseCalendar.size,
      appVersion: 'test'
    }
  };
}

/**
 * Logs storage activity when enabled
 */
export function logStorageActivity(enabled: boolean): void {
  if (!enabled) {
    operationLogs = [];
  }
}

/**
 * Clears storage and resets system (dev only)
 */
export function clearStorageAndReset(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('clearStorageAndReset is only available in development mode');
    return;
  }

  try {
    localStorage.removeItem('atp_items');
    localStorage.removeItem('atp_base_calendar');
    localStorage.removeItem('atp_schema_version');
    operationLogs = [];
    console.log('Storage cleared and system reset');
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

// Helper functions

function isStorageTestable(): boolean {
  try {
    const testKey = 'storage_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getMemoryUsageEstimate(): number {
  try {
    const stats = getStorageStats();
    return stats.totalSize;
  } catch {
    return 0;
  }
}

function generateRecommendations(integrity: IntegrityStatus, performance: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (!integrity.itemsValid || !integrity.calendarValid) {
    recommendations.push('Data integrity issues detected. Consider running data validation and repair.');
  }

  if (performance.loadTime > 1000) {
    recommendations.push('Storage load time is slow. Consider optimizing data size or storage structure.');
  }

  if (performance.memoryUsage > 1024 * 1024) { // > 1MB
    recommendations.push('Large data size detected. Consider data cleanup or archiving old items.');
  }

  if (integrity.issueCount > 10) {
    recommendations.push('Multiple data integrity issues found. Consider backing up data and performing cleanup.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Storage system is healthy. No issues detected.');
  }

  return recommendations;
}
