import { Box, Input } from "@mui/material";
import { useMemo } from "react";
import { useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";

interface TimeUnit {
  label: string;
  stateValue: number;
  setArg: (val: number) => void;
}

function TimeUnitInput({ label, stateValue, setArg }: TimeUnit) {
  return (
    <Box>
      <Input
        type="number"
        value={stateValue}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          setArg(isNaN(val) ? stateValue : val);
        }}
        sx={{
          // 4 characters wide looks like:
          width: "8ch",
          marginRight: 2,
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px",
        }}
      />
      <span>{label}</span>
    </Box>
  );
}

export default function TimeQuantityInput() {
  const { total, millis, seconds, minutes, hours, days, weeks, years } = useTimeInputState();
  const timeInputDispatch = useTimeInputDispatch();
  const timeUnits = useMemo(() => [
    { key: "argument_millis", label: "Milliseconds", stateValue: millis, setArg: (val: number) => timeInputDispatch({ type: "SET_MILLIS", payload: { millis: val } }) },
    { key: "argument_seconds", label: "Seconds", stateValue: seconds, setArg: (val: number) => timeInputDispatch({ type: "SET_SECONDS", payload: { seconds: val } }) },
    { key: "argument_minutes", label: "Minutes", stateValue: minutes, setArg: (val: number) => timeInputDispatch({ type: "SET_MINUTES", payload: { minutes: val } }) },
    { key: "argument_hours", label: "Hours", stateValue: hours, setArg: (val: number) => timeInputDispatch({ type: "SET_HOURS", payload: { hours: val } }) },
    { key: "argument_days", label: "Days", stateValue: days, setArg: (val: number) => timeInputDispatch({ type: "SET_DAYS", payload: { days: val } }) },
    { key: "argument_weeks", label: "Weeks", stateValue: weeks, setArg: (val: number) => timeInputDispatch({ type: "SET_WEEKS", payload: { weeks: val } }) },
    { key: "argument_years", label: "Years", stateValue: years, setArg: (val: number) => timeInputDispatch({ type: "SET_YEARS", payload: { years: val } }) },
  ], [timeInputDispatch, millis, seconds, minutes, hours, days, weeks, years]);

  return (
    <Box>
      {timeUnits.map(({ key, label, stateValue, setArg }) => (
        <TimeUnitInput
          key={key}
          label={label}
          stateValue={stateValue}
          setArg={setArg}
        />
      ))}
      <Box>
        <span>Total: {total} milliseconds</span>
      </Box>
    </Box>
  );
}
