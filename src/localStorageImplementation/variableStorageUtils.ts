import type { VariableDefinition, VariableDescription, VariableDefinitionJSON, VariableDescriptionJSON } from '../functions/utils/item/types/VariableTypes';

/**
 * Specialized utilities for variable storage operations
 */

/**
 * Serialize variable definitions map to array for storage
 */
export function serializeVariableDefinitions(
  definitions: Map<string, VariableDefinition>
): Array<[string, VariableDefinitionJSON]> {
  return Array.from(definitions.entries()).map(([key, definition]) => [
    key,
    {
      id: definition.id,
      name: definition.name,
      unit: definition.unit,
      category: definition.category,
      createdAt: definition.createdAt,
      updatedAt: definition.updatedAt
    }
  ]);
}

/**
 * Deserialize variable definitions from array to map
 */
export function deserializeVariableDefinitions(
  serializedDefinitions: Array<[string, VariableDefinitionJSON]>
): Map<string, VariableDefinition> {
  const definitionsMap = new Map<string, VariableDefinition>();

  for (const [key, defJson] of serializedDefinitions) {
    const definition: VariableDefinition = {
      id: defJson.id,
      name: defJson.name,
      unit: defJson.unit,
      category: defJson.category,
      createdAt: defJson.createdAt,
      updatedAt: defJson.updatedAt
    };

    definitionsMap.set(key, definition);
  }

  return definitionsMap;
}

/**
 * Serialize variable descriptions map to array for storage
 */
export function serializeVariableDescriptions(
  descriptions: Map<string, VariableDescription>
): Array<[string, VariableDescriptionJSON]> {
  return Array.from(descriptions.entries()).map(([key, description]) => [
    key,
    {
      id: description.id,
      variableDefinitionId: description.variableDefinitionId,
      content: description.content,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt
    }
  ]);
}

/**
 * Deserialize variable descriptions from array to map
 */
export function deserializeVariableDescriptions(
  serializedDescriptions: Array<[string, VariableDescriptionJSON]>
): Map<string, VariableDescription> {
  const descriptionsMap = new Map<string, VariableDescription>();

  for (const [key, descJson] of serializedDescriptions) {
    const description: VariableDescription = {
      id: descJson.id,
      variableDefinitionId: descJson.variableDefinitionId,
      content: descJson.content,
      createdAt: descJson.createdAt,
      updatedAt: descJson.updatedAt
    };

    descriptionsMap.set(key, description);
  }

  return descriptionsMap;
}

/**
 * Bulk operations for variable definitions
 */

/**
 * Cleanup utilities for orphaned data
 */
export function cleanupOrphanedVariableDescriptions(
  descriptions: Map<string, VariableDescription>,
  definitions: Map<string, VariableDefinition>
): Map<string, VariableDescription> {
  const cleanedDescriptions = new Map<string, VariableDescription>();

  for (const [key, description] of descriptions.entries()) {
    // Keep description only if its definition exists
    if (definitions.has(description.variableDefinitionId)) {
      cleanedDescriptions.set(key, description);
    }
  }

  return cleanedDescriptions;
}

/**
 * Find orphaned variable definitions (no associated description)
 */
export function findOrphanedDefinitions(
  definitions: Map<string, VariableDefinition>,
  descriptions: Map<string, VariableDescription>
): VariableDefinition[] {
  const orphanedDefinitions: VariableDefinition[] = [];

  for (const [, definition] of definitions.entries()) {
    // Check if any description references this definition
    const hasDescription = Array.from(descriptions.values()).some(
      desc => desc.variableDefinitionId === definition.id
    );

    if (!hasDescription) {
      orphanedDefinitions.push(definition);
    }
  }

  return orphanedDefinitions;
}

/**
 * Storage optimization functions
 */

/**
 * Deduplicate variable definitions with same name/unit/category
 */
export function deduplicateVariableDefinitions(
  definitions: Map<string, VariableDefinition>
): {
  deduplicatedDefinitions: Map<string, VariableDefinition>;
  duplicateMapping: Map<string, string>; // old ID -> new ID
} {
  const deduplicatedDefinitions = new Map<string, VariableDefinition>();
  const duplicateMapping = new Map<string, string>();
  const signatureToId = new Map<string, string>();

  for (const [key, definition] of definitions.entries()) {
    // Create a signature based on name, unit, and category
    const signature = `${definition.name}|${definition.unit || ''}|${definition.category || ''}`;

    const existingId = signatureToId.get(signature);
    if (existingId) {
      // This is a duplicate, map it to the existing definition
      duplicateMapping.set(definition.id, existingId);
    } else {
      // This is unique, keep it
      signatureToId.set(signature, definition.id);
      deduplicatedDefinitions.set(key, definition);
    }
  }

  return { deduplicatedDefinitions, duplicateMapping };
}

/**
 * Update variable descriptions to use deduplicated definition IDs
 */
export function updateDescriptionsForDeduplication(
  descriptions: Map<string, VariableDescription>,
  duplicateMapping: Map<string, string>
): Map<string, VariableDescription> {
  const updatedDescriptions = new Map<string, VariableDescription>();

  for (const [key, description] of descriptions.entries()) {
    const newDefinitionId = duplicateMapping.get(description.variableDefinitionId) || description.variableDefinitionId;

    const updatedDescription: VariableDescription = {
      ...description,
      variableDefinitionId: newDefinitionId
    };

    updatedDescriptions.set(key, updatedDescription);
  }

  return updatedDescriptions;
}

/**
 * Get storage size estimate for variable data
 */
export function estimateVariableStorageSize(
  definitions: Map<string, VariableDefinition>,
  descriptions: Map<string, VariableDescription>
): {
  definitionsSize: number;
  descriptionsSize: number;
  totalSize: number;
} {
  const serializedDefinitions = serializeVariableDefinitions(definitions);
  const serializedDescriptions = serializeVariableDescriptions(descriptions);

  const definitionsSize = JSON.stringify(serializedDefinitions).length;
  const descriptionsSize = JSON.stringify(serializedDescriptions).length;

  return {
    definitionsSize,
    descriptionsSize,
    totalSize: definitionsSize + descriptionsSize
  };
}
