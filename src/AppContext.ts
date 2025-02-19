import { createContext, useContext } from 'react';
import type { StateType, ActionType } from './AppReducer';

export const AppStateContext = createContext<StateType | null>(null);
export const AppDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);

export function useAppStateContext() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppStateContext must be used within a AppStateProvider')
  }
  return context
}

export function useAppDispatchContext() {
  const context = useContext(AppDispatchContext)
  if (!context) {
    throw new Error('useAppDispatchContext must be used within a AppStateProvider')
  }
  return context
}
