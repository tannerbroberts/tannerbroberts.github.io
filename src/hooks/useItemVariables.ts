import { useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import {
  Variable,
  calculateVariableSummary
} from '../functions/utils/item/index';

export function useItemVariables(itemId: string) {
  const { items, itemVariables, variableSummaryCache } = useAppState();
  const dispatch = useAppDispatch();

  const itemVariableList = useMemo(() => {
    return itemVariables.get(itemId) || [];
  }, [itemVariables, itemId]);

  const variableSummary = useMemo(() => {
    // Check cache first
    const cached = variableSummaryCache.get(itemId);
    if (cached) return cached;

    // Calculate and cache
    const item = items.find(i => i.id === itemId);
    if (!item) return {};

    const summary = calculateVariableSummary(item, items, itemVariables);

    // Update cache
    dispatch({
      type: 'UPDATE_VARIABLE_CACHE',
      payload: { itemId, summary }
    });

    return summary;
  }, [itemId, items, itemVariables, variableSummaryCache, dispatch]);

  const setVariables = useCallback((variables: Variable[]) => {
    dispatch({
      type: 'SET_ITEM_VARIABLES',
      payload: { itemId, variables }
    });
  }, [dispatch, itemId]);

  const addVariable = useCallback((variable: Variable) => {
    dispatch({
      type: 'ADD_ITEM_VARIABLE',
      payload: { itemId, variable }
    });
  }, [dispatch, itemId]);

  const removeVariable = useCallback((variableIndex: number) => {
    dispatch({
      type: 'REMOVE_ITEM_VARIABLE',
      payload: { itemId, variableIndex }
    });
  }, [dispatch, itemId]);

  const updateVariable = useCallback((variableIndex: number, variable: Variable) => {
    dispatch({
      type: 'UPDATE_ITEM_VARIABLE',
      payload: { itemId, variableIndex, variable }
    });
  }, [dispatch, itemId]);

  return {
    variables: itemVariableList,
    variableSummary,
    setVariables,
    addVariable,
    removeVariable,
    updateVariable
  };
}
