import React, { useCallback } from "react";
import { TextField, Stack, MenuItem } from "@mui/material";
import { useCalendarViewContext } from "../CalendarView/CalendarView";
import { useAppContext } from "../App";

export default function NameSection() {
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemTemplate, setNewItemTemplate] = React.useState("");
  const { selectedCalendarViewString } = useCalendarViewContext();
  const { library } = useAppContext();

  const handleNewItemNameChange = useCallback((event) => {
    setNewItemName(event.target.value);
  }, []);

  const handleNewItemTemplateChange = useCallback((event) => {
    setNewItemTemplate(event.target.value);
  }, []);

  return (
    <div>
      <div>{selectedCalendarViewString}</div>
      <Stack direction="row">
        <TextField
          label="Name"
          value={newItemName}
          onChange={handleNewItemNameChange}
        />
        <TextField
          fullWidth
          label="From Template"
          select
          value={newItemTemplate}
          onChange={(e) => {
            handleNewItemNameChange(e);
            handleNewItemTemplateChange(e);
          }}
        >
          <MenuItem key="" value="">
            <TextField
              fullWidth
              label="Use Filter"
              select
              value={newItemTemplate}
              onChange={handleNewItemTemplateChange}
            />
          </MenuItem>
          {library.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </div>
  );
}
