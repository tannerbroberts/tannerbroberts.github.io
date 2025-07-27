/**
 * Development Tools and Debug Components for ATP Local Storage Implementation
 * 
 * This module exports all development utilities, debugging interfaces,
 * and monitoring tools for the About Time Project's local storage system.
 * 
 * @module DevTools
 */

// Core development utilities
export { DevTools } from '../devTools';
export type { PerformanceReport, HealthCheckResult, DevToolsConfig } from '../devTools';

// Debug components
export { StorageDebugPanel } from './StorageDebugPanel';
export { DataImportExport } from './DataImportExport';
export { StorageMonitor } from './StorageMonitor';

/**
 * Development mode check utility
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Initialize development tools
 * Call this in development mode to enable debug features
 */
export function initializeDevTools(): void {
  if (typeof window !== 'undefined' && isDevelopmentMode()) {
    console.log('ATP Development Tools initialized');
  }
}
