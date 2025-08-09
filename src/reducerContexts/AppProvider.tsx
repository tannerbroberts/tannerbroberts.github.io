import { ReactNode, useReducer } from "react";
import reducer, { initialState } from "../functions/reducers/AppReducer";
import { usePersistence } from "../hooks/usePersistence";
import { StateContext, DispatchContext } from "./contexts";
import {
  loadItemsFromLocalStorage,
  loadBaseCalendarFromLocalStorage,
  loadItemInstancesFromLocalStorage,
  loadAppSettingsFromLocalStorage
} from "../functions/utils/localStorage";

function createInitialState() {
  const persistedItems = loadItemsFromLocalStorage();
  const persistedBaseCalendar = loadBaseCalendarFromLocalStorage();
  const persistedItemInstances = loadItemInstancesFromLocalStorage();
  const persistedSettings = loadAppSettingsFromLocalStorage();

  return {
    ...initialState,
    items: persistedItems,
    baseCalendar: persistedBaseCalendar,
    itemInstances: persistedItemInstances,
    ...persistedSettings
  };
}

export function AppProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState());

  usePersistence(state);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
