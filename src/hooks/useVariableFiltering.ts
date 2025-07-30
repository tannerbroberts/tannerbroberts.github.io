import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppState } from '../reducerContexts/App';
import { Item } from '../functions/utils/item/Item';
import { VariableSummary } from '../functions/utils/variable/types';
import { calculateVariableSummary } from '../functions/utils/variable/utils';
import {
  FilterCriteria,
  VariableFilterCriteria,
  VariableFilterState,
  SavedFilter,
  FilterPerformanceMetrics
} from '../functions/utils/filtering/filterTypes';
import {
  executeVariableFilters,
  optimizeFilterCriteria,
  clearFilterCache,
  invalidateFilterCacheForItem
} from '../functions/utils/filtering/variableFilterEngine';
import { parseVariableFilter } from '../functions/utils/filtering/variableFilterParser';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * Hook for managing variable filtering state and execution
 */
export function useVariableFiltering() {
  const { items, itemVariables } = useAppState();

  // Filter state
  const [filterState, setFilterState] = useState<VariableFilterState>({
    activeFilters: {
      nameFilter: undefined,
      variableFilters: [],
      combineMode: 'AND'
    },
    savedFilters: [],
    recentFilters: [],
    isEnabled: false
  });

  // Raw filter input for debouncing
  const [rawFilterInput, setRawFilterInput] = useState('');
  const debouncedFilterInput = useDebouncedValue(rawFilterInput, 300);

  // Performance tracking
  const [lastPerformance, setLastPerformance] = useState<FilterPerformanceMetrics | null>(null);

  // Cache variable summaries to avoid recalculation
  const variableSummariesRef = useRef<Map<string, VariableSummary>>(new Map());

  // Recalculate variable summaries when items or variables change
  useEffect(() => {
    const summaries = new Map<string, VariableSummary>();

    for (const item of items) {
      const summary = calculateVariableSummary(item, items, itemVariables);
      summaries.set(item.id, summary);
    }

    variableSummariesRef.current = summaries;

    // Clear filter cache when data changes
    clearFilterCache();
  }, [items, itemVariables]);

  // Parse current filter input
  const currentFilterCriteria = useMemo((): FilterCriteria => {
    const baseCriteria = {
      nameFilter: undefined,
      variableFilters: [],
      combineMode: 'AND' as const
    };

    if (!debouncedFilterInput.trim()) {
      return baseCriteria;
    }

    // Check if this looks like a variable filter
    const hasOperators = /[><=!]/.test(debouncedFilterInput);
    const hasNumbers = /\d/.test(debouncedFilterInput);

    if (hasOperators && hasNumbers) {
      // Try to parse as variable filter
      const parseResult = parseVariableFilter(debouncedFilterInput);
      if (parseResult.isValid && parseResult.criteria) {
        return {
          ...baseCriteria,
          variableFilters: [parseResult.criteria]
        };
      }
    } else {
      // Treat as name filter
      return {
        ...baseCriteria,
        nameFilter: debouncedFilterInput
      };
    }

    return baseCriteria;
  }, [debouncedFilterInput]);

  // Execute filters and get results
  const filteredResults = useMemo(() => {
    if (!filterState.isEnabled) {
      return {
        results: items.map(item => ({
          itemId: item.id,
          matchedFilters: [],
          variableValues: {}
        })),
        performance: null
      };
    }

    const optimizedCriteria = optimizeFilterCriteria(currentFilterCriteria);
    const { results, performance } = executeVariableFilters(
      items,
      variableSummariesRef.current,
      optimizedCriteria
    );

    setLastPerformance(performance);
    return { results, performance };
  }, [items, currentFilterCriteria, filterState.isEnabled]);

  // Get available variable names for suggestions  
  const availableVariableNames = useMemo(() => {
    const names = new Set<string>();

    // Recalculate from items and itemVariables directly
    for (const item of items) {
      const summary = calculateVariableSummary(item, items, itemVariables);
      Object.keys(summary).forEach(name => names.add(name));
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [items, itemVariables]);

  // Callbacks
  const setRawInput = useCallback((input: string) => {
    setRawFilterInput(input);
  }, []);

  const enableFiltering = useCallback((enabled: boolean) => {
    setFilterState(prev => ({
      ...prev,
      isEnabled: enabled
    }));
  }, []);

  const addVariableFilter = useCallback((criteria: VariableFilterCriteria) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        variableFilters: [...prev.activeFilters.variableFilters, criteria]
      }
    }));
  }, []);

  const removeVariableFilter = useCallback((index: number) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        variableFilters: prev.activeFilters.variableFilters.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setRawFilterInput('');
    setFilterState(prev => ({
      ...prev,
      activeFilters: {
        nameFilter: undefined,
        variableFilters: [],
        combineMode: 'AND'
      }
    }));
  }, []);

  const setCombineMode = useCallback((mode: 'AND' | 'OR') => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        combineMode: mode
      }
    }));
  }, []);

  const saveCurrentFilter = useCallback((name: string) => {
    const filter: SavedFilter = {
      id: Date.now().toString(),
      name,
      criteria: currentFilterCriteria,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 1
    };

    setFilterState(prev => ({
      ...prev,
      savedFilters: [...prev.savedFilters, filter]
    }));
  }, [currentFilterCriteria]);

  const loadSavedFilter = useCallback((filterId: string) => {
    const filter = filterState.savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilterState(prev => ({
        ...prev,
        activeFilters: filter.criteria,
        savedFilters: prev.savedFilters.map(f =>
          f.id === filterId
            ? { ...f, lastUsed: Date.now(), useCount: f.useCount + 1 }
            : f
        )
      }));
    }
  }, [filterState.savedFilters]);

  const deleteSavedFilter = useCallback((filterId: string) => {
    setFilterState(prev => ({
      ...prev,
      savedFilters: prev.savedFilters.filter(f => f.id !== filterId)
    }));
  }, []);

  const invalidateItemCache = useCallback((itemId: string) => {
    invalidateFilterCacheForItem(itemId);
  }, []);

  // Get filtered items as Item objects
  const filteredItems = useMemo(() => {
    return filteredResults.results
      .map(result => items.find(item => item.id === result.itemId))
      .filter((item): item is Item => item !== undefined);
  }, [filteredResults.results, items]);

  return {
    // State
    filterState,
    rawFilterInput,
    currentFilterCriteria,
    availableVariableNames,
    lastPerformance,

    // Results
    filteredResults: filteredResults.results,
    filteredItems,

    // Actions
    setRawInput,
    enableFiltering,
    addVariableFilter,
    removeVariableFilter,
    clearAllFilters,
    setCombineMode,
    saveCurrentFilter,
    loadSavedFilter,
    deleteSavedFilter,
    invalidateItemCache,

    // Utilities
    isFiltering: filterState.isEnabled,
    hasActiveFilters: currentFilterCriteria.nameFilter || currentFilterCriteria.variableFilters.length > 0,
    filterCount: currentFilterCriteria.variableFilters.length + (currentFilterCriteria.nameFilter ? 1 : 0)
  };
}
