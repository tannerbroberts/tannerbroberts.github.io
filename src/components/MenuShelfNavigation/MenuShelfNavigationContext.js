import React, { createContext, useContext, useEffect } from "react";
import { loadState } from "../../utils/localStorageHelpers";

const MenuShelfNavigationStateContext = createContext();
const MenuShelfNavigationDispatchContext = createContext();

export function MenuShelfNavigationContext({ children, state, dispatch }) {
  useEffect(() => {
    const localStorageState = loadState("AppReducer");
    localStorageState &&
      dispatch({ type: "LOAD_STATE", value: localStorageState });
  }, []);
  return (
    <MenuShelfNavigationStateContext.Provider value={state}>
      <MenuShelfNavigationDispatchContext.Provider value={dispatch}>
        {children}
      </MenuShelfNavigationDispatchContext.Provider>
    </MenuShelfNavigationStateContext.Provider>
  );
}

export function useMenuShelfNavigationStateContext() {
  const context = useContext(MenuShelfNavigationStateContext);
  if (!context) {
    throw new Error(
      "useMenuShelfNavigationStateContext must be used within an AppProvider"
    );
  }
  return context;
}

export function useMenuShelfNavigationDispatchContext() {
  const context = useContext(MenuShelfNavigationDispatchContext);
  if (!context) {
    throw new Error(
      "useMenuShelfNavigationDispatchContext must be used within an AppProvider"
    );
  }
  return context;
}
