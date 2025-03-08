import { Button } from "@mui/material";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppState } from "../context/App";
import getRandomName from "../store/utils/getRandomName";
import { getItemById, Item } from "../store/utils/item";

export default function CreateRandomItemFromTemplatesButton() {
  const { items } = useAppState()
  const appDispatch = useAppDispatch()

  const createRandomItemFromTemplates = useCallback(() => {
    const generateRandomNonOverlappingChildrenFromItems = (parentId: string, duration: number) => {
      const schedules: Array<{ childId: string; start: number }> = [];

      for (const item of items) {
        if (item.duration > duration) continue;

        let nextAvailableMoment = 0;
        if (schedules.length) {
          const lastChild = schedules[schedules.length - 1];
          const lastChildItem = getItemById(items, lastChild.childId) as Item;
          nextAvailableMoment = lastChild.start + lastChildItem.duration;
        }

        if (nextAvailableMoment + item.duration > duration) continue;

        schedules.push({
          childId: item.id,
          start: nextAvailableMoment,
        });
      }

      return {
        type: "SCHEDULE_ITEMS_BY_ID" as const,
        payload: { parentId, schedules }
      };
    }

    const name = getRandomName();
    const duration = Math.floor(Math.random() * 10_000);
    const id = uuid();

    const createAction = {
      type: "CREATE_ITEM" as const,
      payload: { id, name, duration }
    };

    const scheduleAction = generateRandomNonOverlappingChildrenFromItems(id, duration);

    appDispatch({
      type: "BATCH",
      payload: [createAction, scheduleAction]
    });
  }, [appDispatch, items])

  return (
    <Button variant='contained' onClick={createRandomItemFromTemplates}>
      RANDOM
    </Button>
  )
}
