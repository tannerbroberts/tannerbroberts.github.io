import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import CreateNewItemDialog from "./CreateNewItemDialog";

export default function NewItemButton() {
  const dispatch = useAppDispatch();

  const openNewItemDialog = useCallback(() => {
    dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: true } });
  }, [dispatch]);

  return (
    <>
      <Button variant="contained" onClick={openNewItemDialog}>
        CREATE NEW ITEM
      </Button>
      <CreateNewItemDialog />
    </>
  );
}
