import { useEffect } from 'react';
import { AppState } from '../functions/reducers/AppReducer';
import {
  saveItemsToLocalStorage,
  saveBaseCalendarToLocalStorage,
  saveItemInstancesToLocalStorage,
  saveAppSettingsToLocalStorage,
  PersistedAppSettings
} from '../functions/utils/localStorage';

/**
 * Hook that automatically persists app state to localStorage when it changes
 */
export function usePersistence(state: AppState) {
  // Persist items when they change
  useEffect(() => {
    saveItemsToLocalStorage(state.items);
  }, [state.items]);

  // Persist base calendar when it changes
  useEffect(() => {
    saveBaseCalendarToLocalStorage(state.baseCalendar);
  }, [state.baseCalendar]);

  // Persist item instances when they change
  useEffect(() => {
    saveItemInstancesToLocalStorage(state.itemInstances);
  }, [state.itemInstances]);

  // Persist app settings when they change
  useEffect(() => {
    const settings: PersistedAppSettings = {
      millisecondsPerSegment: state.millisecondsPerSegment,
      pixelsPerSegment: state.pixelsPerSegment,
      expandSearchItems: state.expandSearchItems,
      focusedItemId: state.focusedItemId,
      currentView: state.currentView,
      itemSearchWindowRange: state.itemSearchWindowRange
    };
    saveAppSettingsToLocalStorage(settings);
  }, [
    state.millisecondsPerSegment,
    state.pixelsPerSegment,
    state.expandSearchItems,
    state.focusedItemId,
    state.currentView,
    state.itemSearchWindowRange
  ]);
}
