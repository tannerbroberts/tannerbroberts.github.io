import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { getItemById } from "../functions/utils/item";
import { createBaseCalendarEntry } from "../functions/reducers/AppReducer";
import { useTimeInputState, useTimeInputDispatch } from "../reducerContexts/TimeInput";

interface TimeUnitControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function TimeUnitControl({ label, value, onChange }: Readonly<TimeUnitControlProps>) {
  const handleIncrement = useCallback((amount: number) => {
    const newValue = Math.max(0, value + amount);
    onChange(newValue);
  }, [value, onChange]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(0, parseInt(event.target.value) || 0);
    onChange(newValue);
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 100 }}>
        {label}:
      </Typography>
      <IconButton
        size="small"
        onClick={() => handleIncrement(-5)}
        disabled={value === 0}
      >
        <Remove />
      </IconButton>
      <Button
        size="small"
        onClick={() => handleIncrement(-1)}
        disabled={value === 0}
        sx={{ minWidth: 30 }}
      >
        -1
      </Button>
      <TextField
        type="number"
        value={value}
        onChange={handleInputChange}
        size="small"
        sx={{
          width: 80,
          '& input': { textAlign: 'center' }
        }}
        slotProps={{
          htmlInput: { min: 0 }
        }}
      />
      <Button
        size="small"
        onClick={() => handleIncrement(1)}
        sx={{ minWidth: 30 }}
      >
        +1
      </Button>
      <IconButton
        size="small"
        onClick={() => handleIncrement(5)}
      >
        <Add />
      </IconButton>
    </Box>
  );
}

export default function DurationDialog() {
  const { durationDialogOpen, items, focusedListItemId } = useAppState();
  const { weeks, days, hours, minutes, seconds, millis, total } = useTimeInputState();
  const dispatch = useAppDispatch();
  const timeInputDispatch = useTimeInputDispatch();

  // Reset time input when dialog opens
  useEffect(() => {
    if (durationDialogOpen) {
      timeInputDispatch({ type: 'RESET' });
    }
  }, [durationDialogOpen, timeInputDispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: false } });
  }, [dispatch]);

  const scheduleSelectedListItem = useCallback(() => {
    const focusedListItem = getItemById(items, focusedListItemId);
    if (focusedListItem === null) throw new Error(`Item with id ${focusedListItemId} not found`);

    // Use the current time plus the duration from the time input
    const scheduledTime = Date.now() + total;

    // Schedule directly onto the base calendar
    const baseCalendarEntry = createBaseCalendarEntry(focusedListItem.id, scheduledTime);
    dispatch({
      type: "ADD_BASE_CALENDAR_ENTRY",
      payload: { entry: baseCalendarEntry }
    });

    handleClose();
  }, [dispatch, focusedListItemId, items, total, handleClose]);

  // Can schedule if we have a focused list item
  const canSchedule = focusedListItemId !== null;

  return (
    <Dialog open={durationDialogOpen} onClose={handleClose}>
      <DialogTitle>
        Schedule Item in Duration
      </DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 450 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Set Duration from Now:
          </Typography>

          <TimeUnitControl
            label="Weeks"
            value={weeks}
            onChange={(val) => timeInputDispatch({ type: 'SET_WEEKS', payload: { weeks: val } })}
          />

          <TimeUnitControl
            label="Days"
            value={days}
            onChange={(val) => timeInputDispatch({ type: 'SET_DAYS', payload: { days: val } })}
          />

          <TimeUnitControl
            label="Hours"
            value={hours}
            onChange={(val) => timeInputDispatch({ type: 'SET_HOURS', payload: { hours: val } })}
          />

          <TimeUnitControl
            label="Minutes"
            value={minutes}
            onChange={(val) => timeInputDispatch({ type: 'SET_MINUTES', payload: { minutes: val } })}
          />

          <TimeUnitControl
            label="Seconds"
            value={seconds}
            onChange={(val) => timeInputDispatch({ type: 'SET_SECONDS', payload: { seconds: val } })}
          />

          <TimeUnitControl
            label="Milliseconds"
            value={millis}
            onChange={(val) => timeInputDispatch({ type: 'SET_MILLIS', payload: { millis: val } })}
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {total === 0 ?
                "Will schedule immediately" :
                `Will schedule in ${total}ms (${new Date(Date.now() + total).toLocaleString()})`
              }
            </Typography>
          </Box>
        </Box>
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
  );
}
