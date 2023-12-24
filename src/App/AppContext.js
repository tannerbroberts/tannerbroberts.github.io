import React, { createContext, useContext } from "react";

const AppStateContext = createContext();
const AppDispatchContext = createContext();

export function AppContextProvider({ children }) {

  return (
    <AppStateContext.Provider value={'test value'}>
      <AppDispatchContext.Provider value={() => console.log('app dispatch called, but no implementation is there')}>
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
