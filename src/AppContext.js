import React, { createContext, useContext, useEffect } from "react";
import AppReducer, { initialState } from "./AppReducer";
import { loadState } from "./api/localStorageHelpers";

const AppStateContext = createContext();
const AppDispatchContext = createContext();

export function AppContextProvider({ children }) {
  const [state, dispatch] = React.useReducer(AppReducer, initialState);
  useEffect(() => {
    const localStorageState = loadState("AppReducer");
    localStorageState &&
      dispatch({ type: "LOAD_STATE", value: localStorageState });
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
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
