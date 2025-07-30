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

  // Create the 1-second base item
  const oneSecItem = new SubCalendarItem({
    name: "1 Second Item",
    duration: 1000, // 1 second
  });
  items.push(oneSecItem);

  // Create items following the pattern: 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 512s
  const durations = [2, 4, 8, 16, 32, 64, 128, 256, 512];

  durations.forEach((duration) => {
    const item = new SubCalendarItem({
      name: `${duration} Second Item`,
      duration: duration * 1000, // Convert to milliseconds
    });

    // Calculate child duration (half of current duration)
    const childDuration = duration / 2;

    // Find existing items of the child duration
    const childItems = items.filter(existingItem =>
      existingItem.duration === childDuration * 1000
    );

    // Schedule 2 child items inside this item
    if (childItems.length >= 2) {
      item.children = [
        new Child({ id: childItems[0].id, start: 0 }),
        new Child({ id: childItems[1].id, start: childDuration * 1000 }),
      ];
    } else if (childItems.length === 1) {
      // If we only have one item of the required duration, duplicate it
      const duplicateChild = new SubCalendarItem({
        name: `${childDuration} Second Item`,
        duration: childDuration * 1000,
      });
      items.push(duplicateChild);

      item.children = [
        new Child({ id: childItems[0].id, start: 0 }),
        new Child({ id: duplicateChild.id, start: childDuration * 1000 }),
      ];
    }

    items.push(item);
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

