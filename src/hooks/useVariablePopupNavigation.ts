import { useState, useCallback, useMemo } from 'react';

export interface NavigationHistoryEntry {
  definitionId: string;
  variableName: string;
  timestamp: number;
}

export interface UseVariablePopupNavigationOptions {
  maxHistoryLength?: number;
}

export interface UseVariablePopupNavigationReturn {
  currentVariable: NavigationHistoryEntry | null;
  history: NavigationHistoryEntry[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  navigateToVariable: (definitionId: string, variableName: string) => void;
  goBack: () => void;
  goForward: () => void;
  clearHistory: () => void;
  getNavigationPath: () => string[];
}

const DEFAULT_MAX_HISTORY = 50;

export function useVariablePopupNavigation(
  options: UseVariablePopupNavigationOptions = {}
): UseVariablePopupNavigationReturn {
  const { maxHistoryLength = DEFAULT_MAX_HISTORY } = options;

  const [history, setHistory] = useState<NavigationHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Current variable is the one at the current history index
  const currentVariable = useMemo(() => {
    if (historyIndex >= 0 && historyIndex < history.length) {
      return history[historyIndex];
    }
    return null;
  }, [history, historyIndex]);

  // Navigation state
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  // Navigate to a specific variable
  const navigateToVariable = useCallback((definitionId: string, variableName: string) => {
    const newEntry: NavigationHistoryEntry = {
      definitionId,
      variableName,
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      // If we're not at the end of history, truncate future entries
      const truncatedHistory = historyIndex >= 0
        ? prevHistory.slice(0, historyIndex + 1)
        : prevHistory;

      // Add new entry
      const newHistory = [...truncatedHistory, newEntry];

      // Limit history length
      if (newHistory.length > maxHistoryLength) {
        return newHistory.slice(-maxHistoryLength);
      }

      return newHistory;
    });

    // Update index to point to the new entry
    setHistoryIndex(() => {
      const truncatedLength = historyIndex >= 0 ? historyIndex + 1 : history.length;
      const newLength = Math.min(truncatedLength + 1, maxHistoryLength);
      return newLength - 1;
    });
  }, [historyIndex, history.length, maxHistoryLength]);

  // Go back in navigation history
  const goBack = useCallback(() => {
    if (canGoBack) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  }, [canGoBack]);

  // Go forward in navigation history
  const goForward = useCallback(() => {
    if (canGoForward) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }, [canGoForward]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Get navigation path as variable names
  const getNavigationPath = useCallback(() => {
    if (historyIndex < 0) return [];

    return history
      .slice(0, historyIndex + 1)
      .map(entry => entry.variableName);
  }, [history, historyIndex]);

  return {
    currentVariable,
    history,
    historyIndex,
    canGoBack,
    canGoForward,
    navigateToVariable,
    goBack,
    goForward,
    clearHistory,
    getNavigationPath
  };
}
