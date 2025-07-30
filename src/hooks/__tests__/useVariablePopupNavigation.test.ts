import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVariablePopupNavigation } from '../useVariablePopupNavigation';

describe('useVariablePopupNavigation', () => {
  test('should initialize with empty state', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    expect(result.current.currentVariable).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should navigate to a variable', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    expect(result.current.currentVariable).toEqual({
      definitionId: 'def1',
      variableName: 'variable1',
      timestamp: expect.any(Number)
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should navigate to multiple variables', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    expect(result.current.currentVariable).toEqual({
      definitionId: 'def2',
      variableName: 'variable2',
      timestamp: expect.any(Number)
    });
    expect(result.current.history).toHaveLength(2);
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should go back in navigation history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentVariable).toEqual({
      definitionId: 'def1',
      variableName: 'variable1',
      timestamp: expect.any(Number)
    });
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(true);
  });

  test('should go forward in navigation history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.goBack();
    });

    act(() => {
      result.current.goForward();
    });

    expect(result.current.currentVariable).toEqual({
      definitionId: 'def2',
      variableName: 'variable2',
      timestamp: expect.any(Number)
    });
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should not go back when at beginning of history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    // Try to go back when already at the beginning
    act(() => {
      result.current.goBack();
    });

    expect(result.current.historyIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);
  });

  test('should not go forward when at end of history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    // Try to go forward when already at the end
    act(() => {
      result.current.goForward();
    });

    expect(result.current.historyIndex).toBe(0);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should clear history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.currentVariable).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  test('should truncate future history when navigating from middle', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.navigateToVariable('def3', 'variable3');
    });

    // Go back to middle
    act(() => {
      result.current.goBack();
    });

    // Navigate to new variable (should truncate def3)
    act(() => {
      result.current.navigateToVariable('def4', 'variable4');
    });

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[2]).toEqual({
      definitionId: 'def4',
      variableName: 'variable4',
      timestamp: expect.any(Number)
    });
    expect(result.current.canGoForward).toBe(false);
  });

  test('should respect max history length', () => {
    const { result } = renderHook(() => useVariablePopupNavigation({ maxHistoryLength: 3 }));

    // Add 5 variables to exceed the limit
    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.navigateToVariable('def3', 'variable3');
    });

    act(() => {
      result.current.navigateToVariable('def4', 'variable4');
    });

    act(() => {
      result.current.navigateToVariable('def5', 'variable5');
    });

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[0].variableName).toBe('variable3');
    expect(result.current.history[2].variableName).toBe('variable5');
  });

  test('should get navigation path', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    act(() => {
      result.current.navigateToVariable('def1', 'variable1');
    });

    act(() => {
      result.current.navigateToVariable('def2', 'variable2');
    });

    act(() => {
      result.current.navigateToVariable('def3', 'variable3');
    });

    expect(result.current.getNavigationPath()).toEqual(['variable1', 'variable2', 'variable3']);

    // Go back and check path
    act(() => {
      result.current.goBack();
    });

    expect(result.current.getNavigationPath()).toEqual(['variable1', 'variable2']);
  });

  test('should return empty path when no history', () => {
    const { result } = renderHook(() => useVariablePopupNavigation());

    expect(result.current.getNavigationPath()).toEqual([]);
  });
});
