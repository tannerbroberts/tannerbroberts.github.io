import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";
import { useState } from "react";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface TimeInputOverlayProps extends DialogProps {
  onCustomSubmit?: (milliseconds: number) => void;
}

export default function TimeInputOverlay(props: TimeInputOverlayProps) {
  const { onCustomSubmit, ...dialogProps } = props;
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [milliseconds, setMilliseconds] = useState<number>(0);

  const handleSubmit = () => {
    const totalMs =
      (hours * 60 * 60 * 1000) +
      (minutes * 60 * 1000) +
      (seconds * 1000) +
      milliseconds;

    if (onCustomSubmit) {
      onCustomSubmit(totalMs);
    }

    if (props.onClose) {
      props.onClose({}, "backdropClick");
    }
  };

  const TimeInputColumn = ({
    value,
    onChange,
    label,
    max = Infinity
  }: {
    value: number,
    onChange: (newValue: number) => void,
    label: string,
    max?: number
  }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100px' }}>
      <Button
        onClick={() => onChange(Math.min(max, value + 1))}
        sx={{ minWidth: '100%' }}
      >
        <KeyboardArrowUpIcon />
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
        <KeyboardArrowDownIcon />
      </Button>
    </Box>
  );

  return (
    <Dialog {...dialogProps}>
      <DialogTitle>
        Enter Scheduling Offset:
      </DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => props.onClose?.(e, "backdropClick")}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
