import { Box, Typography, TextField, InputAdornment, Button } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useMemo, useEffect } from "react";
import { useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";

export default function SchedulingTimeInput({ onUserTimeChange, onResetToNow }: Readonly<{ onUserTimeChange?: () => void; onResetToNow?: () => void }>) {
  const { absoluteTimestamp } = useTimeInputState();
  const timeInputDispatch = useTimeInputDispatch();

  // Initialize with current time if no timestamp is set
  const currentTimestamp = useMemo(() =>
    absoluteTimestamp ?? Date.now(),
    [absoluteTimestamp]
  );

  const currentDate = useMemo(() =>
    dayjs(currentTimestamp),
    [currentTimestamp]
  );

  // Extract time components from current timestamp
  const timeComponents = useMemo(() => ({
    hours: currentDate.hour(),
    minutes: currentDate.minute(),
    seconds: currentDate.second(),
    milliseconds: currentDate.millisecond(),
  }), [currentDate]);

  // Initialize the timestamp if not already set
  useEffect(() => {
    if (absoluteTimestamp === null) {
      timeInputDispatch({
        type: "SET_ABSOLUTE_TIMESTAMP",
        payload: { timestamp: Date.now() }
      });
    }
  }, [absoluteTimestamp, timeInputDispatch]);

  const handleDateTimeChange = useCallback((newDate: Dayjs | null) => {
    if (!newDate) return;
    // Preserve current milliseconds when changing via picker (since UI doesn't expose ms)
    const newTimestamp = newDate
      .millisecond(timeComponents.milliseconds)
      .valueOf();

    timeInputDispatch({
      type: "SET_ABSOLUTE_TIMESTAMP",
      payload: { timestamp: newTimestamp }
    });
    onUserTimeChange?.();
  }, [timeInputDispatch, timeComponents.milliseconds, onUserTimeChange]);

  const handleTimeComponentChange = useCallback((
    component: 'hours' | 'minutes' | 'seconds' | 'milliseconds',
    value: number
  ) => {
    let method: 'hour' | 'minute' | 'second' | 'millisecond';
    switch (component) {
      case 'hours':
        method = 'hour';
        break;
      case 'minutes':
        method = 'minute';
        break;
      case 'seconds':
        method = 'second';
        break;
      case 'milliseconds':
        method = 'millisecond';
        break;
    }
    const newTimestamp = currentDate[method](value).valueOf();
    timeInputDispatch({
      type: "SET_ABSOLUTE_TIMESTAMP",
      payload: { timestamp: newTimestamp }
    });
    onUserTimeChange?.();
  }, [currentDate, timeInputDispatch, onUserTimeChange]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Schedule Date & Time</Typography>

        <DateTimePicker
          value={currentDate}
          onChange={handleDateTimeChange}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
          <Button
            type="button"
            size="small"
            variant="text"
            onClick={() => {
              const now = Date.now();
              timeInputDispatch({ type: 'SET_ABSOLUTE_TIMESTAMP', payload: { timestamp: now } });
              onResetToNow?.();
            }}
          >
            Reset to now
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>
            Milliseconds (optional)
          </Typography>
          <TextField
            type="number"
            size="small"
            value={timeComponents.milliseconds}
            slotProps={{
              input: {
                inputProps: { min: 0, max: 999 },
                endAdornment: <InputAdornment position="end">ms</InputAdornment>,
              },
            }}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 999) {
                handleTimeComponentChange('milliseconds', val);
              }
            }}
            sx={{ width: 120 }}
          />
        </Box>

        {/* Summary moved below the Schedule button in SchedulingDialog */}
      </Box>
    </LocalizationProvider>
  );
}
