export const STORAGE_KEYS = {
  ITEMS: 'atp_items',
  BASE_CALENDAR: 'atp_base_calendar',
  SCHEMA_VERSION: 'atp_schema_version',
  LAST_BACKUP: 'atp_last_backup',
  BADGE_SETTINGS: 'atp_badge_settings',
  VARIABLE_DEFINITIONS: 'atp_variable_definitions',
  VARIABLE_DESCRIPTIONS: 'atp_variable_descriptions'
} as const;

export const CURRENT_SCHEMA_VERSION = '2.0.0'; // Incremented for variable system
export const PREVIOUS_SCHEMA_VERSION = '1.0.0';
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const BACKUP_RETENTION_DAYS = 30;
