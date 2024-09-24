import React from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

/**
 * Returns an object from localStorage that holds item names as keys and item objects as values.
 */
export default function useLibrary() {
  const [items, setItems] = useLocalStorage("items", {});

  const setItem = React.useCallback((item) => {
    if (!item.name) throw new Error("Attempted to set item in items without a name.");
    if (!item.length) throw new Error("Attempted to set item in items without a length.");

    setItems((prevLibrary) => ({
      ...prevLibrary,
      [item.name]: item,
    }));
  }, [setItems]);

  const deleteItem = React.useCallback((name) => {
    setItems((prevLibrary) => {
      const newLibrary = { ...prevLibrary };
      if (!newLibrary[name]) throw new Error(`Attempted to delete item ${name}, but the item does not exist in the items.`);
      delete newLibrary[name];
      return newLibrary;
    });
  }, [setItems]);

  return { setItem, deleteItem, items };
}
