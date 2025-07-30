import { useCallback } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import { VariableDescription } from '../functions/utils/item/types/VariableTypes';
import { extractVariableReferences, validateVariableLinks, detectCircularReferences } from '../functions/utils/variable/linkParser';

export interface VariableLinkMetadata {
  readonly definitionId: string;
  readonly variableName: string;
  readonly description: VariableDescription;
  readonly referencesCount: number;
  readonly referencedByCount: number;
  readonly hasCircularReferences: boolean;
}

export interface UseVariableLinksReturn {
  // Get all variable links metadata
  getAllLinkMetadata: () => VariableLinkMetadata[];

  // Get variables that reference a specific variable
  getVariablesReferencingVariable: (definitionId: string) => VariableLinkMetadata[];

  // Get variables referenced by a specific variable
  getVariablesReferencedByVariable: (definitionId: string) => VariableLinkMetadata[];

  // Update bidirectional references when description changes
  updateVariableLinks: (definitionId: string, newContent: string) => void;

  // Get link validation for a specific description
  getValidationForDescription: (content: string) => ReturnType<typeof validateVariableLinks>;

  // Check for circular references in the system
  checkCircularReferences: () => Array<{ path: string[]; variableNames: string[] }>;

  // Get navigation path between two variables
  getNavigationPath: (fromId: string, toId: string) => string[] | null;

  // Cache management
  invalidateLinkCache: () => void;
  refreshLinkCache: () => void;
}

interface LinkCache {
  metadata: Map<string, VariableLinkMetadata>;
  referencesMap: Map<string, string[]>; // definitionId -> array of referenced definition IDs
  referencedByMap: Map<string, string[]>; // definitionId -> array of definition IDs that reference this one
  circularReferences: Array<{ path: string[]; variableNames: string[] }>;
  lastUpdated: number;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

let linkCache: LinkCache | null = null;

/**
 * Hook for managing variable cross-references and navigation
 */
export function useVariableLinks(): UseVariableLinksReturn {
  const { variableDefinitions, variableDescriptions } = useAppState();
  const dispatch = useAppDispatch();

  // Build or update cache if needed
  const ensureCache = useCallback(() => {
    const now = Date.now();
    
    if (linkCache && (now - linkCache.lastUpdated) < CACHE_DURATION) {
      return linkCache;
    }

    // Build new cache
    const metadata = new Map<string, VariableLinkMetadata>();
    const referencesMap = new Map<string, string[]>();
    const referencedByMap = new Map<string, string[]>();

    // Initialize maps
    variableDefinitions.forEach(def => {
      referencesMap.set(def.id, []);
      referencedByMap.set(def.id, []);
    });

    // Process all descriptions to build reference maps
    variableDescriptions.forEach(desc => {
      const referencedIds = extractVariableReferences(desc.content, variableDefinitions);
      referencesMap.set(desc.variableDefinitionId, referencedIds);

      // Update reverse references
      referencedIds.forEach(referencedId => {
        const existingReferences = referencedByMap.get(referencedId) || [];
        existingReferences.push(desc.variableDefinitionId);
        referencedByMap.set(referencedId, existingReferences);
      });
    });

    // Detect circular references
    const descriptions = new Map<string, { content: string; variableDefinitionId: string }>();
    variableDescriptions.forEach(desc => {
      descriptions.set(desc.variableDefinitionId, {
        content: desc.content,
        variableDefinitionId: desc.variableDefinitionId
      });
    });
    const circularReferences = detectCircularReferences(descriptions, variableDefinitions);

    // Build metadata
    variableDefinitions.forEach(def => {
      const description = variableDescriptions.get(def.id);
      if (description) {
        const referencesCount = referencesMap.get(def.id)?.length || 0;
        const referencedByCount = referencedByMap.get(def.id)?.length || 0;
        const hasCircularReferences = circularReferences.some(cycle => 
          cycle.path.includes(def.id)
        );

        metadata.set(def.id, {
          definitionId: def.id,
          variableName: def.name,
          description,
          referencesCount,
          referencedByCount,
          hasCircularReferences
        });
      }
    });

    linkCache = {
      metadata,
      referencesMap,
      referencedByMap,
      circularReferences,
      lastUpdated: now
    };

    return linkCache;
  }, [variableDefinitions, variableDescriptions]);

  const getAllLinkMetadata = useCallback((): VariableLinkMetadata[] => {
    const cache = ensureCache();
    return Array.from(cache.metadata.values());
  }, [ensureCache]);

  const getVariablesReferencingVariable = useCallback((definitionId: string): VariableLinkMetadata[] => {
    const cache = ensureCache();
    const referencingIds = cache.referencedByMap.get(definitionId) || [];
    
    return referencingIds
      .map(id => cache.metadata.get(id))
      .filter((metadata): metadata is VariableLinkMetadata => metadata !== undefined);
  }, [ensureCache]);

  const getVariablesReferencedByVariable = useCallback((definitionId: string): VariableLinkMetadata[] => {
    const cache = ensureCache();
    const referencedIds = cache.referencesMap.get(definitionId) || [];
    
    return referencedIds
      .map(id => cache.metadata.get(id))
      .filter((metadata): metadata is VariableLinkMetadata => metadata !== undefined);
  }, [ensureCache]);

  const updateVariableLinks = useCallback((definitionId: string, newContent: string) => {
    // Get existing description to update it
    const existingDescription = variableDescriptions.get(definitionId);
    if (!existingDescription) return;

    const updatedDescription: VariableDescription = {
      ...existingDescription,
      content: newContent,
      updatedAt: Date.now()
    };

    dispatch({
      type: 'UPDATE_VARIABLE_DESCRIPTION',
      payload: {
        definitionId,
        description: updatedDescription
      }
    });

    // Invalidate cache to force refresh
    linkCache = null;
  }, [dispatch, variableDescriptions]);

  const getValidationForDescription = useCallback((content: string) => {
    return validateVariableLinks(content, variableDefinitions);
  }, [variableDefinitions]);

  const checkCircularReferences = useCallback(() => {
    const cache = ensureCache();
    return cache.circularReferences;
  }, [ensureCache]);

  const getNavigationPath = useCallback((fromId: string, toId: string): string[] | null => {
    const cache = ensureCache();
    
    // Simple BFS to find shortest path
    const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.id === toId) {
        return current.path;
      }
      
      if (visited.has(current.id)) {
        continue;
      }
      
      visited.add(current.id);
      
      // Add all variables referenced by current variable
      const referencedIds = cache.referencesMap.get(current.id) || [];
      referencedIds.forEach(refId => {
        if (!visited.has(refId)) {
          queue.push({ id: refId, path: [...current.path, refId] });
        }
      });
    }
    
    return null; // No path found
  }, [ensureCache]);

  const invalidateLinkCache = useCallback(() => {
    linkCache = null;
  }, []);

  const refreshLinkCache = useCallback(() => {
    linkCache = null;
    ensureCache();
  }, [ensureCache]);

  return {
    getAllLinkMetadata,
    getVariablesReferencingVariable,
    getVariablesReferencedByVariable,
    updateVariableLinks,
    getValidationForDescription,
    checkCircularReferences,
    getNavigationPath,
    invalidateLinkCache,
    refreshLinkCache
  };
}
