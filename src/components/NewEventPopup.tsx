import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { EventStore, Event } from "../eventUtils";
import LengthInput from "./LengthInput";

type NewEventPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
};

export default function NewEventPopup({
  isOpen,
  onClose,
  onSave,
}: NewEventPopupProps) {
  const [name, setName] = useState("");
  const [length, setLength] = useState(0);
  const store = React.useRef(EventStore.getList());

  const handleSave = () => {
    const newEvent = store.current.create({ name, length });
    onSave(newEvent);
    setName(""); // Clear name input
    setLength(0); // Clear length input
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Event Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <LengthInput length={length} setLength={setLength} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
