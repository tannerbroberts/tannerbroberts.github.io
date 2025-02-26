import { useEffect } from "react";
import { useAppState } from "../../context/App";

export default function useItemListValidation() {
  const { items } = useAppState()

  useEffect(() => {
    for (const item of items) {
      // Ensure all children's ids are in the items array
      for (const child of item.children) {
        if (!items.find((i) => i.id === child.id)) {
          throw new Error(`Child item with id ${child} not found in items array`)
        }
      }
    }
    // print green success message
    console.log('%cAll children references found in items array', 'color: green; font-weight: bold')
  }, [items])
}
