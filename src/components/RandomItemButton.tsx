import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import getRandomName from "../functions/utils/getRandomName";
import { Item, scheduleItem } from "../functions/utils/item";

export default function CreateRandomItemFromTemplatesButton() {
  const { items } = useAppState()
  const appDispatch = useAppDispatch()

  const createRandomItemFromTemplates = useCallback(() => {
    const generateNestingUpdates = (parentItem: Item, duration: number) => {
      const childItems: Item[] = [];

      for (const item of items) {
        if (item.duration > duration) continue;

        let nextAvailableMoment = 0;
        if (childItems.length > 0) {
          const lastItem = childItems[childItems.length - 1];
          nextAvailableMoment = lastItem.duration + nextAvailableMoment;
        }

        if (nextAvailableMoment + item.duration > duration) continue;

        // schedule the item
        const { newChildItem, newParentItem } = scheduleItem({
          childItem: item,
          parentItem: parentItem,
          start: nextAvailableMoment
        })

        childItems.push(newChildItem);
        parentItem = newParentItem;
      }

      return {
        type: "UPDATE_ITEMS" as const,
        payload: { updatedItems: [parentItem, ...childItems] }
      };
    }

    const name = getRandomName();
    const duration = Math.floor(Math.random() * 10_000);
    const newItem = new Item({ name, duration });

    const createAction = {
      type: "CREATE_ITEM" as const,
      payload: { newItem }
    };

    const scheduledItemUpdates = generateNestingUpdates(newItem, duration);

    appDispatch({
      type: "BATCH",
      payload: [createAction, scheduledItemUpdates]
    });
  }, [appDispatch, items])

  return (
    <Button variant='contained' onClick={createRandomItemFromTemplates}>
      RANDOM
    </Button>
  )
}
