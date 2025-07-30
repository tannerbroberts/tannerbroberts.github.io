import { useEffect, useRef, ReactNode } from 'react';

export interface ClickAwayHandlerProps {
  children: ReactNode;
  onClickAway: () => void;
  enabled?: boolean;
  includeEscapeKey?: boolean;
  mouseEvent?: 'onClick' | 'onMouseDown' | 'onMouseUp';
  touchEvent?: 'onTouchStart' | 'onTouchEnd';
}

export default function ClickAwayHandler({
  children,
  onClickAway,
  enabled = true,
  includeEscapeKey = true,
  mouseEvent = 'onClick',
  touchEvent = 'onTouchEnd'
}: Readonly<ClickAwayHandlerProps>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleEvent = (event: Event) => {
      const target = event.target as Node;

      // Check if the click/touch was outside the referenced element
      if (ref.current && !ref.current.contains(target)) {
        onClickAway();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClickAway();
      }
    };

    // Map event props to actual event names
    const mouseEventMap = {
      onClick: 'click',
      onMouseDown: 'mousedown',
      onMouseUp: 'mouseup'
    };

    const touchEventMap = {
      onTouchStart: 'touchstart',
      onTouchEnd: 'touchend'
    };

    const mouseEventName = mouseEventMap[mouseEvent];
    const touchEventName = touchEventMap[touchEvent];

    // Add event listeners
    document.addEventListener(mouseEventName, handleEvent);
    document.addEventListener(touchEventName, handleEvent);

    if (includeEscapeKey) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup function
    return () => {
      document.removeEventListener(mouseEventName, handleEvent);
      document.removeEventListener(touchEventName, handleEvent);

      if (includeEscapeKey) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [enabled, onClickAway, includeEscapeKey, mouseEvent, touchEvent]);

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
