import React from "react";
import { List, ListItemButton, Divider, Stack } from "@mui/material";
import { useCalendarViewContext } from "../CalendarView/CalendarView";
import NewItemTimePicker, {
  NewItemTimePickerProvider,
} from "./NewItemTimePicker";

export default function BottomDrawerContents() {
  const { selectedCalendarView } = useCalendarViewContext();
  let selectedCalendarViewString;
  switch (selectedCalendarView) {
    case 1:
      selectedCalendarViewString = "Headsup";
      break;
    case 2:
      selectedCalendarViewString = "Day";
      break;
    case 3:
      selectedCalendarViewString = "Week";
      break;
    case 4:
      selectedCalendarViewString = "Month";
      break;
    case 5:
      selectedCalendarViewString = "Changelog";
      break;
    default:
      selectedCalendarViewString = "Missing Context Value";
  }
  return (
    <NewItemTimePickerProvider>
      <List>
        <Stack alignItems="center">
          Main View: {selectedCalendarViewString}
        </Stack>
        <Divider />
        <NewItemTimePicker />
        <Divider />
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
      </List>
    </NewItemTimePickerProvider>
  );
}
