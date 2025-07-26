# Step 7: Integration and Migration

## Context
You have completed Steps 1-6 and now have a fully functional local storage system. This final step integrates all components into the main application and provides a seamless migration path from the current non-persistent system.

## Current State
The app currently uses:
- Original `AppReducer` and `AppProvider` from `reducerContexts/App.ts`
- No persistence - data is lost on page refresh
- ExecutionView that works with in-memory state only

## Task
Create a comprehensive integration and migration system that:
1. Safely migrates the app to use the new storage-aware system
2. Provides feature flags for gradual rollout
3. Ensures zero data loss during migration
4. Maintains backward compatibility
5. Provides rollback mechanisms if needed

## Files to Create

### 1. `src/localStorageImplementation/integration/migrationService.ts`

Complete migration orchestration service:
```typescript
import { Item, BaseCalendarEntry } from '../../functions/utils/item/index';
import { AppState } from '../../functions/reducers/AppReducer';
import { saveAllDataToStorage, loadAllDataFromStorage } from '../localStorageService';
import { validateAllData, repairDataAutomatically } from '../dataValidation';

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  estimatedDuration: number; // milliseconds
  dataBackupRequired: boolean;
  canRollback: boolean;
}

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  execute: (context: MigrationContext) => Promise<MigrationStepResult>;
  rollback?: (context: MigrationContext) => Promise<void>;
  estimatedDuration: number;
}

export interface MigrationContext {
  currentState: AppState;
  targetState: AppState;
  backupId?: string;
  options: MigrationOptions;
  progress: (step: string, percentage: number) => void;
  log: (level: 'info' | 'warn' | 'error', message: string) => void;
}

export interface MigrationOptions {
  createBackup: boolean;
  validateData: boolean;
  repairData: boolean;
  preserveUIState: boolean;
  dryRun: boolean;
}

export interface MigrationResult {
  success: boolean;
  migrationId: string;
  backupId?: string;
  migratedData?: {
    items: Item[];
    baseCalendar: Map<string, BaseCalendarEntry>;
  };
  errors: string[];
  warnings: string[];
  executionTime: number;
  rollbackAvailable: boolean;
}

export interface MigrationStepResult {
  success: boolean;
  data?: unknown;
  errors: string[];
  warnings: string[];
  executionTime: number;
}

export class MigrationService {
  private readonly migrations = new Map<string, MigrationPlan>();
  private currentMigration: string | null = null;

  constructor() {
    this.registerBuiltInMigrations();
  }

  // Main migration functions
  public async migrateToStorageSystem(
    currentState: AppState,
    options: Partial<MigrationOptions> = {}
  ): Promise<MigrationResult>

  public async rollbackMigration(migrationId: string): Promise<MigrationResult>

  public getMigrationPlan(fromVersion: string, toVersion: string): MigrationPlan | null

  public validateMigrationPossible(currentState: AppState): {
    canMigrate: boolean;
    issues: string[];
    recommendations: string[];
  }

  // Built-in migration steps
  private registerBuiltInMigrations(): void {
    // Register the main migration from non-persistent to persistent
    this.registerMigration({
      id: 'initial-storage-migration',
      name: 'Enable Local Storage',
      description: 'Migrate from in-memory state to localStorage-backed persistence',
      fromVersion: '0.0.0',
      toVersion: '1.0.0',
      steps: [
        this.createBackupStep(),
        this.validateCurrentDataStep(),
        this.migrateItemsStep(),
        this.migrateBaseCalendarStep(),
        this.validateMigratedDataStep(),
        this.enablePersistenceStep()
      ],
      estimatedDuration: 5000,
      dataBackupRequired: true,
      canRollback: true
    });
  }

  // Individual migration steps
  private createBackupStep(): MigrationStep
  private validateCurrentDataStep(): MigrationStep  
  private migrateItemsStep(): MigrationStep
  private migrateBaseCalendarStep(): MigrationStep
  private validateMigratedDataStep(): MigrationStep
  private enablePersistenceStep(): MigrationStep

  // Utility methods
  private registerMigration(plan: MigrationPlan): void
  private createBackup(data: AppState): Promise<string>
  private restoreFromBackup(backupId: string): Promise<AppState>
}

// Global migration service instance
export const migrationService = new MigrationService();

// Convenience functions
export async function performInitialMigration(currentState: AppState): Promise<MigrationResult>
export async function checkMigrationStatus(): Promise<{ needsMigration: boolean; currentVersion: string; targetVersion: string }>
export function getAvailableMigrations(): MigrationPlan[]
```

### 2. `src/localStorageImplementation/integration/featureFlags.ts`

Feature flag system for gradual rollout:
```typescript
export interface FeatureFlags {
  enableLocalStorage: boolean;
  enableAutoMigration: boolean;
  enableDebugTools: boolean;
  enablePerformanceMonitoring: boolean;
  enableDataValidation: boolean;
  enableBackupSystem: boolean;
  storageSystemVersion: string;
}

export interface FeatureFlagOverrides {
  [key: string]: boolean | string;
}

export class FeatureFlagManager {
  private flags: FeatureFlags;
  private overrides: FeatureFlagOverrides = {};

  constructor() {
    this.flags = this.loadDefaultFlags();
    this.loadOverrides();
  }

  // Flag checking methods
  public isEnabled(flag: keyof FeatureFlags): boolean
  public getString(flag: keyof FeatureFlags): string
  public getAll(): FeatureFlags

  // Override management
  public setOverride(flag: string, value: boolean | string): void
  public removeOverride(flag: string): void
  public clearAllOverrides(): void

  // Persistence
  public saveOverrides(): void
  public loadOverrides(): void

  // Migration-specific flags
  public canUsePersistence(): boolean
  public shouldAutoMigrate(): boolean
  public canRollback(): boolean

  private loadDefaultFlags(): FeatureFlags {
    return {
      enableLocalStorage: false, // Start disabled for safety
      enableAutoMigration: false,
      enableDebugTools: process.env.NODE_ENV === 'development',
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
      enableDataValidation: true,
      enableBackupSystem: true,
      storageSystemVersion: '1.0.0'
    };
  }
}

// Global feature flag manager
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export function useLocalStorage(): boolean
export function useEnhancedExecutionView(): boolean
export function useDebugTools(): boolean

// React hook for feature flags
export function useFeatureFlag(flag: keyof FeatureFlags): boolean | string
export function useFeatureFlags(): FeatureFlags
```

### 3. `src/localStorageImplementation/integration/AppMigrator.tsx`

React component that handles the migration process:
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Storage,
  Backup,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { migrationService, MigrationResult } from './migrationService';
import { featureFlags } from './featureFlags';
import { useAppState } from '../../reducerContexts/App';

interface AppMigratorProps {
  onMigrationComplete: (result: MigrationResult) => void;
  onMigrationSkipped: () => void;
}

export function AppMigrator({ 
  onMigrationComplete, 
  onMigrationSkipped 
}: AppMigratorProps): JSX.Element {
  const currentState = useAppState();
  const [migrationNeeded, setMigrationNeeded] = useState<boolean>(false);
  const [migrationInProgress, setMigrationInProgress] = useState<boolean>(false);
  const [migrationStep, setMigrationStep] = useState<string>('');
  const [migrationProgress, setMigrationProgress] = useState<number>(0);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if migration is needed on mount
  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async (): Promise<void> => {
    try {
      const status = await migrationService.checkMigrationStatus();
      setMigrationNeeded(status.needsMigration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check migration status');
    }
  };

  const handleStartMigration = useCallback(async (): Promise<void> => {
    setMigrationInProgress(true);
    setError(null);

    try {
      const result = await migrationService.migrateToStorageSystem(currentState, {
        createBackup: true,
        validateData: true,
        repairData: true,
        preserveUIState: true,
        dryRun: false
      });

      setMigrationResult(result);

      if (result.success) {
        // Enable local storage feature flag
        featureFlags.setOverride('enableLocalStorage', true);
        featureFlags.saveOverrides();
        onMigrationComplete(result);
      } else {
        setError(result.errors.join('; '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrationInProgress(false);
    }
  }, [currentState, onMigrationComplete]);

  const handleSkipMigration = useCallback((): void => {
    featureFlags.setOverride('enableLocalStorage', false);
    featureFlags.saveOverrides();
    onMigrationSkipped();
  }, [onMigrationSkipped]);

  const handleRollback = useCallback(async (): Promise<void> => {
    if (!migrationResult?.migrationId) return;

    try {
      setMigrationInProgress(true);
      await migrationService.rollbackMigration(migrationResult.migrationId);
      
      // Disable local storage feature flag
      featureFlags.setOverride('enableLocalStorage', false);
      featureFlags.saveOverrides();
      
      // Reload the page to reset state
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
    } finally {
      setMigrationInProgress(false);
    }
  }, [migrationResult]);

  // Don't show if migration not needed
  if (!migrationNeeded) {
    return <></>;
  }

  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      aria-labelledby="migration-dialog-title"
    >
      <DialogTitle id="migration-dialog-title">
        <Box display="flex" alignItems="center" gap={2}>
          <Storage color="primary" />
          <Typography variant="h5">
            Enable Data Persistence
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!migrationInProgress && !migrationResult && (
          <MigrationIntroduction />
        )}

        {migrationInProgress && (
          <MigrationProgress 
            step={migrationStep}
            progress={migrationProgress}
          />
        )}

        {migrationResult && (
          <MigrationResults 
            result={migrationResult}
            onRollback={handleRollback}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {!migrationInProgress && !migrationResult && (
          <>
            <Button onClick={handleSkipMigration}>
              Skip for Now
            </Button>
            <Button
              variant="contained"
              onClick={handleStartMigration}
              startIcon={<Storage />}
            >
              Enable Persistence
            </Button>
          </>
        )}

        {migrationResult?.success && (
          <Button
            variant="contained"
            onClick={() => onMigrationComplete(migrationResult)}
          >
            Continue
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Sub-components
function MigrationIntroduction(): JSX.Element
function MigrationProgress({ step, progress }: { step: string; progress: number }): JSX.Element
function MigrationResults({ result, onRollback }: { result: MigrationResult; onRollback: () => void }): JSX.Element
```

### 4. `src/localStorageImplementation/integration/StorageSystemInitializer.tsx`

Component that initializes the appropriate system based on feature flags:
```typescript
import React, { useState, useEffect, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { featureFlags } from './featureFlags';
import { AppProvider } from '../../reducerContexts/App';
import { StorageAwareAppProvider } from '../StorageAwareAppProvider';
import { AppMigrator } from './AppMigrator';
import { MigrationResult } from './migrationService';

interface StorageSystemInitializerProps {
  children: ReactNode;
}

export function StorageSystemInitializer({ 
  children 
}: StorageSystemInitializerProps): JSX.Element {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [useStorageSystem, setUseStorageSystem] = useState(false);
  const [showMigrator, setShowMigrator] = useState(false);

  useEffect(() => {
    initializeStorageSystem();
  }, []);

  const initializeStorageSystem = async (): Promise<void> => {
    try {
      // Check feature flags
      const storageEnabled = featureFlags.isEnabled('enableLocalStorage');
      
      if (storageEnabled) {
        setUseStorageSystem(true);
        setInitializationComplete(true);
      } else {
        // Check if migration is available and needed
        const migrationStatus = await migrationService.checkMigrationStatus();
        
        if (migrationStatus.needsMigration && featureFlags.isEnabled('enableAutoMigration')) {
          setShowMigrator(true);
        } else {
          setUseStorageSystem(false);
          setInitializationComplete(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize storage system:', error);
      // Fall back to non-persistent system
      setUseStorageSystem(false);
      setInitializationComplete(true);
    }
  };

  const handleMigrationComplete = (result: MigrationResult): void => {
    if (result.success) {
      setUseStorageSystem(true);
    }
    setShowMigrator(false);
    setInitializationComplete(true);
  };

  const handleMigrationSkipped = (): void => {
    setUseStorageSystem(false);
    setShowMigrator(false);
    setInitializationComplete(true);
  };

  // Show loading while initializing
  if (!initializationComplete) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Initializing About Time...
        </Typography>
      </Box>
    );
  }

  // Show migrator if needed
  if (showMigrator) {
    return (
      <AppProvider>
        {children}
        <AppMigrator
          onMigrationComplete={handleMigrationComplete}
          onMigrationSkipped={handleMigrationSkipped}
        />
      </AppProvider>
    );
  }

  // Use appropriate provider based on storage system
  const Provider = useStorageSystem ? StorageAwareAppProvider : AppProvider;

  return (
    <Provider>
      {children}
    </Provider>
  );
}
```

### 5. `src/localStorageImplementation/integration/index.ts`

Main integration export file:
```typescript
// Main integration components
export { StorageSystemInitializer } from './StorageSystemInitializer';
export { AppMigrator } from './AppMigrator';

// Migration services
export { migrationService, type MigrationResult, type MigrationOptions } from './migrationService';

// Feature flags
export { featureFlags, useFeatureFlag, useLocalStorage } from './featureFlags';

// Utility functions
export { performInitialMigration, checkMigrationStatus } from './migrationService';

// Integration helpers
export function isStorageSystemEnabled(): boolean {
  return featureFlags.isEnabled('enableLocalStorage');
}

export function getMigrationStatus(): Promise<{ needsMigration: boolean; currentVersion: string; targetVersion: string }> {
  return migrationService.checkMigrationStatus();
}

export async function enableStorageSystem(): Promise<MigrationResult> {
  // Enable the storage system programmatically
  featureFlags.setOverride('enableLocalStorage', true);
  featureFlags.saveOverrides();
  return { success: true, migrationId: 'manual-enable', errors: [], warnings: [], executionTime: 0, rollbackAvailable: false };
}

export function disableStorageSystem(): void {
  // Disable the storage system
  featureFlags.setOverride('enableLocalStorage', false);
  featureFlags.saveOverrides();
}
```

### 6. Update Main App Component

Create instructions for updating the main App.tsx:

**File:** `src/localStorageImplementation/INTEGRATION_INSTRUCTIONS.md`

```markdown
# Integration Instructions

## Step 1: Update Main App Component

Replace the existing App component structure:

### Before (src/components/App.tsx or similar):
```typescript
import { AppProvider } from '../reducerContexts/App';

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
```

### After:
```typescript
import { StorageSystemInitializer } from '../localStorageImplementation/integration';

function App() {
  return (
    <StorageSystemInitializer>
      <MainAppContent />
    </StorageSystemInitializer>
  );
}
```

## Step 2: Update ExecutionView (Optional)

To use the enhanced execution view with automatic loading:

### Replace existing ExecutionView import:
```typescript
// Before
import ExecutionView from './ExecutionView';

// After
import { EnhancedExecutionView } from '../localStorageImplementation/components/EnhancedExecutionView';

// Use in component
<EnhancedExecutionView showHeader={true} />
```

## Step 3: Add Debug Tools (Development Only)

Add debug tools to development builds:

```typescript
import { StorageDebugPanel } from '../localStorageImplementation/components/StorageDebugPanel';

function App() {
  return (
    <StorageSystemInitializer>
      <MainAppContent />
      {process.env.NODE_ENV === 'development' && (
        <StorageDebugPanel position="bottom-right" />
      )}
    </StorageSystemInitializer>
  );
}
```

## Step 4: Feature Flag Configuration

Configure feature flags as needed:

```typescript
import { featureFlags } from '../localStorageImplementation/integration';

// Enable automatic migration for existing users
featureFlags.setOverride('enableAutoMigration', true);

// Enable debug tools in development
if (process.env.NODE_ENV === 'development') {
  featureFlags.setOverride('enableDebugTools', true);
  featureFlags.setOverride('enablePerformanceMonitoring', true);
}
```
```

### 7. `src/localStorageImplementation/__tests__/integration.test.tsx`

Comprehensive integration test suite:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StorageSystemInitializer } from '../integration/StorageSystemInitializer';
import { migrationService } from '../integration/migrationService';
import { featureFlags } from '../integration/featureFlags';

describe('Storage System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    featureFlags.clearAllOverrides();
  });

  describe('StorageSystemInitializer', () => {
    it('should use storage system when enabled', async () => {
      featureFlags.setOverride('enableLocalStorage', true);
      
      render(
        <StorageSystemInitializer>
          <div>Test Content</div>
        </StorageSystemInitializer>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should show migrator when migration needed', async () => {
      featureFlags.setOverride('enableLocalStorage', false);
      featureFlags.setOverride('enableAutoMigration', true);
      
      vi.spyOn(migrationService, 'checkMigrationStatus').mockResolvedValue({
        needsMigration: true,
        currentVersion: '0.0.0',
        targetVersion: '1.0.0'
      });

      render(
        <StorageSystemInitializer>
          <div>Test Content</div>
        </StorageSystemInitializer>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enable Data Persistence/)).toBeInTheDocument();
      });
    });

    it('should fall back to non-persistent system on errors', async () => {
      vi.spyOn(migrationService, 'checkMigrationStatus').mockRejectedValue(new Error('Storage error'));

      render(
        <StorageSystemInitializer>
          <div>Test Content</div>
        </StorageSystemInitializer>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });

  describe('Migration Process', () => {
    it('should complete migration successfully', async () => {
      // Test full migration workflow
    });

    it('should handle migration failures gracefully', async () => {
      // Test error handling during migration
    });

    it('should support rollback functionality', async () => {
      // Test rollback capabilities
    });
  });

  describe('Feature Flags', () => {
    it('should respect feature flag settings', () => {
      // Test feature flag behavior
    });

    it('should persist feature flag overrides', () => {
      // Test persistence of overrides
    });
  });
});
```

## Implementation Requirements

### 1. Zero Data Loss Migration
- Create backup before any migration
- Validate data integrity throughout process
- Provide rollback mechanisms
- Handle all error scenarios gracefully

### 2. Feature Flag System
- Gradual rollout capability
- Easy enable/disable of storage system
- Override system for testing
- Persistence of flag settings

### 3. Migration User Experience
- Clear explanations of what will happen
- Progress indicators during migration
- Options to skip or postpone
- Easy rollback if issues occur

### 4. Backward Compatibility
- App works with or without storage system
- Existing components continue to function
- No breaking changes to current API
- Smooth transition path

### 5. Error Recovery
- Graceful handling of storage failures
- Fallback to non-persistent mode
- Clear error messages and recovery options
- Comprehensive logging for debugging

## Acceptance Criteria
- [ ] Seamless migration from current system to storage-backed system
- [ ] Zero data loss during migration process
- [ ] Feature flags allow gradual rollout and easy rollback
- [ ] App works correctly in both persistent and non-persistent modes
- [ ] Migration UI is clear and user-friendly
- [ ] Error handling covers all edge cases
- [ ] Rollback functionality works reliably
- [ ] Performance impact during migration is minimal
- [ ] Integration is well-documented and easy to follow
- [ ] Test coverage > 90% for integration scenarios

## User Experience Flow

### First-Time User
1. App loads normally (no migration needed)
2. Can optionally enable persistence later
3. Guided through benefits of persistence

### Existing User (Auto-Migration Enabled)
1. App detects existing data
2. Shows migration dialog with explanation
3. User chooses to migrate or skip
4. If migrated, seamless transition to persistent mode
5. Can rollback if issues occur

### Existing User (Manual Migration)
1. App works normally without persistence
2. Settings panel offers option to enable persistence
3. User can migrate when ready
4. Same migration flow as auto-migration

## Performance Requirements
- Migration completion: < 10 seconds for typical datasets
- App startup time increase: < 2 seconds
- Memory usage during migration: < 200MB
- No blocking of UI during migration

## Notes
- This step completes the entire storage implementation
- Focus on reliability and user trust during migration
- Provide extensive documentation and testing
- Consider A/B testing for rollout strategy
- Plan for monitoring and metrics collection post-migration
