import { Button } from "@mui/material";
import TimeInputOverlay from "./TimeInputOverlay";
import { useCallback, useState } from "react";
import { useAppDispatch } from "../context/App";
import { v4 as uuid } from "uuid";

export default function NewItemButton() {
  const appDispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const openTimeInputOverlay = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onCustomSubmit = useCallback((duration: number, name: string) => {
    const id = uuid()
    appDispatch({
      type: "CREATE_ITEM",
      payload: {
        id,
        name,
        duration,
        children: [],
      }
    })
  }, [appDispatch]);

  const prompt = "Enter a NAME and DURATION";

  return (
    <>
      <Button
        variant="contained"
        onClick={openTimeInputOverlay}
      >
        CREATE NEW ITEM
      </Button>
      <TimeInputOverlay {...{ open, onClose, prompt, onCustomSubmit }} />
    </>
  )
}
// TODO: Change name to NewItemDialog