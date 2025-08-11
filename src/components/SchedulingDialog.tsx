import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField, Box, Typography } from "@mui/material";
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
  const [isCustomTime, setIsCustomTime] = useState(false)

  // Reset time input when dialog opens
  useEffect(() => {
    if (schedulingDialogOpen) {
      // Reset time and initialize selection from focused or globally selected item
      timeInputDispatch({ type: 'RESET' })
      setChosenItemId(focusedItemId ?? selectedItemId ?? null)
      setIsCustomTime(false)
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

    // Default behavior: schedule now (+2 seconds) unless user set a custom time
    const scheduledTime = isCustomTime ? total : Date.now() + 2000;

    // Schedule directly onto the base calendar (absolute time scheduling)
    const baseCalendarEntry = createBaseCalendarEntry(item.id, scheduledTime)
    dispatch({
      type: "ADD_BASE_CALENDAR_ENTRY",
      payload: { entry: baseCalendarEntry }
    })

    handleClose()
  }, [dispatch, idToSchedule, items, total, handleClose, isCustomTime])

  // Can schedule if we have some item selected (focused or chosen)
  const canSchedule = idToSchedule !== null

  const autocompleteValue: Item | null = useMemo(() => {
    if (focusedItemId) return getItemById(items, focusedItemId)
    if (chosenItemId) return getItemById(items, chosenItemId)
    return null
  }, [focusedItemId, chosenItemId, items])

  // Helper to format remaining time as mm:ss or h:mm:ss
  const formatRemaining = useCallback((ms: number) => {
    const clamped = Math.max(0, ms)
    const totalSeconds = Math.floor(clamped / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const mm = minutes.toString().padStart(hours > 0 ? 2 : 1, '0')
    const ss = seconds.toString().padStart(2, '0')
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
  }, [])

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
        <SchedulingTimeInput
          onUserTimeChange={() => setIsCustomTime(true)}
          onResetToNow={() => setIsCustomTime(false)}
        />
      </DialogContent>
      <DialogActions sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            onClick={scheduleSelectedItem}
            variant="contained"
            color="primary"
            disabled={!canSchedule}
          >
            {isCustomTime ? 'Schedule' : 'Schedule now'}
          </Button>
        </Box>
        {isCustomTime && (
          <Box sx={{ width: '100%', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              starts in {formatRemaining((total ?? 0) - Date.now())}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled for: {new Date(total).toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  )
}
