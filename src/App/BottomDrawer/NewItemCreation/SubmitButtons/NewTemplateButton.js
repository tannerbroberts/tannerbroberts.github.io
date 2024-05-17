import React from "react";
import { Button } from "@mui/material";
import { useAppContext } from "../../../App";
import { useNewItemCreationContext } from "../NewItemCreation";
import { useBottomDrawerContext } from "../../BottomDrawer";

export default function NewTemplateButton() {
  const {
    newItemName,
    setNewItemName,
    newItemNameIsTaken,
    newItemNameIsInvalid,
  } = useNewItemCreationContext();
  const { addToLibrary } = useAppContext();
  const { closeBottomDrawer } = useBottomDrawerContext();

  const handleSubmitNewItemTemplate = React.useCallback(() => {
    if (!newItemName || newItemNameIsTaken || newItemNameIsInvalid) return;
    else {
      addToLibrary(newItemName);
      closeBottomDrawer();
    }
  }, [addToLibrary, closeBottomDrawer, newItemName, newItemNameIsInvalid, newItemNameIsTaken]);
  return (
    <Button
      disabled={!newItemName || newItemNameIsTaken || newItemNameIsInvalid}
      variant="contained"
      color="primary"
      onClick={handleSubmitNewItemTemplate}
    >
      New Template
    </Button>
  );
}
