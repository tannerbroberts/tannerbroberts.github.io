import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalStorageUpdateContext } from "./LocalStorageProvider";
import { loadState, saveState } from "../../utils/localStorageHelpers";
/**
 * This hook syncs a state variable with localStorage.
 * If the localStorage value changes, so too does EVERY USAGE of that key by this hook in real time.
 *
 * If two components use the same key, and one updates the value associated with that key, the other will update as well.
 *
 * This also means if componentA is nested in componentB, each with a summary of the variable 'dollars', and componentA updates its 'dollars', componentB, having a summary of 'dollars' that includes componentA's 'dollars', will update as well.
 */
export function useLocalStorageState(key, initialValue) {
  if (!key) throw new Error("Must be called with a key");
  if (!initialValue) throw new Error("Must be called with initialValue");
  const initialValueRef = useRef(initialValue);

  const {
    loadedLocalStorageKeys,
    watchLocalStorageKey,
    stopWatchingLocalStorageKey,
    updateLocalStorageKey,
  } = useLocalStorageUpdateContext();

  const storedValue = loadState(key);
  if (!storedValue) saveState(key, initialValue);
  const [state, setState] = useState(storedValue || initialValue);

  // Registers this key with the LocalStorageProvider so that the state returned from this hook can be updated in response to changes in localStorage
  useEffect(() => {
    watchLocalStorageKey(key);
    return () => {
      stopWatchingLocalStorageKey(key);
    };
  }, [key, stopWatchingLocalStorageKey, watchLocalStorageKey]);

  // Updates the state returned from this hook in response to changes in localStorage
  useEffect(() => {
    const storedValue = loadState(key);
    setState(storedValue || initialValueRef.current);
  }, [
    initialValueRef,
    key,
    loadedLocalStorageKeys,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Below values are modified for purposes of pulling in changes to registered localStorage keys when the localStorage values update via this hook
    loadedLocalStorageKeys.current[key],
  ]);

  const mySetState = useCallback(
    (value) => {
      saveState(key, value);
      updateLocalStorageKey(key);
    },
    [key, updateLocalStorageKey]
  );

  return [state, mySetState];
}
