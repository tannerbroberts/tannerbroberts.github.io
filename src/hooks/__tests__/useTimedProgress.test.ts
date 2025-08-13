import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimedProgress } from '../useTimedProgress';

const mockItem: { duration: number } = { duration: 60000 }; // 1 minute

describe('useTimedProgress', () => {
  it('returns zeroed state when disabled', () => {
    const { result } = renderHook(() => useTimedProgress(mockItem, 1000, 0, false));
    expect(result.current.progress).toBe(0);
  expect(result.current.elapsed).toBe(1000);
  expect(result.current.remaining).toBe(59000);
  });

  it('calculates progress mid-execution', () => {
    const { result } = renderHook(() => useTimedProgress(mockItem, 30000, 0, true));
    expect(result.current.progress).toBeCloseTo(50, 1);
    expect(result.current.elapsed).toBe(30000);
    expect(result.current.remaining).toBe(30000);
    expect(result.current.isComplete).toBe(false);
  });

  it('caps progress at 100 when beyond duration', () => {
    const { result } = renderHook(() => useTimedProgress(mockItem, 120000, 0, true));
    expect(result.current.progress).toBe(100);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.remaining).toBe(0);
  });
});
