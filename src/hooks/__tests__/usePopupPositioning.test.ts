import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePopupPositioning } from '../usePopupPositioning';

// Mock window dimensions
const mockViewport = {
  width: 1024,
  height: 768
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: mockViewport.width,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: mockViewport.height,
});

Object.defineProperty(window, 'scrollX', {
  writable: true,
  configurable: true,
  value: 0,
});

Object.defineProperty(window, 'scrollY', {
  writable: true,
  configurable: true,
  value: 0,
});

describe('usePopupPositioning', () => {
  const createMockMouseEvent = (x: number, y: number): MouseEvent => ({
    clientX: x,
    clientY: y,
    target: document.body
  } as unknown as MouseEvent);

  beforeEach(() => {
    // Reset viewport dimensions
    window.innerWidth = mockViewport.width;
    window.innerHeight = mockViewport.height;
  });

  test('should initialize with null position', () => {
    const { result } = renderHook(() => usePopupPositioning());

    expect(result.current.position).toBeNull();
  });

  test('should calculate position for mouse event in center of screen', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(512, 384); // Center of 1024x768

    act(() => {
      const position = result.current.calculatePosition(mouseEvent, {
        popupWidth: 400,
        popupHeight: 300
      });

      expect(position.x).toBeGreaterThan(512); // Should be offset to the right
      expect(position.y).toBeGreaterThan(384); // Should be offset down
      expect(position.anchorOrigin.horizontal).toBe('left');
      expect(position.anchorOrigin.vertical).toBe('top');
    });
  });

  test('should adjust position when near right edge', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(900, 384); // Near right edge

    act(() => {
      const position = result.current.calculatePosition(mouseEvent, {
        popupWidth: 400,
        popupHeight: 300
      });

      // Should position popup to the left of mouse
      expect(position.anchorOrigin.horizontal).toBe('right');
    });
  });

  test('should adjust position when near bottom edge', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(512, 700); // Near bottom edge

    act(() => {
      const position = result.current.calculatePosition(mouseEvent, {
        popupWidth: 400,
        popupHeight: 300
      });

      // Should position popup above mouse
      expect(position.anchorOrigin.vertical).toBe('bottom');
    });
  });

  test('should respect minimum distance from edge', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(5, 5); // Very close to top-left corner

    act(() => {
      const position = result.current.calculatePosition(mouseEvent, {
        popupWidth: 400,
        popupHeight: 300,
        minDistanceFromEdge: 20
      });

      // Position should be at least 20px from edges
      expect(position.x).toBeGreaterThanOrEqual(20);
      expect(position.y).toBeGreaterThanOrEqual(20);
    });
  });

  test('should clear position', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(512, 384);

    act(() => {
      result.current.calculatePosition(mouseEvent);
    });

    expect(result.current.position).not.toBeNull();

    act(() => {
      result.current.clearPosition();
    });

    expect(result.current.position).toBeNull();
  });

  test('should handle window resize by clearing position', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(512, 384);

    act(() => {
      result.current.calculatePosition(mouseEvent);
    });

    expect(result.current.position).not.toBeNull();

    // Simulate window resize
    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.position).toBeNull();
  });

  test('should use default options when none provided', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(100, 100);

    act(() => {
      const position = result.current.calculatePosition(mouseEvent);

      // Should use default offsets and popup dimensions
      expect(position).toBeDefined();
      expect(position.x).toBeGreaterThan(100);
      expect(position.y).toBeGreaterThan(100);
    });
  });

  test('should handle custom offset values', () => {
    const { result } = renderHook(() => usePopupPositioning());

    const mouseEvent = createMockMouseEvent(200, 200);

    act(() => {
      const position = result.current.calculatePosition(mouseEvent, {
        offsetX: 50,
        offsetY: 30,
        popupWidth: 200,
        popupHeight: 150
      });

      expect(position.x).toBe(250); // 200 + 50
      expect(position.y).toBe(230); // 200 + 30
    });
  });
});
