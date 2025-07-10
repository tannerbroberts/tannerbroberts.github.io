import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import TimeQuantityInput from "./TimeQuantityInput";
import { getItemById, scheduleItem } from "../functions/utils/item";
import { useTimeInputState } from "../reducerContexts/TimeInput";

export default function SchedulingDialog() {
  const { schedulingDialogOpen, items, focusedItemId, focusedListItemId } = useAppState()
  const { total } = useTimeInputState()
  const dispatch = useAppDispatch()

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: false } })
  }, [dispatch])

  const scheduleSelectedListItem = useCallback(() => {
    const focusedItem = getItemById(items, focusedItemId)
    const focusedListItem = getItemById(items, focusedListItemId)
    if (focusedItem === null) throw new Error(`Item with id ${focusedItemId} not found`)
    if (focusedListItem === null) throw new Error(`Item with id ${focusedListItemId} not found`)
    const { newParentItem, newChildItem } = scheduleItem({
      childItem: focusedListItem,
      parentItem: focusedItem,
      start: total,
    })

    dispatch({ type: "UPDATE_ITEMS", payload: { updatedItems: [newParentItem, newChildItem] } })
    handleClose()
  }, [dispatch, focusedItemId, focusedListItemId, items, total, handleClose])

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      <DialogTitle>Schedule Item</DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 300 }}>
        <TimeQuantityInput />
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button onClick={scheduleSelectedListItem} variant="contained" color="primary">
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  )
}
