import { Box, Input, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useMemo, useEffect } from "react";
import { useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";

interface TimeUnit {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

function TimeUnitInput({ label, value, onChange, max }: Readonly<TimeUnit>) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0 && (!max || val <= max)) {
      onChange(val);
    }
  }, [onChange, max]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography variant="body2" sx={{ minWidth: 100 }}>
        {label}:
      </Typography>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        inputProps={{ min: 0, max }}
        sx={{
          width: "8ch",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px",
        }}
      />
    </Box>
  );
}

export default function SchedulingTimeInput() {
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

  const handleDateChange = useCallback((newDate: Dayjs | null) => {
    if (newDate) {
      // Keep existing time components, just change the date
      const newTimestamp = newDate
        .hour(timeComponents.hours)
        .minute(timeComponents.minutes)
        .second(timeComponents.seconds)
        .millisecond(timeComponents.milliseconds)
        .valueOf();

      timeInputDispatch({
        type: "SET_ABSOLUTE_TIMESTAMP",
        payload: { timestamp: newTimestamp }
      });
    }
  }, [timeInputDispatch, timeComponents]);

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
  }, [currentDate, timeInputDispatch]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Schedule Date & Time</Typography>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Select Date:
          </Typography>
          <DatePicker
            value={currentDate}
            onChange={handleDateChange}
            sx={{ width: '100%' }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Set Time:
          </Typography>
          <TimeUnitInput
            label="Hours"
            value={timeComponents.hours}
            onChange={(val) => handleTimeComponentChange('hours', val)}
            max={23}
          />
          <TimeUnitInput
            label="Minutes"
            value={timeComponents.minutes}
            onChange={(val) => handleTimeComponentChange('minutes', val)}
            max={59}
          />
          <TimeUnitInput
            label="Seconds"
            value={timeComponents.seconds}
            onChange={(val) => handleTimeComponentChange('seconds', val)}
            max={59}
          />
          <TimeUnitInput
            label="Milliseconds"
            value={timeComponents.milliseconds}
            onChange={(val) => handleTimeComponentChange('milliseconds', val)}
            max={999}
          />
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Scheduled for: {currentDate.format('MMMM D, YYYY at h:mm:ss.SSS A')}
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
