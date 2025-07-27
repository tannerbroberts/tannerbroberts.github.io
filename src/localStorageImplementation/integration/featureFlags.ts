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
  private readonly flags: FeatureFlags;
  private overrides: FeatureFlagOverrides = {};

  constructor() {
    this.flags = this.loadDefaultFlags();
    this.loadOverrides();
  }

  // Flag checking methods
  public isEnabled(flag: keyof FeatureFlags): boolean {
    if (typeof this.overrides[flag] === 'boolean') {
      return this.overrides[flag] as boolean;
    }

    const value = this.flags[flag];
    return typeof value === 'boolean' ? value : false;
  }

  public getString(flag: keyof FeatureFlags): string {
    if (typeof this.overrides[flag] === 'string') {
      return this.overrides[flag] as string;
    }

    const value = this.flags[flag];
    return typeof value === 'string' ? value : '';
  }

  public getAll(): FeatureFlags {
    return { ...this.flags, ...this.overrides };
  }

  // Override management
  public setOverride(flag: string, value: boolean | string): void {
    this.overrides[flag] = value;
  }

  public removeOverride(flag: string): void {
    delete this.overrides[flag];
  }

  public clearAllOverrides(): void {
    this.overrides = {};
  }

  // Persistence
  public saveOverrides(): void {
    try {
      localStorage.setItem('atp-feature-flags', JSON.stringify(this.overrides));
    } catch (error) {
      console.warn('Failed to save feature flag overrides:', error);
    }
  }

  public loadOverrides(): void {
    try {
      const stored = localStorage.getItem('atp-feature-flags');
      if (stored) {
        this.overrides = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load feature flag overrides:', error);
      this.overrides = {};
    }
  }

  // Migration-specific flags
  public canUsePersistence(): boolean {
    return this.isEnabled('enableLocalStorage');
  }

  public shouldAutoMigrate(): boolean {
    return this.isEnabled('enableAutoMigration');
  }

  public canRollback(): boolean {
    return this.isEnabled('enableBackupSystem');
  }

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
export function useLocalStorage(): boolean {
  return featureFlags.isEnabled('enableLocalStorage');
}

export function useEnhancedExecutionView(): boolean {
  return featureFlags.isEnabled('enableLocalStorage');
}

export function useDebugTools(): boolean {
  return featureFlags.isEnabled('enableDebugTools');
}

// React hook for feature flags - simplified version for non-React usage
export function useFeatureFlag(flag: keyof FeatureFlags): boolean | string {
  const value = featureFlags.getAll()[flag];
  return value;
}

export function useFeatureFlags(): FeatureFlags {
  return featureFlags.getAll();
}
