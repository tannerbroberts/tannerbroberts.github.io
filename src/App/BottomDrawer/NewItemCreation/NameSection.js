import React from "react";
import { TextField, Stack, MenuItem } from "@mui/material";
import { useCalendarViewContext } from "../../CalendarView/CalendarView";
import { useAppContext } from "../../App";
import { useNewItemCreationContext } from "./NewItemCreation";

export default function NameSection() {
  const {
    newItemName,
    newItemNameIsInvalid,
    newItemTemplate,
    onNewItemNameChange,
    setNewItemName,
    setNewItemTemplate,
  } = useNewItemCreationContext();
  const { selectedCalendarViewString } = useCalendarViewContext();
  const { library } = useAppContext();

  return (
    <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
      <div>{selectedCalendarViewString}</div>
      <Stack direction="row" gap={"10px"}>
        <TextField
          error={newItemNameIsInvalid}
          aria-errormessage="name is taken or invalid"
          label="Name"
          value={newItemName}
          onChange={onNewItemNameChange}
        />
        <TextField
          select
          fullWidth
          label="From Template"
          value={newItemTemplate}
          onSelect={(e) => {
            setNewItemName(e.target.value);
            setNewItemTemplate(e.target.value);
          }}
        >
          {library.map((option) => (
            <MenuItem
              key={option}
              value={option}
              onClick={(e) => {
                setNewItemName(e.target.outerText);
                setNewItemTemplate(e.target.outerText);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </div>
  );
}
