import { VariableItem } from '../item/VariableItem';
import { VariableDefinition } from '../item/types/VariableTypes';
import { Parent } from '../item/Parent';

/**
 * Create a VariableItem instance from a variable definition
 */
export function createVariableItemFromDefinition(
  definition: VariableDefinition,
  value: number,
  options?: {
    parents?: Parent[];
    allOrNothing?: boolean;
    description?: string;
  }
): VariableItem {
  return new VariableItem({
    name: definition.name,
    value,
    description: options?.description,
    parents: options?.parents || [],
    allOrNothing: options?.allOrNothing || false
  });
}

/**
 * Batch create VariableItem instances from definitions and values
 */
export function batchCreateVariableItems(
  items: Array<{
    definition: VariableDefinition;
    value: number;
    options?: {
      parents?: Parent[];
      allOrNothing?: boolean;
      description?: string;
    };
  }>
): Array<{ variableItem: VariableItem; definitionId: string }> {
  return items.map(({ definition, value, options }) => ({
    variableItem: createVariableItemFromDefinition(definition, value, options),
    definitionId: definition.id
  }));
}

/**
 * Get the definition ID associated with a VariableItem
 * This looks up the definition by matching the variable name
 */
export function getDefinitionIdForVariableItem(
  variableItem: VariableItem,
  definitions: Map<string, VariableDefinition>
): string | null {
  for (const [id, definition] of definitions) {
    if (definition.name.toLowerCase() === variableItem.name.toLowerCase()) {
      return id;
    }
  }
  return null;
}

/**
 * Check if a VariableItem matches a VariableDefinition
 */
export function variableItemMatchesDefinition(
  variableItem: VariableItem,
  definition: VariableDefinition
): boolean {
  return variableItem.name.toLowerCase() === definition.name.toLowerCase();
}

/**
 * Get all VariableItems in the items array that match a specific definition
 */
export function getVariableItemsByDefinition(
  items: VariableItem[],
  definition: VariableDefinition
): VariableItem[] {
  return items.filter(item => variableItemMatchesDefinition(item, definition));
}

/**
 * Calculate total value for all instances of a specific variable definition
 */
export function calculateTotalValueForDefinition(
  items: VariableItem[],
  definition: VariableDefinition
): number {
  return getVariableItemsByDefinition(items, definition)
    .reduce((total, item) => total + item.value, 0);
}

/**
 * Group VariableItems by their matching definitions
 */
export function groupVariableItemsByDefinition(
  variableItems: VariableItem[],
  definitions: Map<string, VariableDefinition>
): Map<string, VariableItem[]> {
  const grouped = new Map<string, VariableItem[]>();

  for (const item of variableItems) {
    const definitionId = getDefinitionIdForVariableItem(item, definitions);
    if (definitionId) {
      const existing = grouped.get(definitionId) || [];
      existing.push(item);
      grouped.set(definitionId, existing);
    }
  }

  return grouped;
}

/**
 * Validate that VariableItem values are reasonable
 */
export function validateVariableItemValue(value: number): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(value)) {
    errors.push('Variable value must be a finite number');
  }

  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    errors.push('Variable value is too large');
  }

  return errors;
}

/**
 * Create VariableItem with validation
 */
export function createValidatedVariableItem(
  definition: VariableDefinition,
  value: number,
  options?: {
    parents?: Parent[];
    allOrNothing?: boolean;
    description?: string;
  }
): { variableItem: VariableItem | null; errors: string[] } {
  const errors = validateVariableItemValue(value);

  if (errors.length > 0) {
    return { variableItem: null, errors };
  }

  const variableItem = createVariableItemFromDefinition(definition, value, options);
  return { variableItem, errors: [] };
}

/**
 * Update a VariableItem's value with validation
 */
export function updateVariableItemValue(
  variableItem: VariableItem,
  newValue: number
): { updatedItem: VariableItem | null; errors: string[] } {
  const errors = validateVariableItemValue(newValue);

  if (errors.length > 0) {
    return { updatedItem: null, errors };
  }

  const updatedItem = variableItem.updateValue(newValue);
  return { updatedItem, errors: [] };
}
