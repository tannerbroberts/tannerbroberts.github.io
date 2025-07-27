import { Item } from '../../functions/utils/item/index';
import { AppState, BaseCalendarEntry } from '../../functions/reducers/AppReducer';
import { loadAllDataFromStorage } from '../localStorageService';
import { validateAllData } from '../dataValidation';
import { v4 as uuid } from 'uuid';

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

  constructor() {
    this.registerBuiltInMigrations();
  }

  // Main migration functions
  public async migrateToStorageSystem(
    currentState: AppState,
    options: Partial<MigrationOptions> = {}
  ): Promise<MigrationResult> {
    const migrationId = uuid();
    const startTime = Date.now();
    const fullOptions: MigrationOptions = {
      createBackup: true,
      validateData: true,
      repairData: true,
      preserveUIState: true,
      dryRun: false,
      ...options
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    let backupId: string | undefined;

    try {
      // For a basic migration service, we'll simply return it's already done
      this.registerBuiltInMigrations();

      // Get the migration plan
      const plan = this.getMigrationPlan('0.0.0', '1.0.0');
      if (!plan) {
        throw new Error('No migration plan found for initial storage migration');
      }

      // Create migration context
      const context: MigrationContext = {
        currentState,
        targetState: currentState, // Will be updated as we migrate
        options: fullOptions,
        progress: (step: string, percentage: number) => {
          console.log(`Migration progress: ${step} (${percentage}%)`);
        },
        log: (level: 'info' | 'warn' | 'error', message: string) => {
          console.log(`[${level.toUpperCase()}] ${message}`);
          if (level === 'error') {
            errors.push(message);
          } else if (level === 'warn') {
            warnings.push(message);
          }
        }
      };

      // Execute migration steps
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        const stepStartTime = Date.now();

        try {
          context.progress(step.name, Math.round((i / plan.steps.length) * 100));
          context.log('info', `Executing step: ${step.name}`);

          const result = await step.execute(context);

          if (!result.success) {
            errors.push(...result.errors);
            warnings.push(...result.warnings);

            if (result.errors.length > 0) {
              throw new Error(`Migration step "${step.name}" failed: ${result.errors.join('; ')}`);
            }
          }

          // Store backup ID from backup step
          if (step.id === 'create-backup' && result.data) {
            backupId = result.data as string;
            context.backupId = backupId;
          }

          const stepExecutionTime = Date.now() - stepStartTime;
          context.log('info', `Step "${step.name}" completed in ${stepExecutionTime}ms`);

        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Step "${step.name}" failed: ${message}`);
          throw error;
        }
      }

      context.progress('Migration complete', 100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        migrationId,
        backupId,
        migratedData: {
          items: currentState.items,
          baseCalendar: currentState.baseCalendar
        },
        errors,
        warnings,
        executionTime,
        rollbackAvailable: backupId !== undefined
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown migration error';
      errors.push(message);

      const executionTime = Date.now() - startTime;

      return {
        success: false,
        migrationId,
        backupId,
        errors,
        warnings,
        executionTime,
        rollbackAvailable: backupId !== undefined
      };
    } finally {
      // Migration cleanup
    }
  }

  public async rollbackMigration(migrationId: string): Promise<MigrationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get backup ID from migration record (simplified - in real implementation you'd store this)
      const backupKey = `migration_backup_${migrationId}`;
      const backupData = localStorage.getItem(backupKey);

      if (!backupData) {
        throw new Error('No backup found for migration - cannot rollback');
      }

      const parsedBackup = JSON.parse(backupData);

      // Clear current storage
      localStorage.removeItem('atp-items');
      localStorage.removeItem('atp-baseCalendar');
      localStorage.removeItem('atp-metadata');

      // Restore from backup
      localStorage.setItem('atp-items', JSON.stringify(parsedBackup.items));
      localStorage.setItem('atp-baseCalendar', JSON.stringify(parsedBackup.baseCalendar));
      localStorage.setItem('atp-metadata', JSON.stringify(parsedBackup.metadata));

      // Clean up backup
      localStorage.removeItem(backupKey);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        migrationId: `rollback_${migrationId}`,
        errors,
        warnings,
        executionTime,
        rollbackAvailable: false
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown rollback error';
      errors.push(message);

      const executionTime = Date.now() - startTime;

      return {
        success: false,
        migrationId: `rollback_${migrationId}`,
        errors,
        warnings,
        executionTime,
        rollbackAvailable: false
      };
    }
  }

  public getMigrationPlan(_fromVersion: string, _toVersion: string): MigrationPlan | null {
    return this.migrations.get('initial-storage-migration') || null;
  }

  public validateMigrationPossible(_currentState: AppState): {
    canMigrate: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check storage availability
    if (!this.isStorageAvailable()) {
      issues.push('Local storage is not available');
      recommendations.push('Enable local storage in your browser');
    }

    // Check storage quota
    if (this.getStorageQuotaUsage() > 0.8) {
      issues.push('Storage quota is almost full');
      recommendations.push('Clear some browser data to free up space');
    }

    // Check data validity
    try {
      const validation = validateAllData();
      if (!validation.isValid) {
        issues.push('Current data has validation errors');
        recommendations.push('Fix data validation errors before migrating');
      }
    } catch {
      issues.push('Unable to validate current data');
    }

    return {
      canMigrate: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Built-in migration steps
  private registerBuiltInMigrations(): void {
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

  private createBackupStep(): MigrationStep {
    return {
      id: 'create-backup',
      name: 'Create Backup',
      description: 'Create a backup of current data for rollback purposes',
      estimatedDuration: 1000,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();
        const errors: string[] = [];

        try {
          const backupId = await this.createBackup(context.currentState);

          return {
            success: true,
            data: backupId,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Backup creation failed';
          errors.push(message);

          return {
            success: false,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        }
      },
      rollback: async (): Promise<void> => {
        // Backup creation doesn't need rollback
      }
    };
  }

  private validateCurrentDataStep(): MigrationStep {
    return {
      id: 'validate-current-data',
      name: 'Validate Current Data',
      description: 'Validate and repair current application data',
      estimatedDuration: 500,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
          const validation = validateAllData();

          if (!validation.isValid) {
            if (context.options.repairData) {
              context.log('warn', 'Data validation failed, attempting repair');
              // For now, just continue - repair functionality would be implemented here
              warnings.push('Data validation failed but repair is not yet implemented');
            } else {
              errors.push('Data validation failed and repair is disabled');
            }
          }

          return {
            success: errors.length === 0,
            errors,
            warnings,
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Data validation failed';
          errors.push(message);

          return {
            success: false,
            errors,
            warnings,
            executionTime: Date.now() - startTime
          };
        }
      }
    };
  }

  private migrateItemsStep(): MigrationStep {
    return {
      id: 'migrate-items',
      name: 'Migrate Items',
      description: 'Save items to localStorage',
      estimatedDuration: 1000,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();
        const errors: string[] = [];

        try {
          if (!context.options.dryRun) {
            localStorage.setItem('atp-items', JSON.stringify(context.targetState.items));
          }

          return {
            success: true,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Items migration failed';
          errors.push(message);

          return {
            success: false,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        }
      },
      rollback: async (): Promise<void> => {
        localStorage.removeItem('atp-items');
      }
    };
  }

  private migrateBaseCalendarStep(): MigrationStep {
    return {
      id: 'migrate-base-calendar',
      name: 'Migrate Base Calendar',
      description: 'Save base calendar to localStorage',
      estimatedDuration: 500,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();
        const errors: string[] = [];

        try {
          if (!context.options.dryRun) {
            // Convert Map to Array for storage
            const calendarArray = Array.from(context.targetState.baseCalendar.entries());
            localStorage.setItem('atp-baseCalendar', JSON.stringify(calendarArray));
          }

          return {
            success: true,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Base calendar migration failed';
          errors.push(message);

          return {
            success: false,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        }
      },
      rollback: async (): Promise<void> => {
        localStorage.removeItem('atp-baseCalendar');
      }
    };
  }

  private validateMigratedDataStep(): MigrationStep {
    return {
      id: 'validate-migrated-data',
      name: 'Validate Migrated Data',
      description: 'Verify that migrated data is accessible and valid',
      estimatedDuration: 500,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();
        const errors: string[] = [];

        try {
          if (!context.options.dryRun) {
            // Try to load data back from storage
            const loadResult = loadAllDataFromStorage();
            if (!loadResult.success || !loadResult.data) {
              errors.push('Failed to load migrated data from storage');
            } else {
              // Validate loaded data
              const validation = validateAllData();
              if (!validation.isValid) {
                errors.push('Migrated data failed validation');
              }
            }
          } return {
            success: errors.length === 0,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Migrated data validation failed';
          errors.push(message);

          return {
            success: false,
            errors,
            warnings: [],
            executionTime: Date.now() - startTime
          };
        }
      }
    };
  }

  private enablePersistenceStep(): MigrationStep {
    return {
      id: 'enable-persistence',
      name: 'Enable Persistence',
      description: 'Mark storage system as enabled',
      estimatedDuration: 100,
      execute: async (context: MigrationContext): Promise<MigrationStepResult> => {
        const startTime = Date.now();

        try {
          if (!context.options.dryRun) {
            // Set metadata to indicate storage is enabled
            const metadata = {
              version: '1.0.0',
              migrationDate: Date.now(),
              migrationId: context.currentState
            };
            localStorage.setItem('atp-metadata', JSON.stringify(metadata));
          }

          return {
            success: true,
            errors: [],
            warnings: [],
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to enable persistence';

          return {
            success: false,
            errors: [message],
            warnings: [],
            executionTime: Date.now() - startTime
          };
        }
      }
    };
  }

  // Utility methods
  private registerMigration(plan: MigrationPlan): void {
    this.migrations.set(plan.id, plan);
  }

  private async createBackup(data: AppState): Promise<string> {
    const backupId = uuid();
    const backupKey = `migration_backup_${backupId}`;

    const backup = {
      items: data.items,
      baseCalendar: Array.from(data.baseCalendar.entries()),
      metadata: {
        backupDate: Date.now(),
        version: '0.0.0'
      }
    };

    localStorage.setItem(backupKey, JSON.stringify(backup));
    return backupId;
  }

  private isStorageAvailable(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  private getStorageQuotaUsage(): number {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
      // Rough estimate - 5MB typical quota
      return totalSize / (5 * 1024 * 1024);
    } catch {
      return 0;
    }
  }
}

// Global migration service instance
export const migrationService = new MigrationService();

// Convenience functions
export async function performInitialMigration(currentState: AppState): Promise<MigrationResult> {
  return migrationService.migrateToStorageSystem(currentState);
}

export async function checkMigrationStatus(): Promise<{
  needsMigration: boolean;
  currentVersion: string;
  targetVersion: string
}> {
  try {
    const metadata = localStorage.getItem('atp-metadata');

    if (!metadata) {
      // No metadata means we need migration
      return {
        needsMigration: true,
        currentVersion: '0.0.0',
        targetVersion: '1.0.0'
      };
    }

    const parsed = JSON.parse(metadata);
    const currentVersion = parsed.version || '0.0.0';
    const targetVersion = '1.0.0';

    return {
      needsMigration: currentVersion !== targetVersion,
      currentVersion,
      targetVersion
    };
  } catch {
    // If we can't read metadata, assume migration is needed
    return {
      needsMigration: true,
      currentVersion: '0.0.0',
      targetVersion: '1.0.0'
    };
  }
}

export function getAvailableMigrations(): MigrationPlan[] {
  return Array.from(migrationService['migrations'].values());
}
