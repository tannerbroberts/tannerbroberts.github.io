import { VariableDefinition } from '../item/types/VariableTypes';
import { v4 as uuid } from 'uuid';

/**
 * Create a new variable definition
 */
export function createVariableDefinition({
  name,
  unit,
  category
}: {
  name: string;
  unit?: string;
  category?: string;
}): VariableDefinition {
  const now = Date.now();
  return {
    id: uuid(),
    name: name.trim(),
    unit: unit?.trim(),
    category: category?.trim(),
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Check if a variable definition name already exists
 */
export function isVariableNameUnique(
  name: string,
  definitions: Map<string, VariableDefinition>,
  excludeId?: string
): boolean {
  const normalizedName = name.trim().toLowerCase();

  for (const [id, definition] of definitions) {
    if (excludeId && id === excludeId) continue;
    if (definition.name.toLowerCase() === normalizedName) {
      return false;
    }
  }

  return true;
}

/**
 * Find variable definition by name (case-insensitive)
 */
export function findVariableDefinitionByName(
  name: string,
  definitions: Map<string, VariableDefinition>
): VariableDefinition | null {
  const normalizedName = name.trim().toLowerCase();

  for (const definition of definitions.values()) {
    if (definition.name.toLowerCase() === normalizedName) {
      return definition;
    }
  }

  return null;
}

/**
 * Get all unique units from variable definitions
 */
export function getUniqueUnits(definitions: Map<string, VariableDefinition>): string[] {
  const units = new Set<string>();

  for (const definition of definitions.values()) {
    if (definition.unit) {
      units.add(definition.unit);
    }
  }

  return Array.from(units).sort((a, b) => a.localeCompare(b));
}

/**
 * Get all unique categories from variable definitions
 */
export function getUniqueCategories(definitions: Map<string, VariableDefinition>): string[] {
  const categories = new Set<string>();

  for (const definition of definitions.values()) {
    if (definition.category) {
      categories.add(definition.category);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

/**
 * Update a variable definition with validation
 */
export function updateVariableDefinition(
  definition: VariableDefinition,
  updates: Partial<Omit<VariableDefinition, 'id' | 'createdAt' | 'updatedAt'>>,
  allDefinitions: Map<string, VariableDefinition>
): VariableDefinition {
  // Validate name uniqueness if name is being updated
  if (updates.name && updates.name !== definition.name) {
    if (!isVariableNameUnique(updates.name, allDefinitions, definition.id)) {
      throw new Error(`Variable name "${updates.name}" already exists`);
    }
  }

  return {
    ...definition,
    ...updates,
    name: updates.name?.trim() || definition.name,
    unit: updates.unit?.trim(),
    category: updates.category?.trim(),
    updatedAt: Date.now()
  };
}

/**
 * Get variable definitions sorted by name
 */
export function getSortedVariableDefinitions(
  definitions: Map<string, VariableDefinition>
): VariableDefinition[] {
  return Array.from(definitions.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

/**
 * Get variable definitions filtered by category
 */
export function getVariableDefinitionsByCategory(
  definitions: Map<string, VariableDefinition>,
  category: string
): VariableDefinition[] {
  return Array.from(definitions.values()).filter(def =>
    def.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Validate variable definition data
 */
export function validateVariableDefinition(data: {
  name?: string;
  unit?: string;
  category?: string;
}): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Variable name is required');
  }

  if (data.name && data.name.trim().length > 100) {
    errors.push('Variable name must be 100 characters or less');
  }

  if (data.unit && data.unit.trim().length > 50) {
    errors.push('Unit must be 50 characters or less');
  }

  if (data.category && data.category.trim().length > 50) {
    errors.push('Category must be 50 characters or less');
  }

  return errors;
}
