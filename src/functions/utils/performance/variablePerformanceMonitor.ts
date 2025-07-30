/**
 * Real-time performance monitoring for variable operations
 * Part of Step 11: Performance Optimization
 */

export interface PerformanceMetrics {
  variableSummaryCalculationTime: number;
  filterOperationTime: number;
  uiRenderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  operationsPerSecond: number;
}

export interface PerformanceSample {
  timestamp: number;
  operation: string;
  duration: number;
  memoryDelta: number;
  cacheHit: boolean;
}

export interface PerformanceAlert {
  type: 'warning' | 'error';
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

class VariablePerformanceMonitor {
  private readonly metrics: PerformanceMetrics;
  private readonly samples: PerformanceSample[];
  private alerts: PerformanceAlert[];
  private isMonitoring: boolean;
  private readonly alertCallbacks: Array<(alert: PerformanceAlert) => void>;
  private readonly maxSamples = 1000;
  private readonly alertThresholds = {
    variableSummaryCalculationTime: 100, // ms
    filterOperationTime: 200, // ms
    uiRenderTime: 16.67, // ms (60fps target)
    memoryUsage: 50 * 1024 * 1024, // 50MB
    cacheHitRate: 0.85, // 85%
    operationsPerSecond: 60 // ops/sec
  };

  constructor() {
    this.metrics = {
      variableSummaryCalculationTime: 0,
      filterOperationTime: 0,
      uiRenderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      operationsPerSecond: 0
    };
    this.samples = [];
    this.alerts = [];
    this.isMonitoring = false;
    this.alertCallbacks = [];
  }

  public startMonitoring(): void {
    this.isMonitoring = true;
    this.startMemoryMonitoring();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  public recordOperation(
    operation: string,
    startTime: number,
    endTime: number,
    cacheHit: boolean = false
  ): void {
    if (!this.isMonitoring) return;

    const duration = endTime - startTime;
    const memoryDelta = this.getMemoryUsage() - this.metrics.memoryUsage;

    const sample: PerformanceSample = {
      timestamp: Date.now(),
      operation,
      duration,
      memoryDelta,
      cacheHit
    };

    this.samples.push(sample);
    this.updateMetrics(sample);
    this.checkAlerts(operation, duration);

    // Limit sample history
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public getSummaryReport(): {
    metrics: PerformanceMetrics;
    recentSamples: PerformanceSample[];
    alerts: PerformanceAlert[];
    trends: Record<string, { average: number; min: number; max: number }>;
  } {
    const recentSamples = this.samples.slice(-50);
    const trends = this.calculateTrends();

    return {
      metrics: this.getMetrics(),
      recentSamples,
      alerts: this.getAlerts(),
      trends
    };
  }

  private updateMetrics(sample: PerformanceSample): void {
    // Update specific metric based on operation type
    switch (sample.operation) {
      case 'variable-summary-calculation':
        this.metrics.variableSummaryCalculationTime = sample.duration;
        break;
      case 'variable-filter':
        this.metrics.filterOperationTime = sample.duration;
        break;
      case 'ui-render':
        this.metrics.uiRenderTime = sample.duration;
        break;
    }

    // Update memory usage
    this.metrics.memoryUsage = this.getMemoryUsage();

    // Update cache hit rate
    this.updateCacheHitRate();

    // Update operations per second
    this.updateOperationsPerSecond();
  }

  private updateCacheHitRate(): void {
    const recentSamples = this.samples.slice(-100);
    const cacheHits = recentSamples.filter(s => s.cacheHit).length;
    this.metrics.cacheHitRate = recentSamples.length > 0 ? cacheHits / recentSamples.length : 0;
  }

  private updateOperationsPerSecond(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentOperations = this.samples.filter(s => s.timestamp > oneSecondAgo);
    this.metrics.operationsPerSecond = recentOperations.length;
  }

  private checkAlerts(operation: string, duration: number): void {
    const thresholds = this.alertThresholds;

    // Check duration-based alerts
    let alertType: keyof PerformanceMetrics | null = null;
    let threshold = 0;

    switch (operation) {
      case 'variable-summary-calculation':
        if (duration > thresholds.variableSummaryCalculationTime) {
          alertType = 'variableSummaryCalculationTime';
          threshold = thresholds.variableSummaryCalculationTime;
        }
        break;
      case 'variable-filter':
        if (duration > thresholds.filterOperationTime) {
          alertType = 'filterOperationTime';
          threshold = thresholds.filterOperationTime;
        }
        break;
      case 'ui-render':
        if (duration > thresholds.uiRenderTime) {
          alertType = 'uiRenderTime';
          threshold = thresholds.uiRenderTime;
        }
        break;
    }

    if (alertType) {
      this.createAlert('warning', alertType, duration, threshold);
    }

    // Check cache hit rate
    if (this.metrics.cacheHitRate < thresholds.cacheHitRate && this.samples.length > 10) {
      this.createAlert('warning', 'cacheHitRate', this.metrics.cacheHitRate, thresholds.cacheHitRate);
    }

    // Check memory usage
    if (this.metrics.memoryUsage > thresholds.memoryUsage) {
      this.createAlert('error', 'memoryUsage', this.metrics.memoryUsage, thresholds.memoryUsage);
    }
  }

  private createAlert(
    type: 'warning' | 'error',
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      message: `${metric} (${value.toFixed(2)}) exceeded threshold (${threshold.toFixed(2)})`
    };

    this.alerts.push(alert);
    this.alertCallbacks.forEach(callback => callback(alert));

    // Limit alert history
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const performanceWithMemory = window.performance as Performance & { memory?: { usedJSHeapSize: number } };
      return performanceWithMemory.memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      if (this.isMonitoring) {
        this.metrics.memoryUsage = this.getMemoryUsage();
      }
    }, 1000);
  }

  private calculateTrends(): Record<string, { average: number; min: number; max: number }> {
    const trends: Record<string, { average: number; min: number; max: number }> = {};
    const operationTypes = [...new Set(this.samples.map(s => s.operation))];

    for (const operation of operationTypes) {
      const operationSamples = this.samples
        .filter(s => s.operation === operation)
        .map(s => s.duration);

      if (operationSamples.length > 0) {
        trends[operation] = {
          average: operationSamples.reduce((a, b) => a + b, 0) / operationSamples.length,
          min: Math.min(...operationSamples),
          max: Math.max(...operationSamples)
        };
      }
    }

    return trends;
  }
}

// Global instance
export const performanceMonitor = new VariablePerformanceMonitor();

// Utility functions
export function measurePerformance<T>(
  operation: string,
  fn: () => T,
  cacheHit: boolean = false
): T {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();

  performanceMonitor.recordOperation(operation, startTime, endTime, cacheHit);

  return result;
}

export async function measureAsyncPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  cacheHit: boolean = false
): Promise<T> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();

  performanceMonitor.recordOperation(operation, startTime, endTime, cacheHit);

  return result;
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    measure: measurePerformance,
    measureAsync: measureAsyncPerformance,
    getMetrics: () => performanceMonitor.getMetrics(),
    getReport: () => performanceMonitor.getSummaryReport()
  };
}
