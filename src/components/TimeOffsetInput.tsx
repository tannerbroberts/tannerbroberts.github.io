import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function TimeOffsetInput({
  milliseconds,
  setMilliseconds,
  seconds,
  setSeconds,
  minutes,
  setMinutes,
  hours,
  setHours
}: {
  milliseconds: number,
  setMilliseconds: (newValue: number) => void,
  seconds: number,
  setSeconds: (newValue: number) => void,
  minutes: number,
  setMinutes: (newValue: number) => void,
  hours: number,
  setHours: (newValue: number) => void
}) {

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <TimeInputColumn
          label="Hours"
          value={hours}
          onChange={setHours}
        />
        <Typography>:</Typography>
        <TimeInputColumn
          label="Minutes"
          value={minutes}
          onChange={setMinutes}
          max={59}
        />
        <Typography>:</Typography>
        <TimeInputColumn
          label="Seconds"
          value={seconds}
          onChange={setSeconds}
          max={59}
        />
        <Typography>.</Typography>
        <TimeInputColumn
          label="Milliseconds"
          value={milliseconds}
          onChange={setMilliseconds}
          max={999}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Total milliseconds: {(hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000) + milliseconds}
      </Typography>
    </Box>
  )
}

function TimeInputColumn({
  value,
  onChange,
  label,
  max = Infinity
}: {
  value: number,
  onChange: (newValue: number) => void,
  label: string,
  max?: number
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100px' }}>
      <Button
        onClick={() => onChange(Math.min(max, value + 1))}
        sx={{ minWidth: '100%' }}
      >
        <KeyboardArrowUp />
      </Button>
      <TextField
        label={label}
        type="number"
        InputProps={{ inputProps: { min: 0, max, style: { textAlign: 'center' } } }}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        size="small"
        sx={{ my: 1 }}
      />
      <Button
        onClick={() => onChange(Math.max(0, value - 1))}
        sx={{ minWidth: '100%' }}
      >
        <KeyboardArrowDown />
      </Button>
    </Box>
  )
}