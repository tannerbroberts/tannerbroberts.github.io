import { useCallback, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import { VariableDescription } from '../functions/utils/item/types/VariableTypes';
import { v4 as uuid } from 'uuid';

export interface UseVariableDescriptionsReturn {
  // Get description for a variable definition
  getDescription: (definitionId: string) => VariableDescription | undefined;

  // Set/update description for a variable definition
  setDescription: (definitionId: string, content: string) => void;

  // Update existing description
  updateDescription: (definitionId: string, content: string) => void;

  // Delete description
  deleteDescription: (definitionId: string) => void;

  // Search descriptions by text
  searchDescriptions: (searchTerm: string) => Array<{
    definitionId: string;
    description: VariableDescription;
    variableName: string;
  }>;

  // Get all descriptions
  getAllDescriptions: () => Map<string, VariableDescription>;

  // Get descriptions that reference a specific variable
  getDescriptionsReferencingVariable: (variableName: string) => Array<{
    definitionId: string;
    description: VariableDescription;
    variableName: string;
  }>;

  // Batch operations
  batchUpdateDescriptions: (updates: Array<{
    definitionId: string;
    content: string;
  }>) => void;
}

/**
 * Hook for managing variable descriptions
 * Provides CRUD operations and search functionality for variable descriptions
 */
export function useVariableDescriptions(): UseVariableDescriptionsReturn {
  const { variableDescriptions, variableDefinitions } = useAppState();
  const dispatch = useAppDispatch();

  const getDescription = useCallback((definitionId: string): VariableDescription | undefined => {
    return variableDescriptions.get(definitionId);
  }, [variableDescriptions]);

  const setDescription = useCallback((definitionId: string, content: string) => {
    const definition = variableDefinitions.get(definitionId);
    if (!definition) {
      console.warn(`Variable definition ${definitionId} not found`);
      return;
    }

    const description: VariableDescription = {
      id: uuid(),
      variableDefinitionId: definitionId,
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    dispatch({
      type: 'SET_VARIABLE_DESCRIPTION',
      payload: { definitionId, description }
    });
  }, [dispatch, variableDefinitions]);

  const updateDescription = useCallback((definitionId: string, content: string) => {
    const existingDescription = variableDescriptions.get(definitionId);
    if (!existingDescription) {
      console.warn(`Description for variable definition ${definitionId} not found`);
      return;
    }

    const updatedDescription: VariableDescription = {
      ...existingDescription,
      content: content.trim(),
      updatedAt: Date.now()
    };

    dispatch({
      type: 'UPDATE_VARIABLE_DESCRIPTION',
      payload: { definitionId, description: updatedDescription }
    });
  }, [dispatch, variableDescriptions]);

  const deleteDescription = useCallback((definitionId: string) => {
    dispatch({
      type: 'DELETE_VARIABLE_DEFINITION',
      payload: { definitionId }
    });
  }, [dispatch]);

  const searchDescriptions = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return [];
    }

    const results: Array<{
      definitionId: string;
      description: VariableDescription;
      variableName: string;
    }> = [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    for (const [definitionId, description] of variableDescriptions) {
      const definition = variableDefinitions.get(definitionId);
      if (!definition) continue;

      // Search in description content and variable name
      const contentMatches = description.content.toLowerCase().includes(lowerSearchTerm);
      const nameMatches = definition.name.toLowerCase().includes(lowerSearchTerm);

      if (contentMatches || nameMatches) {
        results.push({
          definitionId,
          description,
          variableName: definition.name
        });
      }
    }

    // Sort by relevance (name matches first, then by last updated)
    return results.sort((a, b) => {
      const aNameMatch = a.variableName.toLowerCase().includes(lowerSearchTerm);
      const bNameMatch = b.variableName.toLowerCase().includes(lowerSearchTerm);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      return b.description.updatedAt - a.description.updatedAt;
    });
  }, [variableDescriptions, variableDefinitions]);

  const getAllDescriptions = useCallback(() => {
    return new Map(variableDescriptions);
  }, [variableDescriptions]);

  const getDescriptionsReferencingVariable = useCallback((variableName: string) => {
    const results: Array<{
      definitionId: string;
      description: VariableDescription;
      variableName: string;
    }> = [];

    for (const [definitionId, description] of variableDescriptions) {
      const definition = variableDefinitions.get(definitionId);
      if (!definition) continue;

      // Check if this description references the specified variable using [variable_name] syntax
      const referencesVariable = description.content.includes(`[${variableName}]`);

      if (referencesVariable) {
        results.push({
          definitionId,
          description,
          variableName: definition.name
        });
      }
    }

    return results.sort((a, b) => b.description.updatedAt - a.description.updatedAt);
  }, [variableDescriptions, variableDefinitions]);

  const batchUpdateDescriptions = useCallback((updates: Array<{
    definitionId: string;
    content: string;
  }>) => {
    const actions = updates.map(({ definitionId, content }) => {
      const definition = variableDefinitions.get(definitionId);
      if (!definition) {
        console.warn(`Variable definition ${definitionId} not found for batch update`);
        return null;
      }

      const description: VariableDescription = {
        id: uuid(),
        variableDefinitionId: definitionId,
        content: content.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      return {
        type: 'SET_VARIABLE_DESCRIPTION' as const,
        payload: { definitionId, description }
      };
    }).filter((action): action is NonNullable<typeof action> => action !== null);

    if (actions.length > 0) {
      dispatch({
        type: 'BATCH',
        payload: actions
      });
    }
  }, [dispatch, variableDefinitions]);

  return useMemo(() => ({
    getDescription,
    setDescription,
    updateDescription,
    deleteDescription,
    searchDescriptions,
    getAllDescriptions,
    getDescriptionsReferencingVariable,
    batchUpdateDescriptions
  }), [
    getDescription,
    setDescription,
    updateDescription,
    deleteDescription,
    searchDescriptions,
    getAllDescriptions,
    getDescriptionsReferencingVariable,
    batchUpdateDescriptions
  ]);
}
