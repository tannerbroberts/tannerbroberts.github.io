import originalReducer, { AppState, AppAction, initialState } from '../functions/reducers/AppReducer';
import { queuePersistence } from './persistenceMiddleware';

/**
 * Actions that should trigger persistence to localStorage
 * These are actions that modify items or baseCalendar data
 */
const PERSISTENCE_ACTIONS = new Set<string>([
  'CREATE_ITEM',
  'DELETE_ITEM_BY_ID',
  'REMOVE_INSTANCES_BY_ID',
  'REMOVE_INSTANCE_BY_RELATIONSHIP_ID',
  'UPDATE_ITEMS',
  'ADD_CHILD_TO_ITEM',
  'ADD_BASE_CALENDAR_ENTRY',
  'REMOVE_BASE_CALENDAR_ENTRY',
  'UPDATE_BASE_CALENDAR_ENTRY'
]);

/**
 * Enhanced reducer that wraps the original AppReducer with automatic persistence
 * 
 * This reducer:
 * - Calls the original reducer first to maintain all existing functionality
 * - Automatically persists changes when relevant actions are dispatched
 * - Uses debouncing to optimize performance with rapid consecutive changes
 * - Handles storage failures gracefully without affecting app functionality
 * - Maintains the exact same API as the original reducer
 * 
 * @param state - Current application state
 * @param action - Action to process
 * @returns New application state
 */
export default function enhancedAppReducer(
  state: AppState,
  action: AppAction
): AppState {
  // Call original reducer first to get the new state
  const newState = originalReducer(state, action);

  // Check if this action or any nested actions (for BATCH) require persistence
  const shouldPersist = action.type === 'BATCH'
    ? action.payload.some(nestedAction => PERSISTENCE_ACTIONS.has(nestedAction.type))
    : PERSISTENCE_ACTIONS.has(action.type);

  if (shouldPersist) {
    try {
      // Persist asynchronously without blocking the reducer
      queuePersistence(newState.items, newState.baseCalendar);
    } catch (error) {
      // Log error but don't let it affect the reducer's operation
      console.error('Failed to queue persistence for action:', action.type, error);
    }
  }

  return newState;
}

// Re-export everything from the original reducer to maintain API compatibility
export { initialState };
export type { AppState, AppAction };

// Re-export specific types that might be used elsewhere
export type { BaseCalendarEntry } from '../functions/reducers/AppReducer';
