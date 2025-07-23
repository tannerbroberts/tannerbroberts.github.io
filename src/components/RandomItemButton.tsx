import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import { BasicItem } from "../functions/utils/item/index";
import getRandomName from "../functions/utils/getRandomName";

export default function RandomItemButton() {
  const appDispatch = useAppDispatch();

  const createRandomItem = useCallback(() => {
    const randomName = getRandomName();
    const randomDuration = Math.floor(Math.random() * 3600000) + 1000; // Random duration between 1 second and 1 hour
    const newItem = new BasicItem({ name: randomName, duration: randomDuration });

    appDispatch({ type: "CREATE_ITEM", payload: { newItem } });
  }, [appDispatch]);

  return (
    <Button variant="contained" onClick={createRandomItem}>
      RANDOM ITEM
    </Button>
  );
}
