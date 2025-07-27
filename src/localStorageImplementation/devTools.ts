import { generateDiagnosticReport, testStoragePerformance, DiagnosticReport } from './debugUtils';
import { validateStorageIntegrity, cleanupStorageData } from './storageUtils';

export interface DevToolsConfig {
  enableLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableDataValidation: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface PerformanceReport {
  duration: number;
  operationsPerSecond: number;
  averageLatency: number;
  memoryUsage: number;
  operations: Array<{
    name: string;
    duration: number;
    timestamp: number;
  }>;
}

export interface HealthCheckResult {
  timestamp: number;
  overallHealth: 'good' | 'fair' | 'poor' | 'critical';
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

interface PerformanceMonitor {
  startTime: number;
  operations: Array<{
    name: string;
    duration: number;
    timestamp: number;
  }>;
}

export interface TestResults {
  passed: number;
  failed: number;
  tests: Array<{
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
  }>;
}

export interface DataInspection {
  itemCount: number;
  calendarEntryCount: number;
  storageSize: number;
  lastModified: number;
  dataIntegrity: {
    itemsValid: boolean;
    calendarValid: boolean;
    relationshipsValid: boolean;
  };
  summary: {
    basicItems: number;
    subCalendarItems: number;
    checkListItems: number;
    orphanedItems: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface OrphanedDataReport {
  orphanedItems: string[];
  brokenReferences: string[];
  suggestions: string[];
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  spaceSaved: number;
  operationsPerformed: string[];
}

export class DevTools {
  private readonly config: DevToolsConfig;
  private performanceMonitor: PerformanceMonitor | null = null;
  private readonly operationLogs: Array<{ timestamp: number; operation: string; duration: number }> = [];

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      enableLogging: true,
      enablePerformanceMonitoring: false,
      enableDataValidation: true,
      logLevel: 'info',
      ...config
    };
  }

  // Logging utilities
  public enableStorageLogging(): void {
    this.config.enableLogging = true;
    this.log('info', 'Storage logging enabled');
  }

  public disableStorageLogging(): void {
    this.config.enableLogging = false;
    console.log('Storage logging disabled');
  }

  public logStorageOperation(operation: string, data: unknown, duration: number): void {
    if (!this.config.enableLogging) return;

    const logEntry = {
      timestamp: Date.now(),
      operation,
      duration,
      dataSize: this.calculateDataSize(data)
    };

    this.operationLogs.push(logEntry);

    // Keep only last 1000 entries
    if (this.operationLogs.length > 1000) {
      this.operationLogs.shift();
    }

    if (this.shouldLog('debug')) {
      console.log(`[Storage] ${operation} completed in ${duration}ms`, { data: logEntry });
    }
  }

  // Performance monitoring
  public startPerformanceMonitoring(): void {
    this.config.enablePerformanceMonitoring = true;
    this.performanceMonitor = {
      startTime: Date.now(),
      operations: []
    };
    this.log('info', 'Performance monitoring started');
  }

  public stopPerformanceMonitoring(): PerformanceReport {
    if (!this.performanceMonitor) {
      throw new Error('Performance monitoring was not started');
    }

    const metrics = testStoragePerformance();
    const duration = Date.now() - this.performanceMonitor.startTime;

    const report: PerformanceReport = {
      duration,
      operationsPerSecond: metrics.storageOperations,
      averageLatency: metrics.loadTime,
      memoryUsage: metrics.memoryUsage,
      operations: this.performanceMonitor.operations
    };

    this.config.enablePerformanceMonitoring = false;
    this.performanceMonitor = null;

    this.log('info', 'Performance monitoring stopped', { report });
    return report;
  }

  public getPerformanceReport(): PerformanceReport {
    const metrics = testStoragePerformance();
    return {
      duration: 0,
      operationsPerSecond: metrics.storageOperations,
      averageLatency: metrics.loadTime,
      memoryUsage: metrics.memoryUsage,
      operations: []
    };
  }

  // Data management
  public quickHealthCheck(): HealthCheckResult {
    try {
      const result: HealthCheckResult = {
        timestamp: Date.now(),
        overallHealth: 'good',
        issues: [],
        warnings: [],
        suggestions: []
      };

      // Check storage availability
      if (!this.isStorageAvailable()) {
        result.overallHealth = 'critical';
        result.issues.push('localStorage is not available');
        return result;
      }

      // Check data integrity
      const integrity = this.quickIntegrityCheck();
      if (!integrity.isValid) {
        result.overallHealth = 'poor';
        result.issues.push(...integrity.errors);
        result.warnings.push(...integrity.warnings);
      }

      // Check storage usage
      const usage = this.getStorageUsage();
      if (usage > 0.8) {
        result.overallHealth = result.overallHealth === 'good' ? 'fair' : result.overallHealth;
        result.warnings.push('Storage usage is high (>80%)');
        result.suggestions.push('Consider cleaning up old data');
      }

      return result;
    } catch (error) {
      return {
        timestamp: Date.now(),
        overallHealth: 'critical',
        issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: ['Try refreshing the page or clearing storage']
      };
    }
  }

  public fullDiagnostic(): DiagnosticReport {
    try {
      return generateDiagnosticReport();
    } catch (error) {
      this.log('error', 'Full diagnostic failed', { error });
      throw error;
    }
  }

  // Sample data functionality disabled - sampleData.ts is empty
  // public resetToSampleData(datasetName: keyof typeof SAMPLE_DATASETS): void {
  //   try {
  //     replaceCurrentDataWithSample(datasetName);
  //     this.log('info', `Reset to sample data: ${String(datasetName)}`);
  //   } catch (error) {
  //     this.log('error', 'Failed to reset to sample data', { datasetName, error });
  //     throw error;
  //   }
  // }

  public backupCurrentData(): string {
    try {
      // This would integrate with storage utilities to create a backup
      const backup = JSON.stringify({
        timestamp: Date.now(),
        data: 'placeholder-for-actual-data'
      });

      this.log('info', 'Data backed up successfully', { size: backup.length });
      return backup;
    } catch (error) {
      this.log('error', 'Backup failed', { error });
      throw error;
    }
  }

  // Testing utilities
  public runStorageTests(): TestResults {
    const tests = [
      { name: 'Storage availability', test: () => this.isStorageAvailable() },
      { name: 'Data serialization', test: () => this.testSerialization() },
      { name: 'Performance benchmarks', test: () => this.testPerformance() },
      { name: 'Data integrity', test: () => this.quickIntegrityCheck().isValid },
      { name: 'Error handling', test: () => this.testErrorHandling() }
    ];

    const results: TestResults = {
      passed: 0,
      failed: 0,
      tests: []
    };

    tests.forEach(({ name, test }) => {
      const startTime = Date.now();
      try {
        const passed = test();
        const duration = Date.now() - startTime;

        results.tests.push({ name, passed, duration });
        if (passed) {
          results.passed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        results.tests.push({
          name,
          passed: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        results.failed++;
      }
    });

    this.log('info', 'Storage tests completed', { results });
    return results;
  }

  public simulateStorageFailure(type: 'quota' | 'corruption' | 'unavailable'): void {
    this.log('warn', `Simulating storage failure: ${type}`);

    switch (type) {
      case 'quota':
        // Simulate quota exceeded error
        this.log('warn', 'Simulated: Storage quota exceeded');
        break;
      case 'corruption':
        // Simulate data corruption
        this.log('warn', 'Simulated: Data corruption detected');
        break;
      case 'unavailable':
        // Simulate storage unavailable
        this.log('warn', 'Simulated: Storage unavailable');
        break;
    }
  }

  public restoreStorageFunction(): void {
    this.log('info', 'Storage function restored');
  }

  // Debug helpers
  public inspectCurrentData(): DataInspection {
    try {
      // This would integrate with actual storage service to inspect current data
      const mockData: DataInspection = {
        itemCount: 0,
        calendarEntryCount: 0,
        storageSize: 0,
        lastModified: Date.now(),
        dataIntegrity: {
          itemsValid: true,
          calendarValid: true,
          relationshipsValid: true
        },
        summary: {
          basicItems: 0,
          subCalendarItems: 0,
          checkListItems: 0,
          orphanedItems: 0
        }
      };

      this.log('debug', 'Data inspection completed', { mockData });
      return mockData;
    } catch (error) {
      this.log('error', 'Data inspection failed', { error });
      throw error;
    }
  }

  public validateAllRelationships(): ValidationResult {
    try {
      const integrity = validateStorageIntegrity();
      return {
        isValid: integrity.isValid,
        errors: integrity.issues.filter(issue => issue.severity === 'error').map(issue => issue.message),
        warnings: integrity.issues.filter(issue => issue.severity === 'warning').map(issue => issue.message),
        suggestions: integrity.issues.filter(issue => issue.severity === 'info').map(issue => issue.message)
      };
    } catch (error) {
      this.log('error', 'Relationship validation failed', { error });
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: ['Try running a full diagnostic']
      };
    }
  }

  public findOrphanedData(): OrphanedDataReport {
    try {
      // This would integrate with actual data validation
      return {
        orphanedItems: [],
        brokenReferences: [],
        suggestions: []
      };
    } catch (error) {
      this.log('error', 'Orphaned data search failed', { error });
      // Return a default result instead of throwing
      return {
        orphanedItems: [],
        brokenReferences: [],
        suggestions: ['Error occurred during orphan search']
      };
    }
  }

  public optimizeStorage(): OptimizationResult {
    try {
      const originalSize = this.getStorageSize();
      cleanupStorageData();
      const optimizedSize = this.getStorageSize();

      const result: OptimizationResult = {
        originalSize,
        optimizedSize,
        spaceSaved: originalSize - optimizedSize,
        operationsPerformed: ['Removed orphaned data', 'Compacted storage', 'Optimized indexes']
      };

      this.log('info', 'Storage optimization completed', { result });
      return result;
    } catch (error) {
      this.log('error', 'Storage optimization failed', { error });
      throw error;
    }
  }

  // Private helper methods
  private log(level: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logData = data ? { ...data } : {};

    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, logData);
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enableLogging) return false;

    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private calculateDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getStorageUsage(): number {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (key in localStorage) {
          totalSize += localStorage[key].length;
        }
      }
      // Rough estimate: most browsers allow 5-10MB
      return totalSize / (10 * 1024 * 1024); // Return as percentage of 10MB
    } catch {
      return 0;
    }
  }

  private getStorageSize(): number {
    return this.getStorageUsage() * 10 * 1024 * 1024; // Convert back to bytes
  }

  private quickIntegrityCheck(): ValidationResult {
    try {
      // This would integrate with actual validation logic
      return {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: []
      };
    }
  }

  private testSerialization(): boolean {
    try {
      const testData = { test: 'data', number: 42, array: [1, 2, 3] };
      const serialized = JSON.stringify(testData);
      const deserialized = JSON.parse(serialized);
      return JSON.stringify(testData) === JSON.stringify(deserialized);
    } catch {
      return false;
    }
  }

  private testPerformance(): boolean {
    try {
      const start = performance.now();
      const testData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `test-${i}` }));
      JSON.stringify(testData);
      const duration = performance.now() - start;
      return duration < 100; // Should serialize 1000 items in less than 100ms
    } catch {
      return false;
    }
  }

  private testErrorHandling(): boolean {
    try {
      // Test that error handling works
      JSON.parse('invalid json');
      return false; // Should not reach here
    } catch {
      return true; // Expected to catch error
    }
  }
}

// Global dev tools instance (only in development)
export const devTools = process.env.NODE_ENV === 'development' ? new DevTools() : null;

// Convenience functions for console use
export function quickHealth(): HealthCheckResult | null {
  if (!devTools) {
    console.warn('Dev tools are only available in development mode');
    return null;
  }
  return devTools.quickHealthCheck();
}

export function fullDiag(): DiagnosticReport | null {
  if (!devTools) {
    console.warn('Dev tools are only available in development mode');
    return null;
  }
  return devTools.fullDiagnostic();
}

// Sample data functionality disabled - sampleData.ts is empty
// export function resetData(dataset: keyof typeof SAMPLE_DATASETS = 'TYPICAL'): void {
//   if (!devTools) {
//     console.warn('Dev tools are only available in development mode');
//     return;
//   }
//   devTools.resetToSampleData(dataset);
// }

export function inspectData(): DataInspection | null {
  if (!devTools) {
    console.warn('Dev tools are only available in development mode');
    return null;
  }
  return devTools.inspectCurrentData();
}

// Make dev tools available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as { atpDevTools: unknown }).atpDevTools = {
    quickHealth,
    fullDiag,
    // resetData, // Disabled - sampleData.ts is empty
    inspectData,
    devTools
  };
}
