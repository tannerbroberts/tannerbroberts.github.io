import React, { createContext, useContext, useCallback, useRef } from "react";

const LocalStorageUpdateContext = createContext();

export default function LocalStorageProvider({ children }) {
  const loadedLocalStorageKeys = useRef({});

  const watchLocalStorageKey = useCallback(
    (key) => {
      loadedLocalStorageKeys.current[key] = 1;
    },
    [loadedLocalStorageKeys]
  );

  const stopWatchingLocalStorageKey = useCallback(
    (key) => {
      delete loadedLocalStorageKeys.current[key];
    },
    [loadedLocalStorageKeys]
  );

  const updateLocalStorageKey = useCallback(
    (key) => {
      loadedLocalStorageKeys.current[key]++;
    },
    [loadedLocalStorageKeys]
  );

  return (
    <LocalStorageUpdateContext.Provider
      value={{
        loadedLocalStorageKeys,
        watchLocalStorageKey,
        stopWatchingLocalStorageKey,
        updateLocalStorageKey,
      }}
    >
      {children}
    </LocalStorageUpdateContext.Provider>
  );
}

export const useLocalStorageUpdateContext = () => {
  const context = useContext(LocalStorageUpdateContext);
  if (!context) {
    throw new Error(
      "useLocalStorageUpdateContext (used in useLocalStorageState && useLocalStorageReducer) must be used within LocalStorageProvider"
    );
  }
  return context;
};
