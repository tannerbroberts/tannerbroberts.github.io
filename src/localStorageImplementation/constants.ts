export const STORAGE_KEYS = {
  ITEMS: 'atp_items',
  BASE_CALENDAR: 'atp_base_calendar',
  SCHEMA_VERSION: 'atp_schema_version',
  LAST_BACKUP: 'atp_last_backup',
  BADGE_SETTINGS: 'atp_badge_settings'
} as const;

export const CURRENT_SCHEMA_VERSION = '1.0.0';
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const BACKUP_RETENTION_DAYS = 30;
