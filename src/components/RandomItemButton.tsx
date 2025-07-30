import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import { SubCalendarItem, Child, VariableImpl } from "../functions/utils/item/index";

/**
 * Creates a series of scaling subcalendar items
 * Returns all items needed for the scaling pattern
 */
function createScalingSubCalendarItems(): SubCalendarItem[] {
  const items: SubCalendarItem[] = [];
  const itemsByDuration = new Map<number, SubCalendarItem>();

  // Create all items in order from smallest to largest: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 512s
  const durations = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

  durations.forEach((duration) => {
    const item = new SubCalendarItem({
      name: `${duration} Second Item`,
      duration: duration * 1000, // Convert to milliseconds
    });

    // For items longer than 1 second, schedule the child of half duration inside
    if (duration > 1) {
      const childDuration = duration / 2;
      const childItem = itemsByDuration.get(childDuration);

      if (childItem) {
        item.children = [
          new Child({ id: childItem.id, start: 0 })
        ];
      }
    }

    items.push(item);
    itemsByDuration.set(duration, item);
  });

  return items;
}

export default function RandomItemButton() {
  const appDispatch = useAppDispatch();

  const createScalingItems = useCallback(() => {
    const items = createScalingSubCalendarItems();

    // Create actions for all items
    const actions = items.map(item => ({ type: "CREATE_ITEM" as const, payload: { newItem: item } }));

    // Add variable for the 1-second item
    const variableActions = [{
      type: "SET_ITEM_VARIABLES" as const,
      payload: {
        itemId: items[0].id,
        variables: [new VariableImpl({ name: 'nugget', quantity: 1, category: 'reward' })]
      }
    }];

    // Dispatch items first, then variables
    appDispatch({ type: "BATCH", payload: [...actions, ...variableActions] });
  }, [appDispatch]);

  return (
    <Button variant="contained" onClick={createScalingItems}>
      CREATE SCALING ITEMS
    </Button>
  );
}

