import { Box, Input } from "@mui/material";
import { useCallback, useState } from "react";

interface TimeUpdateArgs {
  argument_millis?: number;
  argument_seconds?: number;
  argument_minutes?: number;
  argument_hours?: number;
  argument_days?: number;
  argument_weeks?: number;
  argument_years?: number;
}

interface TimeUnit {
  key: keyof TimeUpdateArgs;
  label: string;
  stateValue: number;
  setArg: (val: number) => void;
}

function TimeUnitInput({ unit, value, onChange }: {
  unit: TimeUnit;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <Box>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(isNaN(val) ? value : val);
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
      <span>{unit.label}</span>
    </Box>
  );
}

export default function TimeQuantityInput({ defaultMillis = 0 }: { defaultMillis?: number }) {
  const [millis, setMillis] = useState(defaultMillis % 1000);
  const [seconds, setSeconds] = useState(defaultMillis / 1000 % 60);
  const [minutes, setMinutes] = useState(defaultMillis / 60 / 1000 % 60);
  const [hours, setHours] = useState(defaultMillis / 60 / 60 / 1000 % 24);
  const [days, setDays] = useState(defaultMillis / 24 / 60 / 60 / 1000 % 7);
  const [weeks, setWeeks] = useState(defaultMillis / 7 / 24 / 60 / 60 / 1000 % 52);
  const [years, setYears] = useState(defaultMillis / 365 / 24 / 60 / 60 / 1000 % 100);
  const [total, sT] = useState(defaultMillis);

  const setTotal = useCallback(
    ({
      argument_millis,
      argument_seconds,
      argument_minutes,
      argument_hours,
      argument_days,
      argument_weeks,
      argument_years
    }: TimeUpdateArgs) => {
      if (argument_millis !== undefined) setMillis(argument_millis);
      if (argument_seconds !== undefined) setSeconds(argument_seconds);
      if (argument_minutes !== undefined) setMinutes(argument_minutes);
      if (argument_hours !== undefined) setHours(argument_hours);
      if (argument_days !== undefined) setDays(argument_days);
      if (argument_weeks !== undefined) setWeeks(argument_weeks);
      if (argument_years !== undefined) setYears(argument_years);

      const newMillis = argument_millis ?? millis;
      const newSeconds = argument_seconds ?? seconds;
      const newMinutes = argument_minutes ?? minutes;
      const newHours = argument_hours ?? hours;
      const newDays = argument_days ?? days;
      const newWeeks = argument_weeks ?? weeks;
      const newYears = argument_years ?? years;

      sT(
        newMillis +
        newSeconds * 1000 +
        newMinutes * 60 * 1000 +
        newHours * 60 * 60 * 1000 +
        newDays * 24 * 60 * 60 * 1000 +
        newWeeks * 7 * 24 * 60 * 60 * 1000 +
        newYears * 365 * 24 * 60 * 60 * 1000
      );
    }, [days, hours, millis, minutes, seconds, weeks, years]);

  const timeUnits: TimeUnit[] = [
    { key: 'argument_years', label: 'years', stateValue: years, setArg: (val) => setTotal({ argument_years: val }) },
    { key: 'argument_weeks', label: 'weeks', stateValue: weeks, setArg: (val) => setTotal({ argument_weeks: val }) },
    { key: 'argument_days', label: 'days', stateValue: days, setArg: (val) => setTotal({ argument_days: val }) },
    { key: 'argument_hours', label: 'hours', stateValue: hours, setArg: (val) => setTotal({ argument_hours: val }) },
    { key: 'argument_minutes', label: 'minutes', stateValue: minutes, setArg: (val) => setTotal({ argument_minutes: val }) },
    { key: 'argument_seconds', label: 'seconds', stateValue: seconds, setArg: (val) => setTotal({ argument_seconds: val }) },
    { key: 'argument_millis', label: 'milliseconds', stateValue: millis, setArg: (val) => setTotal({ argument_millis: val }) },
  ];

  return (
    <Box>
      {timeUnits.map((unit) => (
        <TimeUnitInput
          key={unit.key}
          unit={unit}
          value={unit.stateValue}
          onChange={unit.setArg}
        />
      ))}
      <Box>
        <span>Total: {total} milliseconds</span>
      </Box>
    </Box>
  );
}