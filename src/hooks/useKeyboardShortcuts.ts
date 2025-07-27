import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

// Predefined shortcuts for common actions
export const ACCOUNTING_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'a',
    ctrlKey: true,
    action: () => { }, // Will be overridden
    description: 'Select all instances'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: () => { }, // Will be overridden  
    description: 'Focus search'
  },
  {
    key: 'Enter',
    ctrlKey: true,
    action: () => { }, // Will be overridden
    description: 'Complete selected instances'
  },
  {
    key: 'Escape',
    action: () => { }, // Will be overridden
    description: 'Clear selection/close dialogs'
  }
];
