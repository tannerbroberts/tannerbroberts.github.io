import { useEffect } from "react";
import { useAppState } from "../../reducerContexts/App";
import { getIndexById } from "./item/index";

export default function useItemListValidation() {
  const { items } = useAppState();

  useEffect(() => {
    for (const item of items) {
      // Ensure all children's ids are in the items array
      for (const child of item.children) {
        const index = getIndexById(items, child.id);
        if (index === -1) {
          throw new Error(
            `Child item with id ${child} not found in items array`,
          );
        }
      }
      // Ensure all parents' ids are in the items array
      for (const parent of item.parents) {
        const index = getIndexById(items, parent.id);
        if (index === -1) {
          throw new Error(
            `Parent item with id ${parent.id} not found in items array`,
          );
        }
      }
    }
    // print green success message
    console.info(
      "%cAll children references found in items array",
      "color: green; font-weight: bold",
    );
  }, [items]);
}
