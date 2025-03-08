import { Button, Dialog } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../context/App";
import TimeQuantityInput from "./TimeQuantityInput.tsx";

export default function SchedulingDialog() {
  const { schedulingDialogOpen } = useAppState()
  const dispatch = useAppDispatch()

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: false } })
  }, [dispatch])

  const scheduleSelectedItem = useCallback(() => {

    // TODO: Create a new child object out of the focused item and the focusedListItem
    // TODO: Add that new child to the focusedItem's children array

    // TODO: Create a new parent object out of the focusedListItem and the focusedItem
    // TODO: Add the parent to the focusedListItem's parents array

  }, [dispatch])

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      <TimeQuantityInput />
      <Button onClick={scheduleSelectedItem}>
        Schedule
      </Button>
    </Dialog>
  )
}
