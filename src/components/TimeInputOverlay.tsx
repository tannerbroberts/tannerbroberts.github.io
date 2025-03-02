import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input } from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";
import TimeOffsetInput from "./TimeOffsetInput";
import { useState } from "react";

interface TimeInputOverlayProps extends DialogProps {
  onCustomSubmit?: (duration: number, name: string) => void;
  prompt: string;
}

export default function TimeInputOverlay(props: TimeInputOverlayProps) {
  const { onCustomSubmit, prompt, ...dialogProps } = props;
  const [name, setName] = useState("");
  const [milliseconds, setMilliseconds] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  const handleSubmit = () => {
    const totalMs =
      (hours * 60 * 60 * 1000) +
      (minutes * 60 * 1000) +
      (seconds * 1000) +
      milliseconds;

    if (onCustomSubmit) {
      onCustomSubmit(totalMs, name);
    }

    if (props.onClose) {
      props.onClose({}, "backdropClick");
    }
  };

  return (
    <Dialog {...dialogProps}>
      <DialogTitle>
        {prompt}
      </DialogTitle>
      <DialogContent>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TimeOffsetInput
          milliseconds={milliseconds}
          setMilliseconds={setMilliseconds}
          seconds={seconds}
          setSeconds={setSeconds}
          minutes={minutes}
          setMinutes={setMinutes}
          hours={hours}
          setHours={setHours}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => props.onClose?.(e, "backdropClick")}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
