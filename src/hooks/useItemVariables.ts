import { useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import {
  setVariableOnItem,
  removeVariableFromItem,
  setVariablesOnItem,
  calculateVariableSummary,
  getTotalVariableQuantity,
  getAllVariableNames,
  hasVariable
} from '../functions/utils/item/itemUtils';

export function useItemVariables(itemId: string) {
  const { items } = useAppState();
  const dispatch = useAppDispatch();

  const item = useMemo(() => {
    return items.find(i => i.id === itemId);
  }, [items, itemId]);

  const variables = useMemo(() => {
    return item?.variables || {};
  }, [item]);

  const variableSummary = useMemo(() => {
    if (!item) return {};
    return calculateVariableSummary(item, items);
  }, [item, items]);

  const setVariable = useCallback((variableName: string, quantity: number) => {
    if (!item) return;
    const updatedItem = setVariableOnItem(item, variableName, quantity);
    dispatch({
      type: 'UPDATE_ITEMS',
      payload: { updatedItems: [updatedItem] }
    });
  }, [item, dispatch]);

  const removeVariable = useCallback((variableName: string) => {
    if (!item) return;
    const updatedItem = removeVariableFromItem(item, variableName);
    dispatch({
      type: 'UPDATE_ITEMS',
      payload: { updatedItems: [updatedItem] }
    });
  }, [item, dispatch]);

  const setVariables = useCallback((newVariables: Record<string, number>) => {
    if (!item) return;
    const updatedItem = setVariablesOnItem(item, newVariables);
    dispatch({
      type: 'UPDATE_ITEMS',
      payload: { updatedItems: [updatedItem] }
    });
  }, [item, dispatch]);

  const getVariableQuantity = useCallback((variableName: string) => {
    if (!item) return 0;
    return getTotalVariableQuantity(item, variableName);
  }, [item]);

  const getVariableNames = useCallback(() => {
    if (!item) return [];
    return getAllVariableNames(item);
  }, [item]);

  const hasVariableNamed = useCallback((variableName: string) => {
    if (!item) return false;
    return hasVariable(item, variableName);
  }, [item]);

  return {
    // Core data
    variables,
    variableSummary,

    // Mutation functions
    setVariable,
    removeVariable,
    setVariables,

    // Query functions
    getVariableQuantity,
    getVariableNames,
    hasVariable: hasVariableNamed
  };
}
