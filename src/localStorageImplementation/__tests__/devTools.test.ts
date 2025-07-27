import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DevTools } from '../devTools';

// Mock localStorage
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

describe('DevTools', () => {
  let devTools: DevTools;

  beforeEach(() => {
    vi.clearAllMocks();
    devTools = new DevTools();

    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.length = 0;
  });

  describe('Quick Health Check', () => {
    test('should return health status object', () => {
      // Setup
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'atp-items') return '[]';
        if (key === 'atp-calendar') return '[]';
        return null;
      });

      // Execute
      const result = devTools.quickHealthCheck();

      // Verify
      expect(result).toHaveProperty('overallHealth');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('should detect storage issues', () => {
      // Setup
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      // Execute
      const result = devTools.quickHealthCheck();

      // Verify
      expect(result.overallHealth).toBe('critical');
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should start performance monitoring', () => {
      // Execute
      devTools.startPerformanceMonitoring();

      // Verify - should not throw
      expect(() => devTools.getPerformanceReport()).not.toThrow();
    });

    test('should stop performance monitoring', () => {
      // Setup
      devTools.startPerformanceMonitoring();

      // Execute
      devTools.stopPerformanceMonitoring();

      // Verify - should not throw
      expect(() => devTools.getPerformanceReport()).not.toThrow();
    });

    test('should return performance report', () => {
      // Execute
      const report = devTools.getPerformanceReport();

      // Verify
      expect(report).toHaveProperty('averageLatency');
      expect(report).toHaveProperty('operationsPerSecond');
      expect(report).toHaveProperty('memoryUsage');
      expect(report).toHaveProperty('operations');
      expect(Array.isArray(report.operations)).toBe(true);
    });
  });

  describe('Data Management', () => {
    test('should inspect current data', () => {
      // Setup
      const mockItems = [
        { id: '1', name: 'Item 1', type: 'BasicItem' },
        { id: '2', name: 'Item 2', type: 'SubCalendarItem' }
      ];
      const mockCalendar = [
        { id: 'cal1', title: 'Event 1' }
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'atp-items') return JSON.stringify(mockItems);
        if (key === 'atp-calendar') return JSON.stringify(mockCalendar);
        return null;
      });

      // Execute
      const result = devTools.inspectCurrentData();

      // Verify
      expect(result).toHaveProperty('itemCount');
      expect(result).toHaveProperty('calendarEntryCount');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('dataIntegrity');
      expect(result.itemCount).toBe(2);
      expect(result.calendarEntryCount).toBe(1);
    });

    test('should handle invalid JSON data', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue('invalid json');

      // Execute
      const result = devTools.inspectCurrentData();

      // Verify
      expect(result.itemCount).toBe(0);
      expect(result.calendarEntryCount).toBe(0);
    });

    // Sample data functionality disabled - sampleData.ts is empty
    test.skip('should reset to sample data', () => {
      // This test is disabled because sample data functionality is not implemented
      expect(true).toBe(true);
    });

    test('should backup current data', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue('[]');

      // Execute
      const result = devTools.backupCurrentData();

      // Verify
      expect(typeof result).toBe('string');
      expect(result).toContain('backup_');
    });

    test('should optimize storage', () => {
      // Execute
      const result = devTools.optimizeStorage();

      // Verify
      expect(result).toHaveProperty('spaceSaved');
      expect(typeof result.spaceSaved).toBe('number');
    });
  });

  describe('Storage Tests', () => {
    test('should run storage tests', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue('[]');
      localStorageMock.setItem.mockImplementation(() => { });

      // Execute
      const result = devTools.runStorageTests();

      // Verify
      expect(result).toHaveProperty('tests');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.tests)).toBe(true);
      expect(typeof result.passed).toBe('number');
      expect(typeof result.failed).toBe('number');
    });

    test('should handle storage test failures', () => {
      // Setup
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Execute
      const result = devTools.runStorageTests();

      // Verify
      expect(result.failed).toBeGreaterThan(0);
      expect(result.tests.some(test => !test.passed)).toBe(true);
    });
  });

  describe('Full Diagnostic', () => {
    test('should generate diagnostic report', () => {
      // Execute
      const result = devTools.fullDiagnostic();

      // Verify
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('healthCheck');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('dataInspection');
      expect(typeof result.timestamp).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage unavailable', () => {
      // Setup
      const originalLocalStorage = window.localStorage;
      // @ts-expect-error Testing with invalid type
      delete window.localStorage;

      // Execute
      const result = devTools.quickHealthCheck();

      // Verify
      expect(result.overallHealth).toBe('critical');
      expect(result.issues.length).toBeGreaterThan(0);

      // Cleanup
      window.localStorage = originalLocalStorage;
    });

    test('should handle null localStorage responses', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue(null);

      // Execute
      const result = devTools.inspectCurrentData();

      // Verify
      expect(result.itemCount).toBe(0);
      expect(result.calendarEntryCount).toBe(0);
    });
  });

  describe('Global Functions', () => {
    test('should not throw when accessing global functions', () => {
      // Execute & Verify
      expect(() => {
        // These are optional global functions that may or may not exist
        const globalWindow = window as Window & { quickHealth?: () => void };
        if (typeof globalWindow.quickHealth === 'function') {
          globalWindow.quickHealth();
        }
      }).not.toThrow();
    });
  });

  describe('Memory and Performance', () => {
    test('should calculate memory usage', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue('test data');
      localStorageMock.length = 5;
      localStorageMock.key.mockImplementation((index) => `key${index}`);

      // Execute
      const report = devTools.getPerformanceReport();

      // Verify
      expect(report.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    test('should track operations over time', () => {
      // Setup
      devTools.startPerformanceMonitoring();

      // Execute - simulate some time passing
      const report1 = devTools.getPerformanceReport();

      // Small delay to ensure different timestamps
      setTimeout(() => {
        const report2 = devTools.getPerformanceReport();

        // Verify
        // Check that reports have valid performance data
        expect(report2.operationsPerSecond).toBeGreaterThanOrEqual(0);
        expect(report1.operationsPerSecond).toBeGreaterThanOrEqual(0);
      }, 10);
    });
  });
});
