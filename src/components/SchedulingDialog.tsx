import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import SchedulingTimeInput from "./SchedulingTimeInput";
import { getItemById } from "../functions/utils/item/index";
import { createBaseCalendarEntry } from "../functions/reducers/AppReducer";
import { useTimeInputState, useTimeInputDispatch } from "../reducerContexts/TimeInput";

export default function SchedulingDialog() {
  const { schedulingDialogOpen, items, focusedItemId, focusedListItemId } = useAppState()
  const { total } = useTimeInputState()
  const dispatch = useAppDispatch()
  const timeInputDispatch = useTimeInputDispatch()

  // Reset time input when dialog opens
  useEffect(() => {
    if (schedulingDialogOpen) {
      timeInputDispatch({ type: 'RESET' })
    }
  }, [schedulingDialogOpen, timeInputDispatch])

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: false } })
  }, [dispatch])

  const scheduleSelectedListItem = useCallback(() => {
    const focusedListItem = getItemById(items, focusedListItemId)
    if (focusedListItem === null) throw new Error(`Item with id ${focusedListItemId} not found`)

    // Use the absolute timestamp from the time input
    const scheduledTime = total;

    // Schedule directly onto the base calendar (absolute time scheduling)
    const baseCalendarEntry = createBaseCalendarEntry(focusedListItem.id, scheduledTime)
    dispatch({
      type: "ADD_BASE_CALENDAR_ENTRY",
      payload: { entry: baseCalendarEntry }
    })

    handleClose()
  }, [dispatch, focusedListItemId, items, total, handleClose])

  // Can schedule if we have a focused list item
  const canSchedule = focusedListItemId !== null

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      <DialogTitle>
        {focusedItemId === null ? "Schedule Item to Base Calendar" : "Schedule Item"}
      </DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 400 }}>
        <SchedulingTimeInput />
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button
          onClick={scheduleSelectedListItem}
          variant="contained"
          color="primary"
          disabled={!canSchedule}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  )
}
