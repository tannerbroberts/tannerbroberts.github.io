import { Item, ItemFactory } from '../functions/utils/item/index';
import { BaseCalendarEntry } from '../functions/reducers/AppReducer';

// Add imports needed for variable validation functions
import type { VariableDefinitionJSON, VariableDescriptionJSON } from '../functions/utils/item/types/VariableTypes';
import type { VariableMigrationResult } from './variableMigration';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  repairedData?: {
    items: Item[];
    baseCalendar: Map<string, BaseCalendarEntry>;
  };
}

export interface MigrationResult {
  success: boolean;
  migratedData?: {
    items: Item[];
    baseCalendar: Map<string, BaseCalendarEntry>;
  };
  errors: string[];
  fromVersion: string;
  toVersion: string;
}

export interface ValidationIssue {
  type: 'missing-reference' | 'orphaned-item' | 'invalid-data' | 'schema-mismatch' | 'duplicate-id' | 'broken-relationship' | 'circular-reference';
  severity: 'error' | 'warning' | 'info';
  message: string;
  itemId?: string;
  details?: unknown;
  autoRepairable: boolean;
}

export interface ValidationStats {
  totalItems: number;
  totalCalendarEntries: number;
  orphanedItems: number;
  brokenRelationships: number;
  duplicateIds: number;
  validationTime: number;
}

export interface ExtendedValidationResult {
  isValid: boolean;
  severity: 'error' | 'warning' | 'info';
  issues: ValidationIssue[];
  repairedData?: {
    items: Item[];
    baseCalendar: Map<string, BaseCalendarEntry>;
  };
  stats: ValidationStats;
}

/**
 * Main validation function that validates and repairs loaded data
 * @param rawData - Raw data loaded from storage
 * @returns ValidationResult with validation status and repaired data if possible
 */
export function validateAndMigrateData(rawData: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (!rawData || typeof rawData !== 'object') {
      return {
        isValid: false,
        errors: ['Data is null, undefined, or not an object'],
        warnings: []
      };
    }

    const data = rawData as Record<string, unknown>;

    // Validate items array
    const itemsValidation = validateItems(data.items);
    if (!itemsValidation.isValid) {
      errors.push(...itemsValidation.errors);
    }

    // Validate base calendar
    const calendarValidation = validateBaseCalendar(data.baseCalendar);
    if (!calendarValidation.isValid) {
      errors.push(...calendarValidation.errors);
    }

    // If validation failed, attempt repairs
    if (errors.length > 0) {
      const items = itemsValidation.items || [];
      const baseCalendar = calendarValidation.calendar || new Map<string, BaseCalendarEntry>();

      // Attempt to repair item relationships
      const repairResult = repairItemRelationships(items);
      warnings.push(...repairResult.warnings);

      // Remove orphaned calendar entries
      const cleanedCalendar = removeOrphanedCalendarEntries(repairResult.repairedItems, baseCalendar);

      return {
        isValid: false,
        errors,
        warnings,
        repairedData: {
          items: repairResult.repairedItems,
          baseCalendar: cleanedCalendar
        }
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [],
      repairedData: {
        items: itemsValidation.items || [],
        baseCalendar: calendarValidation.calendar || new Map<string, BaseCalendarEntry>()
      }
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

/**
 * Validates an items array and attempts to create valid Item instances
 * @param items - Raw items data from storage
 * @returns Validation result with Item instances if valid
 */
export function validateItems(items: unknown): { isValid: boolean; errors: string[]; items?: Item[] } {
  const errors: string[] = [];

  try {
    if (!Array.isArray(items)) {
      return {
        isValid: false,
        errors: ['Items data is not an array']
      };
    }

    const validItems: Item[] = [];

    for (let i = 0; i < items.length; i++) {
      const rawItem = items[i];

      if (!rawItem || typeof rawItem !== 'object') {
        errors.push(`Item at index ${i} is not a valid object`);
        continue;
      }

      try {
        // Attempt to create Item from the raw data
        // The ItemFactory should handle validation and creation
        const item = ItemFactory.fromJSON(rawItem);
        validItems.push(item);
      } catch (itemError) {
        errors.push(`Item at index ${i} is invalid: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      items: validItems
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Items validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Validates base calendar data and converts to Map
 * @param calendar - Raw calendar data from storage
 * @returns Validation result with Map if valid
 */
export function validateBaseCalendar(calendar: unknown): { isValid: boolean; errors: string[]; calendar?: Map<string, BaseCalendarEntry> } {
  const errors: string[] = [];

  try {
    if (!calendar) {
      return {
        isValid: true,
        errors: [],
        calendar: new Map<string, BaseCalendarEntry>()
      };
    }

    const calendarMap = new Map<string, BaseCalendarEntry>();

    if (Array.isArray(calendar)) {
      return validateCalendarArray(calendar, errors, calendarMap);
    } else if (typeof calendar === 'object') {
      return validateCalendarObject(calendar as Record<string, unknown>, errors, calendarMap);
    } else {
      return {
        isValid: false,
        errors: ['Calendar data is not in a valid format']
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Calendar validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Helper function to validate calendar data in array format
 */
function validateCalendarArray(
  calendar: unknown[],
  errors: string[],
  calendarMap: Map<string, BaseCalendarEntry>
): { isValid: boolean; errors: string[]; calendar?: Map<string, BaseCalendarEntry> } {
  // Array format from Map serialization
  for (const entry of calendar) {
    if (!Array.isArray(entry) || entry.length !== 2) {
      errors.push('Calendar array entry is not a valid [key, value] pair');
      continue;
    }

    const [key, value] = entry;
    if (typeof key !== 'string') {
      errors.push(`Calendar key is not a string: ${key}`);
      continue;
    }

    if (!isValidBaseCalendarEntry(value)) {
      errors.push(`Calendar entry for key "${key}" is invalid`);
      continue;
    }

    calendarMap.set(key, value);
  }

  return {
    isValid: errors.length === 0,
    errors,
    calendar: calendarMap
  };
}

/**
 * Helper function to validate calendar data in object format
 */
function validateCalendarObject(
  calendar: Record<string, unknown>,
  errors: string[],
  calendarMap: Map<string, BaseCalendarEntry>
): { isValid: boolean; errors: string[]; calendar?: Map<string, BaseCalendarEntry> } {
  const entries = calendar.entries || calendar;

  if (Array.isArray(entries)) {
    // Map.entries() serialization format
    return validateCalendarArray(entries, errors, calendarMap);
  } else if (typeof entries === 'object' && entries !== null) {
    // Direct object format
    for (const [key, value] of Object.entries(entries)) {
      if (!isValidBaseCalendarEntry(value)) {
        errors.push(`Calendar entry for key "${key}" is invalid`);
        continue;
      }

      calendarMap.set(key, value);
    }
  } else {
    return {
      isValid: false,
      errors: ['Calendar entries data is not in a valid format']
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    calendar: calendarMap
  };
}

/**
 * Validates that an object is a valid BaseCalendarEntry
 */
function isValidBaseCalendarEntry(entry: unknown): entry is BaseCalendarEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const e = entry as Record<string, unknown>;

  // Check required properties based on BaseCalendarEntry interface
  return (
    typeof e.id === 'string' &&
    typeof e.itemId === 'string' &&
    typeof e.startTime === 'number'
  );
}

/**
 * Repairs item relationships by removing invalid parent references
 * @param items - Array of items to repair
 * @returns Repaired items and warnings about what was fixed
 */
export function repairItemRelationships(items: Item[]): { repairedItems: Item[]; warnings: string[] } {
  const warnings: string[] = [];
  const itemIds = new Set(items.map(item => item.id));
  const repairedItems: Item[] = [];

  for (const item of items) {
    let needsRepair = false;
    const repairs: string[] = [];

    // Check parent references
    const validParents = item.parents.filter(parent => {
      if (!itemIds.has(parent.id)) {
        repairs.push(`Removed invalid parent reference: ${parent.id}`);
        needsRepair = true;
        return false;
      }
      return true;
    });

    if (needsRepair) {
      warnings.push(`Item "${item.name}" (${item.id}): ${repairs.join(', ')}`);

      try {
        // Create a new item instance with repaired parents using ItemFactory
        const itemJSON = item.toJSON();
        const repairedJSON = {
          ...itemJSON,
          parents: validParents.map(p => ({ id: p.id, relationshipId: p.relationshipId }))
        };
        const repairedItem = ItemFactory.fromJSON(repairedJSON);
        repairedItems.push(repairedItem);
      } catch (error) {
        warnings.push(`Failed to repair item "${item.name}" (${item.id}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        repairedItems.push(item); // Keep original if repair fails
      }
    } else {
      repairedItems.push(item);
    }
  }

  return { repairedItems, warnings };
}

/**
 * Removes calendar entries that reference non-existent items
 * @param items - Valid items array
 * @param calendar - Calendar to clean
 * @returns Cleaned calendar
 */
export function removeOrphanedCalendarEntries(
  items: Item[],
  calendar: Map<string, BaseCalendarEntry>
): Map<string, BaseCalendarEntry> {
  const itemIds = new Set(items.map(item => item.id));
  const cleanedCalendar = new Map<string, BaseCalendarEntry>();

  for (const [key, entry] of calendar) {
    if (itemIds.has(entry.itemId)) {
      cleanedCalendar.set(key, entry);
    }
    // Silently remove orphaned entries
  }

  return cleanedCalendar;
}

/**
 * Migrates data from one schema version to another
 * @param data - Raw data to migrate
 * @param fromVersion - Source schema version
 * @param toVersion - Target schema version
 * @returns Migration result
 */
export function migrateFromVersion(data: unknown, fromVersion: string, toVersion: string): MigrationResult {
  // For now, we only support the current version
  // Future versions would implement migration logic here

  if (fromVersion === toVersion) {
    // No migration needed
    const validation = validateAndMigrateData(data);

    return {
      success: validation.isValid,
      migratedData: validation.repairedData,
      errors: validation.errors,
      fromVersion,
      toVersion
    };
  }

  // Migration not supported yet
  return {
    success: false,
    errors: [`Migration from version ${fromVersion} to ${toVersion} is not supported`],
    fromVersion,
    toVersion
  };
}

/**
 * Validates all stored data and returns extended validation result
 */
export function validateAllData(): ExtendedValidationResult {
  const startTime = Date.now();

  try {
    // For now, return a basic valid result
    // This will be expanded as needed
    return {
      isValid: true,
      severity: 'info',
      issues: [],
      stats: {
        totalItems: 0,
        totalCalendarEntries: 0,
        orphanedItems: 0,
        brokenRelationships: 0,
        duplicateIds: 0,
        validationTime: Date.now() - startTime
      }
    };
  } catch (error) {
    return {
      isValid: false,
      severity: 'error',
      issues: [{
        type: 'invalid-data',
        severity: 'error',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        autoRepairable: false
      }],
      stats: {
        totalItems: 0,
        totalCalendarEntries: 0,
        orphanedItems: 0,
        brokenRelationships: 0,
        duplicateIds: 0,
        validationTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Variable system validation functions for Step 3
 */

/**
 * Validates VariableDefinitionJSON object
 */
export function validateVariableDefinition(data: unknown): data is VariableDefinitionJSON {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number' &&
    (obj.unit === undefined || typeof obj.unit === 'string') &&
    (obj.category === undefined || typeof obj.category === 'string') &&
    (obj.description === undefined || typeof obj.description === 'string')
  );
}

/**
 * Validates VariableDescriptionJSON object
 */
export function validateVariableDescription(data: unknown): data is VariableDescriptionJSON {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.variableDefinitionId === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  );
}

/**
 * Validates VariableItemJSON object (extends basic ItemJSON validation)
 */
export function validateVariableItem(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    obj.type === 'VariableItem' &&
    typeof obj.duration === 'number' &&
    obj.duration === 0 && // VariableItem duration is always 0
    typeof obj.value === 'number' &&
    Array.isArray(obj.parents) &&
    typeof obj.allOrNothing === 'boolean'
  );
}

/**
 * Validates basic structure of migration result
 */
function validateMigrationStructure(data: VariableMigrationResult): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Migration result is not a valid object');
    return errors;
  }

  if (!(data.definitions instanceof Map)) {
    errors.push('Migration result missing valid definitions Map');
  }

  if (!Array.isArray(data.variableItems)) {
    errors.push('Migration result missing valid variableItems array');
  }

  if (!(data.descriptions instanceof Map)) {
    errors.push('Migration result missing valid descriptions Map');
  }

  if (!Array.isArray(data.migrationLog)) {
    errors.push('Migration result missing valid migrationLog array');
  }

  return errors;
}

/**
 * Validates data consistency in migration result
 */
function validateMigrationConsistency(data: VariableMigrationResult): string[] {
  const errors: string[] = [];

  // Validate variable items have matching definitions
  if (data.definitions && data.variableItems) {
    for (const variableItem of data.variableItems) {
      const hasMatchingDefinition = Array.from(data.definitions.values()).some(
        (def: { name: string }) => def.name === variableItem.name
      );

      if (!hasMatchingDefinition) {
        errors.push(`VariableItem "${variableItem.name}" has no matching definition`);
      }
    }
  }

  // Validate descriptions reference valid definitions
  if (data.definitions && data.descriptions) {
    for (const description of data.descriptions.values()) {
      const hasValidDefinition = Array.from(data.definitions.values()).some(
        (def: { id: string }) => def.id === description.variableDefinitionId
      );

      if (!hasValidDefinition) {
        errors.push(`VariableDescription references non-existent definition ID: ${description.variableDefinitionId}`);
      }
    }
  }

  return errors;
}

/**
 * Validates migrated variable data integrity
 */
export function validateMigratedVariableData(data: VariableMigrationResult): { isValid: boolean; errors: string[] } {
  const structureErrors = validateMigrationStructure(data);
  const consistencyErrors = validateMigrationConsistency(data);

  const allErrors = [...structureErrors, ...consistencyErrors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
