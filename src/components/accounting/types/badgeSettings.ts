/**
 * Badge Settings Types and Interfaces
 * 
 * Defines the structure for user-configurable badge threshold preferences
 * and display options for the accounting view.
 */

/**
 * Time-based threshold settings for badge notifications
 */
export interface TimeThresholdSettings {
  /** Minimum time (in milliseconds) to show badge as minimal importance */
  minimal: number;
  /** Time threshold (in milliseconds) for significant importance */
  significant: number;
  /** Time threshold (in milliseconds) for critical importance */
  critical: number;
}

/**
 * Variable quantity threshold settings for badge notifications
 */
export interface VariableThresholdSettings {
  /** Default minimum number of variables to trigger badge display */
  defaultMinimum: number;
  /** Category-specific thresholds for different variable types */
  categorySpecific: Record<string, number>;
  /** Alert thresholds for high variable counts */
  alertThresholds: Record<string, number>;
}

/**
 * Visual display preferences for badges
 */
export interface BadgeDisplaySettings {
  /** Whether to show the time badge */
  showTimeBadge: boolean;
  /** Whether to show the variable badge */
  showVariableBadge: boolean;
  /** Whether to use color coding based on thresholds */
  colorCoding: boolean;
  /** Level of notification detail */
  notificationLevel: 'none' | 'minimal' | 'normal' | 'verbose';
}

/**
 * Complete badge settings configuration
 */
export interface BadgeSettings {
  /** Time-based threshold configuration */
  timeThresholds: TimeThresholdSettings;
  /** Variable quantity threshold configuration */
  variableThresholds: VariableThresholdSettings;
  /** Display and visual preferences */
  displaySettings: BadgeDisplaySettings;
  /** Settings schema version for migration support */
  version: string;
  /** Last modified timestamp */
  lastModified: number;
}

/**
 * Default time thresholds (in milliseconds)
 */
export const DEFAULT_TIME_THRESHOLDS: TimeThresholdSettings = Object.freeze({
  minimal: 5 * 60 * 1000,      // 5 minutes
  significant: 30 * 60 * 1000,  // 30 minutes
  critical: 2 * 60 * 60 * 1000  // 2 hours
});

/**
 * Default variable thresholds
 */
export const DEFAULT_VARIABLE_THRESHOLDS: VariableThresholdSettings = Object.freeze({
  defaultMinimum: 3,
  categorySpecific: Object.freeze({
    'time': 2,
    'quantity': 5,
    'text': 1
  }),
  alertThresholds: Object.freeze({
    'high': 10,
    'critical': 20
  })
});

/**
 * Default display settings
 */
export const DEFAULT_DISPLAY_SETTINGS: BadgeDisplaySettings = Object.freeze({
  showTimeBadge: true,
  showVariableBadge: true,
  colorCoding: true,
  notificationLevel: 'normal'
});

/**
 * Default badge settings configuration
 */
export const DEFAULT_BADGE_SETTINGS: BadgeSettings = {
  timeThresholds: DEFAULT_TIME_THRESHOLDS,
  variableThresholds: DEFAULT_VARIABLE_THRESHOLDS,
  displaySettings: DEFAULT_DISPLAY_SETTINGS,
  version: '1.0.0',
  lastModified: Date.now()
};

/**
 * Validation schema for badge settings
 */
export interface BadgeSettingsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates time threshold settings
 */
function validateTimeThresholds(timeThresholds: TimeThresholdSettings): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { minimal, significant, critical } = timeThresholds;

  if (typeof minimal !== 'number' || minimal < 0) {
    errors.push('timeThresholds.minimal must be a non-negative number');
  }
  if (typeof significant !== 'number' || significant < 0) {
    errors.push('timeThresholds.significant must be a non-negative number');
  }
  if (typeof critical !== 'number' || critical < 0) {
    errors.push('timeThresholds.critical must be a non-negative number');
  }

  if (minimal >= significant) {
    warnings.push('minimal threshold should be less than significant threshold');
  }
  if (significant >= critical) {
    warnings.push('significant threshold should be less than critical threshold');
  }

  return { errors, warnings };
}

/**
 * Validates variable threshold settings
 */
function validateVariableThresholds(variableThresholds: VariableThresholdSettings): string[] {
  const errors: string[] = [];

  if (typeof variableThresholds.defaultMinimum !== 'number' || variableThresholds.defaultMinimum < 0) {
    errors.push('variableThresholds.defaultMinimum must be a non-negative number');
  }

  return errors;
}

/**
 * Validates display settings
 */
function validateDisplaySettings(displaySettings: BadgeDisplaySettings): string[] {
  const errors: string[] = [];

  if (typeof displaySettings.showTimeBadge !== 'boolean') {
    errors.push('displaySettings.showTimeBadge must be a boolean');
  }
  if (typeof displaySettings.showVariableBadge !== 'boolean') {
    errors.push('displaySettings.showVariableBadge must be a boolean');
  }
  if (typeof displaySettings.colorCoding !== 'boolean') {
    errors.push('displaySettings.colorCoding must be a boolean');
  }
  if (displaySettings.notificationLevel && !['none', 'minimal', 'normal', 'verbose'].includes(displaySettings.notificationLevel)) {
    errors.push('displaySettings.notificationLevel must be one of: none, minimal, normal, verbose');
  }

  return errors;
}

/**
 * Validates badge settings structure and values
 */
export function validateBadgeSettings(settings: unknown): BadgeSettingsValidation {
  const result: BadgeSettingsValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!settings || typeof settings !== 'object') {
    result.isValid = false;
    result.errors.push('Settings must be an object');
    return result;
  }

  const s = settings as Partial<BadgeSettings>;

  // Validate time thresholds
  if (s.timeThresholds) {
    const timeValidation = validateTimeThresholds(s.timeThresholds);
    result.errors.push(...timeValidation.errors);
    result.warnings.push(...timeValidation.warnings);
  }

  // Validate variable thresholds
  if (s.variableThresholds) {
    const variableErrors = validateVariableThresholds(s.variableThresholds);
    result.errors.push(...variableErrors);
  }

  // Validate display settings
  if (s.displaySettings) {
    const displayErrors = validateDisplaySettings(s.displaySettings);
    result.errors.push(...displayErrors);
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Merges user settings with defaults to ensure complete configuration
 */
export function mergeWithDefaults(userSettings: Partial<BadgeSettings>): BadgeSettings {
  return {
    timeThresholds: {
      ...DEFAULT_TIME_THRESHOLDS,
      ...userSettings.timeThresholds
    },
    variableThresholds: {
      ...DEFAULT_VARIABLE_THRESHOLDS,
      ...userSettings.variableThresholds
    },
    displaySettings: {
      ...DEFAULT_DISPLAY_SETTINGS,
      ...userSettings.displaySettings
    },
    version: userSettings.version || DEFAULT_BADGE_SETTINGS.version,
    lastModified: Date.now()
  };
}
