import { Button, Dialog } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../context/App";
import TimeQuantityInput from "./TimeQuantityInput.tsx";
import { getItemById, scheduleItem } from "../store/utils/item.ts";
import { useTimeInputState } from "../context/TimeInput.ts";

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
  }, [dispatch, focusedItemId, focusedListItemId, items, total])

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      <TimeQuantityInput />
      <Button onClick={scheduleSelectedListItem}>
        Schedule
      </Button>
    </Dialog>
  )
}
