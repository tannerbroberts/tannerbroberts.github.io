import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField, Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
import SchedulingTimeInput from "./SchedulingTimeInput";
import { getItemById } from "../functions/utils/item/index";
import type { Item } from "../functions/utils/item";
import { createBaseCalendarEntry } from "../functions/reducers/AppReducer";
import { useTimeInputState, useTimeInputDispatch } from "../reducerContexts/TimeInput";

export default function SchedulingDialog() {
  const { schedulingDialogOpen, items, focusedItemId, selectedItemId } = useAppState()
  const { total } = useTimeInputState()
  const dispatch = useAppDispatch()
  const timeInputDispatch = useTimeInputDispatch()
  const [chosenItemId, setChosenItemId] = useState<string | null>(null)

  // Reset time input when dialog opens
  useEffect(() => {
    if (schedulingDialogOpen) {
      // Reset time and initialize selection from focused or globally selected item
      timeInputDispatch({ type: 'RESET' })
      setChosenItemId(focusedItemId ?? selectedItemId ?? null)
    }
  }, [schedulingDialogOpen, timeInputDispatch, focusedItemId, selectedItemId])

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: false } })
  }, [dispatch])

  const idToSchedule = focusedItemId ?? chosenItemId ?? null

  const scheduleSelectedItem = useCallback(() => {
    const itemId = idToSchedule
    if (!itemId) return
    const item = getItemById(items, itemId)
    if (item === null) throw new Error(`Item with id ${itemId} not found`)

    // Use the absolute timestamp from the time input
    const scheduledTime = total;

    // Schedule directly onto the base calendar (absolute time scheduling)
    const baseCalendarEntry = createBaseCalendarEntry(item.id, scheduledTime)
    dispatch({
      type: "ADD_BASE_CALENDAR_ENTRY",
      payload: { entry: baseCalendarEntry }
    })

    handleClose()
  }, [dispatch, idToSchedule, items, total, handleClose])

  // Can schedule if we have some item selected (focused or chosen)
  const canSchedule = idToSchedule !== null

  const autocompleteValue: Item | null = useMemo(() => {
    if (focusedItemId) return getItemById(items, focusedItemId)
    if (chosenItemId) return getItemById(items, chosenItemId)
    return null
  }, [focusedItemId, chosenItemId, items])

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      <DialogTitle>
        {focusedItemId === null ? "Schedule Item to Base Calendar" : "Schedule Item"}
      </DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 420, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Item selector appears only when no focused item */}
        <Box>
          <Autocomplete<Item>
            disabled={!!focusedItemId}
            options={items}
            value={autocompleteValue}
            onChange={(_, val: Item | null) => setChosenItemId(val?.id ?? null)}
            getOptionLabel={(opt: Item) => opt.name}
            isOptionEqualToValue={(a: Item, b: Item) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Select item" placeholder="Type to search items" size="small" />
            )}
          />
        </Box>
        <SchedulingTimeInput />
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button
          onClick={scheduleSelectedItem}
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
