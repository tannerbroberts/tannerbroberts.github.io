import { useState, useCallback, useEffect } from 'react';

type VerticalPosition = 'top' | 'bottom';
type HorizontalPosition = 'left' | 'center' | 'right';

export interface PopupPosition {
  x: number;
  y: number;
  anchorOrigin: {
    vertical: VerticalPosition;
    horizontal: HorizontalPosition;
  };
  transformOrigin: {
    vertical: VerticalPosition;
    horizontal: HorizontalPosition;
  };
}

export interface UsePopupPositioningOptions {
  offsetX?: number;
  offsetY?: number;
  minDistanceFromEdge?: number;
  popupWidth?: number;
  popupHeight?: number;
}

export interface UsePopupPositioningReturn {
  position: PopupPosition | null;
  calculatePosition: (mouseEvent: MouseEvent | React.MouseEvent, options?: UsePopupPositioningOptions) => PopupPosition;
  clearPosition: () => void;
}

const DEFAULT_OFFSET_X = 10;
const DEFAULT_OFFSET_Y = 10;
const DEFAULT_MIN_DISTANCE = 20;
const DEFAULT_POPUP_WIDTH = 400;
const DEFAULT_POPUP_HEIGHT = 300;

export function usePopupPositioning(): UsePopupPositioningReturn {
  const [position, setPosition] = useState<PopupPosition | null>(null);

  // Get viewport dimensions
  const getViewportDimensions = useCallback(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  }), []);

  // Get container dimensions and offset if popup is in a scrollable container
  const getContainerDimensions = useCallback((element: HTMLElement) => {
    const container = element.closest('.MuiDialog-root, .MuiPopover-root, [data-scrollable]') as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        scrollLeft: container.scrollLeft || 0,
        scrollTop: container.scrollTop || 0
      };
    }
    return null;
  }, []);

  // Calculate optimal position based on mouse location and viewport constraints
  const calculatePosition = useCallback((
    mouseEvent: MouseEvent | React.MouseEvent,
    options: UsePopupPositioningOptions = {}
  ): PopupPosition => {
    const {
      offsetX = DEFAULT_OFFSET_X,
      offsetY = DEFAULT_OFFSET_Y,
      minDistanceFromEdge = DEFAULT_MIN_DISTANCE,
      popupWidth = DEFAULT_POPUP_WIDTH,
      popupHeight = DEFAULT_POPUP_HEIGHT
    } = options;

    const viewport = getViewportDimensions();
    const mouseX = mouseEvent.clientX;
    const mouseY = mouseEvent.clientY;

    // Check if mouse event target is in a container
    const target = mouseEvent.target as HTMLElement;
    const container = getContainerDimensions(target);

    // Calculate available space in each direction
    const spaceRight = container
      ? container.left + container.width - mouseX
      : viewport.width - mouseX;
    const spaceLeft = container
      ? mouseX - container.left
      : mouseX;
    const spaceBelow = container
      ? container.top + container.height - mouseY
      : viewport.height - mouseY;
    const spaceAbove = container
      ? mouseY - container.top
      : mouseY;

    // Determine horizontal positioning
    let anchorHorizontal: HorizontalPosition;
    let transformHorizontal: HorizontalPosition;

    if (spaceRight >= popupWidth + minDistanceFromEdge) {
      // Enough space to the right
      anchorHorizontal = 'left';
      transformHorizontal = 'left';
    } else if (spaceLeft >= popupWidth + minDistanceFromEdge) {
      // Not enough space to the right, try left
      anchorHorizontal = 'right';
      transformHorizontal = 'right';
    } else {
      // Not enough space on either side, center on mouse
      anchorHorizontal = 'center';
      transformHorizontal = 'center';
    }

    // Determine vertical positioning
    let anchorVertical: VerticalPosition;
    let transformVertical: VerticalPosition;

    if (spaceBelow >= popupHeight + minDistanceFromEdge) {
      // Enough space below
      anchorVertical = 'top';
      transformVertical = 'top';
    } else if (spaceAbove >= popupHeight + minDistanceFromEdge) {
      // Not enough space below, try above
      anchorVertical = 'bottom';
      transformVertical = 'bottom';
    } else {
      // Not enough space above or below, position above with top alignment
      anchorVertical = 'bottom';
      transformVertical = 'top';
    }

    // Ensure popup stays within viewport boundaries
    let finalX: number;
    let finalY: number;

    // Calculate X position based on anchor strategy
    if (anchorHorizontal === 'left') {
      finalX = mouseX + offsetX;
    } else if (anchorHorizontal === 'right') {
      finalX = mouseX - offsetX;
    } else {
      finalX = mouseX;
    }

    // Calculate Y position based on anchor strategy
    if (anchorVertical === 'top') {
      finalY = mouseY + offsetY;
    } else {
      finalY = mouseY - offsetY;
    }

    // Ensure popup stays within viewport boundaries
    finalX = Math.max(
      minDistanceFromEdge,
      Math.min(finalX, viewport.width - popupWidth - minDistanceFromEdge)
    );
    finalY = Math.max(
      minDistanceFromEdge,
      Math.min(finalY, viewport.height - popupHeight - minDistanceFromEdge)
    );

    const calculatedPosition: PopupPosition = {
      x: finalX,
      y: finalY,
      anchorOrigin: {
        vertical: anchorVertical,
        horizontal: anchorHorizontal
      },
      transformOrigin: {
        vertical: transformVertical,
        horizontal: transformHorizontal
      }
    };

    setPosition(calculatedPosition);
    return calculatedPosition;
  }, [getViewportDimensions, getContainerDimensions]);

  const clearPosition = useCallback(() => {
    setPosition(null);
  }, []);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (position) {
        // Clear position on resize - popup should be repositioned or closed
        clearPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, clearPosition]);

  return {
    position,
    calculatePosition,
    clearPosition
  };
}
