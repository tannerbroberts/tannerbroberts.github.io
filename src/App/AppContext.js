import React, { createContext, useContext } from "react";
import { useLocalStorageState } from "./LocalStorageDataStore/useLocalStorageState";

const AppStateContext = createContext();
const AppDispatchContext = createContext();

export function AppContextProvider({ children }) {
  const [state, setState] = useLocalStorageState("library", []);
  return (
      <AppStateContext.Provider value={state}>
        <AppDispatchContext.Provider value={setState}>
          {children}
        </AppDispatchContext.Provider>
      </AppStateContext.Provider>
  );
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppStateContext must be used within an AppProvider");
  }
  return context;
}

export function useAppDispatchContext() {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error("useAppDispatchContext must be used within an AppProvider");
  }
  return context;
}
