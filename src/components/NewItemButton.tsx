import { Button } from "@mui/material";
import TimeInputOverlay from "./TimeInputOverlay";
import { useCallback, useState } from "react";

export default function NewItemButton() {
  const [open, setOpen] = useState(false);

  const openTimeInputOverlay = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="contained"
        onClick={openTimeInputOverlay}
      >
        CREATE NEW ITEM
      </Button>
      <TimeInputOverlay {...{ open, onClose }} />
    </>
  )
}
