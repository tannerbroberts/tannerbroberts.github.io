import { Variable } from './types';
import { VariableDefinition, VariableDescription } from '../item/types/VariableTypes';
import { VariableItem } from '../item/VariableItem';
import { createVariableDefinition } from './variableDefinitionUtils';
import { createVariableItemFromDefinition } from './variableInstanceUtils';
import { v4 as uuid } from 'uuid';

/**
 * Convert a legacy Variable to a VariableDefinition and VariableItem pair
 */
export function migrateLegacyVariable(
  variable: Variable,
  parentItemId?: string
): {
  definition: VariableDefinition;
  variableItem: VariableItem;
  description?: VariableDescription;
} {
  // Create variable definition
  const definition = createVariableDefinition({
    name: variable.name,
    unit: variable.unit,
    category: variable.category
  });

  // Create variable item instance
  const variableItem = createVariableItemFromDefinition(
    definition,
    variable.quantity,
    {
      // If parentItemId is provided, create parent relationship
      parents: parentItemId ? [{ id: parentItemId, relationshipId: uuid() }] : [],
      description: `Migrated from legacy variable system`
    }
  );

  return {
    definition,
    variableItem
  };
}

/**
 * Migrate all variables for a specific item from legacy format
 */
export function migrateLegacyVariablesForItem(
  itemId: string,
  variables: Variable[]
): {
  definitions: VariableDefinition[];
  variableItems: VariableItem[];
  descriptions: VariableDescription[];
} {
  const definitions: VariableDefinition[] = [];
  const variableItems: VariableItem[] = [];
  const descriptions: VariableDescription[] = [];

  // Track definitions by name to avoid duplicates
  const definitionsByName = new Map<string, VariableDefinition>();

  for (const variable of variables) {
    const normalizedName = variable.name.toLowerCase();

    // Check if we already have a definition for this variable name
    let definition = definitionsByName.get(normalizedName);

    if (!definition) {
      // Create new definition
      definition = createVariableDefinition({
        name: variable.name,
        unit: variable.unit,
        category: variable.category
      });
      definitionsByName.set(normalizedName, definition);
      definitions.push(definition);

      // Create description for the variable
      const description: VariableDescription = {
        id: uuid(),
        variableDefinitionId: definition.id,
        content: `Variable migrated from legacy system. Original name: ${variable.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      descriptions.push(description);
    }

    // Create variable item instance
    const variableItem = createVariableItemFromDefinition(
      definition,
      variable.quantity,
      {
        parents: [{ id: itemId, relationshipId: uuid() }],
        description: `Instance of ${variable.name} (migrated)`
      }
    );
    variableItems.push(variableItem);
  }

  return {
    definitions,
    variableItems,
    descriptions
  };
}

/**
 * Migrate entire legacy variable system to new format
 */
export function migrateLegacyVariableSystem(
  itemVariables: Map<string, Variable[]>
): {
  definitions: Map<string, VariableDefinition>;
  variableItems: VariableItem[];
  descriptions: Map<string, VariableDescription>;
  migrationLog: string[];
} {
  const definitions = new Map<string, VariableDefinition>();
  const variableItems: VariableItem[] = [];
  const descriptions = new Map<string, VariableDescription>();
  const migrationLog: string[] = [];

  // Track global definitions by name to avoid duplicates across items
  const globalDefinitionsByName = new Map<string, VariableDefinition>();

  for (const [itemId, variables] of itemVariables) {
    migrationLog.push(`Migrating ${variables.length} variables for item ${itemId}`);

    for (const variable of variables) {
      const normalizedName = variable.name.toLowerCase();

      // Check if we already have a global definition for this variable name
      let definition = globalDefinitionsByName.get(normalizedName);

      if (!definition) {
        // Create new global definition
        definition = createVariableDefinition({
          name: variable.name,
          unit: variable.unit,
          category: variable.category
        });
        globalDefinitionsByName.set(normalizedName, definition);
        definitions.set(definition.id, definition);

        // Create description for the variable
        const unitText = variable.unit ? ` Unit: ${variable.unit}.` : '';
        const categoryText = variable.category ? ` Category: ${variable.category}.` : '';
        const description: VariableDescription = {
          id: uuid(),
          variableDefinitionId: definition.id,
          content: `Variable "${variable.name}" migrated from legacy system.${unitText}${categoryText}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        descriptions.set(definition.id, description);

        migrationLog.push(`Created definition for variable: ${variable.name}`);
      } else {
        // Update existing definition with additional information if needed
        let updated = false;
        const updates: {
          unit?: string;
          category?: string;
          updatedAt: number;
        } = {
          updatedAt: Date.now()
        };

        if (!definition.unit && variable.unit) {
          updates.unit = variable.unit;
          updated = true;
        }

        if (!definition.category && variable.category) {
          updates.category = variable.category;
          updated = true;
        }

        if (updated) {
          const updatedDefinition = {
            ...definition,
            ...updates
          };
          globalDefinitionsByName.set(normalizedName, updatedDefinition);
          definitions.set(definition.id, updatedDefinition);
          migrationLog.push(`Updated definition for variable: ${variable.name}`);
        }
      }

      // Create variable item instance
      const variableItem = createVariableItemFromDefinition(
        definition,
        variable.quantity,
        {
          parents: [{ id: itemId, relationshipId: uuid() }],
          description: `Migrated instance of ${variable.name}`
        }
      );
      variableItems.push(variableItem);
    }
  }

  migrationLog.push(`Migration complete: ${definitions.size} definitions, ${variableItems.length} variable items created`);

  return {
    definitions,
    variableItems,
    descriptions,
    migrationLog
  };
}

/**
 * Validate migration results
 */
export function validateMigrationResults(
  originalVariables: Map<string, Variable[]>,
  migratedDefinitions: Map<string, VariableDefinition>,
  migratedVariableItems: VariableItem[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count original variables
  let originalCount = 0;
  for (const variables of originalVariables.values()) {
    originalCount += variables.length;
  }

  // Check that we have the same number of variable items
  if (migratedVariableItems.length !== originalCount) {
    errors.push(`Mismatch in variable count: original ${originalCount}, migrated ${migratedVariableItems.length}`);
  }

  // Check that all original variable names have corresponding definitions
  const originalNames = new Set<string>();
  for (const variables of originalVariables.values()) {
    for (const variable of variables) {
      originalNames.add(variable.name.toLowerCase());
    }
  }

  const migratedNames = new Set<string>();
  for (const definition of migratedDefinitions.values()) {
    migratedNames.add(definition.name.toLowerCase());
  }

  for (const originalName of originalNames) {
    if (!migratedNames.has(originalName)) {
      errors.push(`Missing definition for original variable: ${originalName}`);
    }
  }

  // Warn about potential duplicates
  if (migratedDefinitions.size < originalNames.size) {
    warnings.push(`Some variable names were consolidated: ${originalNames.size} unique names became ${migratedDefinitions.size} definitions`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
