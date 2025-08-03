import { createContext, useContext, useReducer, ReactNode } from "react";
import reducer, { initialState, AppState, AppAction } from "../functions/reducers/AppReducer";
import { usePersistence } from "../hooks/usePersistence";
import {
  loadItemsFromLocalStorage,
  loadBaseCalendarFromLocalStorage,
  loadItemInstancesFromLocalStorage,
  loadAppSettingsFromLocalStorage
} from "../functions/utils/localStorage";

// Create contexts
const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

// Create initial state with localStorage data
function createInitialState(): AppState {
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

// Provider component
export function AppProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState());

  // Add persistence
  usePersistence(state);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}

// Custom hooks
export function useAppState() {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (context === null) {
    throw new Error("useAppDispatch must be used within AppProvider");
  }
  return context;
}
