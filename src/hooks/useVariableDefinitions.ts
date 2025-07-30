import { useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import { VariableDefinition } from '../functions/utils/item/types/VariableTypes';

/**
 * Hook for managing variable definitions
 */
export function useVariableDefinitions() {
  const dispatch = useAppDispatch();
  const { variableDefinitions: variableDefinitionsMap } = useAppState();

  // Get all variable definitions from state (convert Map to array)
  const variableDefinitions = useMemo(() => {
    return Array.from(variableDefinitionsMap.values());
  }, [variableDefinitionsMap]);

  // Check if a variable exists by name
  const checkVariableExists = useCallback((name: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return variableDefinitions.some(def => def.name === normalizedName);
  }, [variableDefinitions]);

  // Get variable definition by name
  const getVariableDefinition = useCallback((name: string): VariableDefinition | undefined => {
    const normalizedName = name.trim().toLowerCase();
    return variableDefinitions.find(def => def.name === normalizedName);
  }, [variableDefinitions]);

  // Create a new variable definition
  const createVariableDefinition = useCallback((data: {
    name: string;
    description?: string;
    unit?: string;
    category?: string;
  }) => {
    const now = Date.now();
    const newDefinition: VariableDefinition = {
      id: `var_def_${now}_${Math.random().toString(36).substring(2, 11)}`,
      name: data.name.trim().toLowerCase(),
      description: data.description,
      unit: data.unit,
      category: data.category,
      createdAt: now,
      updatedAt: now
    };

    dispatch({
      type: 'CREATE_VARIABLE_DEFINITION',
      payload: { definition: newDefinition }
    });

    return newDefinition;
  }, [dispatch]);

  // Update an existing variable definition
  const updateVariableDefinition = useCallback((id: string, updates: {
    description?: string;
    unit?: string;
    category?: string;
  }) => {
    dispatch({
      type: 'UPDATE_VARIABLE_DEFINITION',
      payload: {
        definitionId: id,
        updates: {
          ...updates,
          updatedAt: Date.now()
        }
      }
    });
  }, [dispatch]);

  // Delete a variable definition
  const deleteVariableDefinition = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_VARIABLE_DEFINITION',
      payload: { definitionId: id }
    });
  }, [dispatch]);

  // Get definitions by category
  const getDefinitionsByCategory = useCallback((category: string): VariableDefinition[] => {
    return variableDefinitions.filter(def => def.category === category);
  }, [variableDefinitions]);

  // Get all unique units
  const getAllUnits = useCallback((): string[] => {
    const units = new Set<string>();
    variableDefinitions.forEach(def => {
      if (def.unit) {
        units.add(def.unit);
      }
    });
    return Array.from(units).sort((a, b) => a.localeCompare(b));
  }, [variableDefinitions]);

  // Get all unique categories
  const getAllCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    variableDefinitions.forEach(def => {
      if (def.category) {
        categories.add(def.category);
      }
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [variableDefinitions]);

  return {
    variableDefinitions,
    checkVariableExists,
    getVariableDefinition,
    createVariableDefinition,
    updateVariableDefinition,
    deleteVariableDefinition,
    getDefinitionsByCategory,
    getAllUnits,
    getAllCategories
  };
}
