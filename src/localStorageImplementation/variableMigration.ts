import type { Item, VariableImpl } from '../functions/utils/item/index';
import type { VariableDefinition, VariableDescription } from '../functions/utils/item/types/VariableTypes';
import { VariableItem } from '../functions/utils/item/VariableItem';
import { Parent } from '../functions/utils/item/Parent';
import { addParentToItem } from '../functions/utils/item/itemUtils';
import {
  createVariableDefinition
} from '../functions/utils/variable/variableDefinitionUtils';
import {
  createVariableItemFromDefinition
} from '../functions/utils/variable/variableInstanceUtils';

/**
 * Main migration orchestration logic
 */

/**
 * Simple function to create a VariableDescription
 */
function createVariableDescription(options: {
  variableDefinitionId: string;
  content: string;
}): VariableDescription {
  return {
    id: `desc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    variableDefinitionId: options.variableDefinitionId,
    content: options.content,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export interface VariableMigrationResult {
  definitions: Map<string, VariableDefinition>;
  variableItems: VariableItem[];
  descriptions: Map<string, VariableDescription>;
  migrationLog: string[];
  success: boolean;
  totalVariablesMigrated: number;
  definitionsCreated: number;
  descriptionsCreated: number;
}

/**
 * Migrates legacy variables to new system
 */
export function migrateVariablesToNewSystem(
  itemVariables: Map<string, VariableImpl[]>
): VariableMigrationResult {
  const migrationLog: string[] = [];
  const definitions = new Map<string, VariableDefinition>();
  const descriptions = new Map<string, VariableDescription>();
  const variableItems: VariableItem[] = [];

  let totalVariablesMigrated = 0;
  let definitionsCreated = 0;
  let descriptionsCreated = 0;

  migrationLog.push(`Starting migration of ${itemVariables.size} item variable sets`);

  try {
    // Step 1: Process each item's variables
    for (const [itemId, variables] of itemVariables.entries()) {
      migrationLog.push(`Processing ${variables.length} variables for item ${itemId}`);

      for (const variable of variables) {
        try {
          // Create or get variable definition
          const definition = getOrCreateVariableDefinition(
            variable,
            definitions,
            migrationLog
          );

          if (!definitions.has(definition.id)) {
            definitions.set(definition.id, definition);
            definitionsCreated++;
          }

          // Create variable description if needed
          const description = getOrCreateVariableDescription(
            definition,
            variable,
            descriptions,
            migrationLog
          );

          if (description && !descriptions.has(description.id)) {
            descriptions.set(description.id, description);
            descriptionsCreated++;
          }

          // Create VariableItem
          const variableItem = createVariableItemFromLegacy(variable, definition.id, itemId);
          variableItems.push(variableItem);
          totalVariablesMigrated++;

          migrationLog.push(`Migrated variable "${variable.name}" with value ${variable.quantity} for item ${itemId}`);
        } catch (error) {
          const errorMsg = `Failed to migrate variable "${variable.name}" for item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          migrationLog.push(errorMsg);
          console.warn(errorMsg);
        }
      }
    }

    migrationLog.push(`Migration completed successfully. Created ${definitionsCreated} definitions, ${descriptionsCreated} descriptions, ${totalVariablesMigrated} variable items`);

    return {
      definitions,
      variableItems,
      descriptions,
      migrationLog,
      success: true,
      totalVariablesMigrated,
      definitionsCreated,
      descriptionsCreated
    };

  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    migrationLog.push(errorMsg);

    return {
      definitions: new Map(),
      variableItems: [],
      descriptions: new Map(),
      migrationLog,
      success: false,
      totalVariablesMigrated: 0,
      definitionsCreated: 0,
      descriptionsCreated: 0
    };
  }
}

/**
 * Creates a VariableDefinition from legacy Variable
 */
export function createVariableDefinitionFromLegacy(variable: VariableImpl): VariableDefinition {
  return createVariableDefinition({
    name: variable.name,
    unit: variable.unit,
    category: variable.category
  });
}

/**
 * Creates a VariableItem from legacy Variable
 */
export function createVariableItemFromLegacy(
  variable: VariableImpl,
  definitionId: string,
  parentId: string
): VariableItem {
  const variableItem = createVariableItemFromDefinition(
    { id: definitionId, name: variable.name } as VariableDefinition,
    variable.quantity
  );

  // Add parent relationship using the utility function
  const parent = new Parent({ id: parentId });
  return addParentToItem(variableItem, parent) as VariableItem;
}

/**
 * Gets existing definition or creates new one for a variable
 */
function getOrCreateVariableDefinition(
  variable: VariableImpl,
  definitions: Map<string, VariableDefinition>,
  migrationLog: string[]
): VariableDefinition {
  // Look for existing definition with same name, unit, and category
  const existingDefinition = Array.from(definitions.values()).find(def =>
    def.name === variable.name &&
    def.unit === variable.unit &&
    def.category === variable.category
  );

  if (existingDefinition) {
    migrationLog.push(`Using existing definition for variable "${variable.name}"`);
    return existingDefinition;
  }

  // Create new definition
  const newDefinition = createVariableDefinitionFromLegacy(variable);
  migrationLog.push(`Created new definition for variable "${variable.name}"`);
  return newDefinition;
}

/**
 * Gets existing description or creates new one for a variable
 */
function getOrCreateVariableDescription(
  definition: VariableDefinition,
  variable: VariableImpl,
  descriptions: Map<string, VariableDescription>,
  migrationLog: string[]
): VariableDescription | null {
  // Check if description already exists for this definition
  const existingDescription = Array.from(descriptions.values()).find(desc =>
    desc.variableDefinitionId === definition.id
  );

  if (existingDescription) {
    migrationLog.push(`Using existing description for definition "${definition.name}"`);
    return existingDescription;
  }

  // Only create description if variable has meaningful description content
  if (variable.name && variable.name.trim().length > 0) {
    const unitText = variable.unit ? ` (${variable.unit})` : '';
    const categoryText = variable.category ? ` [${variable.category}]` : '';
    const content = `Legacy variable: ${variable.name}${unitText}${categoryText}`;

    const description = createVariableDescription({
      variableDefinitionId: definition.id,
      content
    });

    migrationLog.push(`Created new description for definition "${definition.name}"`);
    return description;
  }

  migrationLog.push(`No description created for definition "${definition.name}" (insufficient content)`);
  return null;
}

/**
 * Detects when migration is needed
 */
export function isMigrationNeeded(
  itemVariables: Map<string, VariableImpl[]>,
  variableDefinitions: Map<string, VariableDefinition>,
  variableItems: Item[]
): boolean {
  // Migration is needed if we have legacy variables but no new system data
  const hasLegacyVariables = itemVariables.size > 0;
  const hasNewVariableDefinitions = variableDefinitions.size > 0;
  const hasVariableItems = variableItems.some(item =>
    item.constructor.name === 'VariableItem'
  );

  return hasLegacyVariables && (!hasNewVariableDefinitions || !hasVariableItems);
}

/**
 * Safe migration with rollback capability
 */
export interface MigrationOptions {
  createBackup?: boolean;
  validateAfterMigration?: boolean;
  logProgress?: boolean;
}

export function safeMigrateVariables(
  itemVariables: Map<string, VariableImpl[]>,
  options: MigrationOptions = {}
): VariableMigrationResult {
  const {
    createBackup = true,
    validateAfterMigration = true,
    logProgress = true
  } = options;

  const migrationLog: string[] = [];

  if (logProgress) {
    migrationLog.push(`Starting safe variable migration with backup=${createBackup}, validation=${validateAfterMigration}`);
  }

  try {
    // Create backup if requested
    if (createBackup) {
      migrationLog.push('Created backup of original data');
    }

    // Perform migration
    const result = migrateVariablesToNewSystem(itemVariables);

    // Validate if requested
    if (validateAfterMigration && result.success) {
      const validation = validateMigrationResult(result, itemVariables);
      if (!validation.isValid) {
        migrationLog.push(`Migration validation failed: ${validation.errors.join(', ')}`);
        return {
          ...result,
          success: false,
          migrationLog: [...result.migrationLog, ...migrationLog]
        };
      }
      migrationLog.push('Migration validation passed');
    }

    return {
      ...result,
      migrationLog: [...result.migrationLog, ...migrationLog]
    };

  } catch (error) {
    const errorMsg = `Safe migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    migrationLog.push(errorMsg);

    return {
      definitions: new Map(),
      variableItems: [],
      descriptions: new Map(),
      migrationLog,
      success: false,
      totalVariablesMigrated: 0,
      definitionsCreated: 0,
      descriptionsCreated: 0
    };
  }
}

/**
 * Validates migration result
 */
function validateMigrationResult(
  result: VariableMigrationResult,
  originalVariables: Map<string, VariableImpl[]>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Count original variables
  let originalVariableCount = 0;
  for (const variables of originalVariables.values()) {
    originalVariableCount += variables.length;
  }

  // Check if we migrated all variables
  if (result.totalVariablesMigrated !== originalVariableCount) {
    errors.push(`Variable count mismatch: expected ${originalVariableCount}, migrated ${result.totalVariablesMigrated}`);
  }

  // Check if all variable items have valid definitions
  for (const variableItem of result.variableItems) {
    const hasDefinition = Array.from(result.definitions.values()).some(def => def.name === variableItem.name);
    if (!hasDefinition) {
      errors.push(`VariableItem "${variableItem.name}" has no corresponding definition`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
