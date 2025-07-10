import { Button, Dialog, Input } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { TimeInputProvider, useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";
import { NewItemProvider, useNewItemDispatch, useNewItemState } from "../reducerContexts/NewItem";
import TimeQuantityInput from "./TimeQuantityInput";
import { Item } from "../functions/utils/item";

export default function NewItemButton() {
  return (
    <NewItemProvider>
      <TimeInputProvider>
        <NewItemDialog />
      </TimeInputProvider>
    </NewItemProvider>
  )
}

function NewItemDialog() {
  const { newItemDialogOpen } = useAppState();
  const dispatch = useAppDispatch();

  const { total } = useTimeInputState();
  const timeInputDispatch = useTimeInputDispatch();

  const { name } = useNewItemState();
  const newItemDispatch = useNewItemDispatch();

  const openNewItemDialog = useCallback(() => {
    dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: true } });
  }, [dispatch]);

  const setName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    newItemDispatch({ type: "SET_NAME", payload: { name: event.target.value } });
  }, [newItemDispatch]);

  const createNewItem = useCallback(() => {
    if (name === "") {
      alert("Please enter a name for the new item");
      return;
    }
    if (total === 0) {
      alert("Please enter a duration for the new item");
      return;
    }
    const newItem = new Item({ name, duration: total });
    dispatch({ type: "CREATE_ITEM", payload: { newItem } });
    dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: false } });
    newItemDispatch({ type: "SET_NAME", payload: { name: "" } });
    timeInputDispatch({ type: "RESET" });
  }, [dispatch, name, newItemDispatch, total, timeInputDispatch]);

  return (
    <>
      <Button variant="contained" onClick={openNewItemDialog} >
        CREATE NEW ITEM
      </Button>
      <Dialog
        open={newItemDialogOpen}
        onClose={() => dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: false } })}
      >
        <Input type="text" placeholder="Item Name" value={name}
          onChange={setName}
        />
        <TimeQuantityInput />
        <Button onClick={createNewItem}>
          Create
        </Button>
      </Dialog>
    </>
  )
}
