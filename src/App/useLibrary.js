import React from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

/**
 * Returns an object from localStorage that holds item names as keys and item objects as values.
 */
export function useLibrary() {
  const [library, setLibrary] = useLocalStorage("library", {});

  const setItem = React.useCallback((item) => {
    if (!item.name) throw new Error("Attempted to set item in library without a name.");
    if (!item.length) throw new Error("Attempted to set item in library without a length.");
    setLibrary((prevLibrary) => ({
      ...prevLibrary,
      [item.name]: item,
    }));
  }, [setLibrary]);

  const deleteItem = React.useCallback((name) => {
    setLibrary((prevLibrary) => {
      const newLibrary = { ...prevLibrary };
      if (!newLibrary[name]) throw new Error(`Attempted to delete item ${name}, but the item does not exist in the library.`);
      delete newLibrary[name];
      return newLibrary;
    });
  }, [setLibrary]);

  return { setItem, deleteItem, library };
}
