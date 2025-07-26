# Step 5: Development and Debug Tools

## Context
You have completed Steps 1-4 and now have a complete storage system. This step creates developer-friendly tools for testing, debugging, and managing the storage system during development.

## Current State
The storage system is functional but developers need:
- Visual tools to inspect storage contents
- Easy way to clear/reset data during development
- Sample data generation for testing
- Performance monitoring during development
- Real-time debugging capabilities

## Task
Create comprehensive development and debugging tools that help developers work with the storage system effectively, including UI components for data management.

## Files to Create

### 1. `src/localStorageImplementation/components/StorageDebugPanel.tsx`

Main debug panel component (only shown in development):
```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import { ExpandMore, Storage, BugReport, Speed, DataObject } from '@mui/icons-material';

interface StorageDebugPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultExpanded?: boolean;
}

export function StorageDebugPanel({ 
  position = 'bottom-right',
  defaultExpanded = false 
}: StorageDebugPanelProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [storageData, setStorageData] = useState<unknown>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<unknown>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return <></>;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        [position.includes('bottom') ? 'bottom' : 'top']: 16,
        [position.includes('right') ? 'right' : 'left']: 16,
        zIndex: 9999,
        maxWidth: 600,
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <Paper elevation={8} sx={{ backgroundColor: 'background.paper' }}>
        <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Storage color="primary" />
              <Typography variant="h6">Storage Debug Panel</Typography>
              <Chip label="DEV" size="small" color="warning" />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            {/* Storage Overview */}
            <StorageOverviewSection />
            
            {/* Raw Data Inspector */}
            <RawDataInspector 
              storageData={storageData}
              onRefresh={() => setStorageData(loadRawStorageData())}
            />
            
            {/* Performance Monitor */}
            <PerformanceMonitor
              enabled={monitoringEnabled}
              onToggle={setMonitoringEnabled}
              metrics={performanceMetrics}
            />
            
            {/* Data Management Actions */}
            <DataManagementActions />
            
            {/* Sample Data Generator */}
            <SampleDataGenerator />
            
            {/* Storage Test Suite */}
            <StorageTestSuite />
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}

// Sub-components
function StorageOverviewSection(): JSX.Element
function RawDataInspector({ storageData, onRefresh }: { storageData: unknown; onRefresh: () => void }): JSX.Element
function PerformanceMonitor({ enabled, onToggle, metrics }: { enabled: boolean; onToggle: (enabled: boolean) => void; metrics: unknown }): JSX.Element
function DataManagementActions(): JSX.Element
function SampleDataGenerator(): JSX.Element
function StorageTestSuite(): JSX.Element
```

### 2. `src/localStorageImplementation/components/DataImportExport.tsx`

User-friendly import/export component:
```typescript
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Download, Upload, CloudDownload, Warning, CheckCircle } from '@mui/icons-material';

interface DataImportExportProps {
  onImportComplete?: (result: ImportResult) => void;
  onExportComplete?: () => void;
}

export function DataImportExport({ 
  onImportComplete,
  onExportComplete 
}: DataImportExportProps): JSX.Element {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleExport = useCallback(async () => {
    // Implementation
  }, []);

  const handleImport = useCallback(async (file: File) => {
    // Implementation
  }, []);

  return (
    <Box>
      {/* Export Section */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Export Data
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export to File
        </Button>
      </Box>

      {/* Import Section */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Import Data
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => setImportDialogOpen(true)}
        >
          Import from File
        </Button>
      </Box>

      {/* Export Dialog */}
      <ExportDialog 
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
        progress={importProgress}
        result={importResult}
      />
    </Box>
  );
}

// Dialog components
function ExportDialog({ open, onClose, onExport }: { open: boolean; onClose: () => void; onExport: () => void }): JSX.Element
function ImportDialog({ open, onClose, onImport, progress, result }: { open: boolean; onClose: () => void; onImport: (file: File) => void; progress: number; result: ImportResult | null }): JSX.Element
```

### 3. `src/localStorageImplementation/sampleData.ts`

Sample data generation for testing:
```typescript
import { Item, BaseCalendarEntry, BasicItem, SubCalendarItem, CheckListItem, Child, CheckListChild, Parent } from '../functions/utils/item/index';

export interface SampleDataOptions {
  itemCount: number;
  calendarEntryCount: number;
  includeHierarchy: boolean;
  includeScheduledItems: boolean;
  includeCheckLists: boolean;
  timeSpread: number; // Hours to spread calendar entries over
}

export interface SampleDataSet {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  metadata: {
    generated: number;
    options: SampleDataOptions;
    itemTypes: Record<string, number>;
    relationships: number;
  };
}

// Main generation functions
export function generateSampleData(options: Partial<SampleDataOptions> = {}): SampleDataSet
export function generateRealisticSchedule(dayCount: number = 7): SampleDataSet
export function generateComplexHierarchy(depth: number = 3, breadth: number = 3): SampleDataSet
export function generateStressTestData(itemCount: number = 10000): SampleDataSet

// Specific data generators
export function generateBasicItems(count: number): BasicItem[]
export function generateSubCalendarItems(count: number, childrenPerItem: number = 3): SubCalendarItem[]
export function generateCheckListItems(count: number, childrenPerItem: number = 5): CheckListItem[]
export function generateBaseCalendarEntries(items: Item[], entryCount: number, timeSpread: number): Map<string, BaseCalendarEntry>

// Realistic scenario generators
export function generateWorkdaySchedule(date: Date = new Date()): SampleDataSet
export function generateProjectPlan(complexity: 'simple' | 'medium' | 'complex' = 'medium'): SampleDataSet
export function generatePersonalTasks(categories: string[] = ['Work', 'Personal', 'Health', 'Learning']): SampleDataSet

// Utility functions
export function createRandomItem(type: 'basic' | 'subcalendar' | 'checklist'): Item
export function createRandomName(type: 'task' | 'project' | 'activity'): string
export function createRandomDuration(min: number = 300000, max: number = 3600000): number // 5 min to 1 hour
export function createRandomRelationships(items: Item[], relationshipDensity: number = 0.3): Item[]

// Predefined sample sets
export const SAMPLE_DATASETS = {
  EMPTY: { items: [], baseCalendar: new Map() },
  MINIMAL: generateSampleData({ itemCount: 5, calendarEntryCount: 2 }),
  TYPICAL: generateSampleData({ itemCount: 50, calendarEntryCount: 10, includeHierarchy: true }),
  COMPLEX: generateSampleData({ itemCount: 200, calendarEntryCount: 30, includeHierarchy: true, includeScheduledItems: true }),
  STRESS_TEST: generateStressTestData(5000)
};

// Development utilities
export function replaceCurrentDataWithSample(datasetName: keyof typeof SAMPLE_DATASETS): void
export function addSampleDataToCurrent(datasetName: keyof typeof SAMPLE_DATASETS): void
export function corruptSampleData(type: 'relationships' | 'references' | 'schema'): SampleDataSet
```

### 4. `src/localStorageImplementation/devTools.ts`

Core development utilities:
```typescript
import { generateDiagnosticReport, testStoragePerformance } from './debugUtils';
import { validateStorageIntegrity, cleanupStorageData } from './storageUtils';

export interface DevToolsConfig {
  enableLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableDataValidation: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export class DevTools {
  private config: DevToolsConfig;
  private performanceMonitor: PerformanceMonitor | null = null;

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
  public enableStorageLogging(): void
  public disableStorageLogging(): void
  public logStorageOperation(operation: string, data: unknown, duration: number): void

  // Performance monitoring
  public startPerformanceMonitoring(): void
  public stopPerformanceMonitoring(): PerformanceReport
  public getPerformanceReport(): PerformanceReport

  // Data management
  public quickHealthCheck(): HealthCheckResult
  public fullDiagnostic(): DiagnosticReport
  public resetToSampleData(datasetName: string): void
  public backupCurrentData(): string

  // Testing utilities
  public runStorageTests(): TestResults
  public simulateStorageFailure(type: 'quota' | 'corruption' | 'unavailable'): void
  public restoreStorageFunction(): void

  // Debug helpers
  public inspectCurrentData(): DataInspection
  public validateAllRelationships(): ValidationResult
  public findOrphanedData(): OrphanedDataReport
  public optimizeStorage(): OptimizationResult
}

// Global dev tools instance (only in development)
export const devTools = process.env.NODE_ENV === 'development' ? new DevTools() : null;

// Convenience functions for console use
export function quickHealth(): HealthCheckResult | null
export function fullDiag(): DiagnosticReport | null  
export function resetData(dataset?: string): void
export function inspectData(): DataInspection | null

// Make dev tools available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).atpDevTools = {
    quickHealth,
    fullDiag,
    resetData,
    inspectData,
    devTools
  };
}
```

### 5. `src/localStorageImplementation/components/StorageMonitor.tsx`

Real-time storage monitoring component:
```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useStorageStatus } from '../hooks/useStorageStatus';

export function StorageMonitor(): JSX.Element {
  const storageStatus = useStorageStatus();
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = async (): Promise<void> => {
    // Implementation
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Storage Monitor
      </Typography>

      <Grid container spacing={2}>
        {/* Status Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Status
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={storageStatus.dataSource} 
                  color={storageStatus.dataSource === 'localStorage' ? 'success' : 'warning'}
                />
                <Chip 
                  label={storageStatus.hasLoaded ? 'Loaded' : 'Loading'} 
                  color={storageStatus.hasLoaded ? 'success' : 'default'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Storage Usage
              </Typography>
              {metrics && (
                <>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.quotaUsed * 100} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {(metrics.totalSize / 1024).toFixed(1)} KB used
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Performance
              </Typography>
              {/* Performance charts/metrics */}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Grid item xs={12}>
            {alerts.map((alert, index) => (
              <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                {alert}
              </Alert>
            ))}
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
```

### 6. `src/localStorageImplementation/__tests__/devTools.test.ts`

Test suite for development tools:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevTools, quickHealth, resetData } from '../devTools';
import { generateSampleData } from '../sampleData';

describe('Development Tools', () => {
  let devTools: DevTools;

  beforeEach(() => {
    devTools = new DevTools();
  });

  describe('Health Checks', () => {
    it('should perform quick health check', () => {
      const result = devTools.quickHealthCheck();
      expect(result).toBeDefined();
      expect(result.overallHealth).toBeTypeOf('string');
    });

    it('should generate full diagnostic report', () => {
      const report = devTools.fullDiagnostic();
      expect(report).toBeDefined();
      expect(report.timestamp).toBeTypeOf('number');
    });
  });

  describe('Sample Data', () => {
    it('should generate sample data sets', () => {
      const data = generateSampleData({ itemCount: 10 });
      expect(data.items).toHaveLength(10);
      expect(data.baseCalendar).toBeInstanceOf(Map);
    });

    it('should reset to sample data', () => {
      expect(() => devTools.resetToSampleData('MINIMAL')).not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should start and stop monitoring', () => {
      devTools.startPerformanceMonitoring();
      const report = devTools.stopPerformanceMonitoring();
      expect(report).toBeDefined();
    });
  });
});
```

## Implementation Requirements

### 1. Development-Only Features
- All debug tools should only be available in development mode
- Use `process.env.NODE_ENV` checks throughout
- No performance impact in production builds
- Clear visual indicators when tools are active

### 2. Visual Debug Panel
- Floating panel that doesn't interfere with main UI
- Collapsible and repositionable
- Real-time data updates
- Clear action buttons for common operations

### 3. Sample Data Generation
- Realistic data that covers edge cases
- Various complexity levels for different testing needs
- Predefined datasets for common scenarios
- Easy integration with current data

### 4. Performance Monitoring
- Real-time metrics collection
- Performance impact tracking
- Storage operation logging
- Bottleneck identification

### 5. Global Dev Tools
- Available via browser console
- Quick access to common operations
- Non-intrusive integration
- Helpful error messages

## Acceptance Criteria
- [ ] Debug panel is only visible in development mode
- [ ] Sample data generation covers all item types and scenarios
- [ ] Performance monitoring tracks all storage operations
- [ ] Import/export tools handle all data formats correctly
- [ ] Global dev tools are accessible via browser console
- [ ] All tools handle errors gracefully without crashing
- [ ] Zero impact on production builds
- [ ] Visual tools are responsive and accessible
- [ ] Clear documentation for all debug features
- [ ] Test coverage > 80%

## Usage Examples

### Debug Panel Usage
```typescript
// Add to main App component in development
import { StorageDebugPanel } from './localStorageImplementation/components/StorageDebugPanel';

function App() {
  return (
    <>
      <MainAppContent />
      <StorageDebugPanel position="bottom-right" />
    </>
  );
}
```

### Console Usage
```javascript
// In browser console (development only)
atpDevTools.quickHealth(); // Quick health check
atpDevTools.fullDiag(); // Full diagnostic report
atpDevTools.resetData('COMPLEX'); // Load complex sample data
atpDevTools.inspectData(); // Inspect current data structure
```

### Component Integration
```typescript
// Add to admin/settings page
import { DataImportExport, StorageMonitor } from './localStorageImplementation/components';

function SettingsPage() {
  return (
    <>
      <StorageMonitor />
      <DataImportExport />
    </>
  );
}
```

## Performance Requirements
- Debug tools should add < 1ms overhead in development
- Sample data generation should complete in < 5 seconds
- Real-time monitoring should not affect storage operations
- Debug panel should not block main UI rendering

## Notes
- These tools are essential for development and debugging
- Focus on developer experience and ease of use
- Provide comprehensive error information
- Consider creating a separate debug route/page for complex tools
- Plan for integration with future admin interfaces
