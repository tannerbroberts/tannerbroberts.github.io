import React, { createContext, useState } from "react";
import { ListItem, Stack } from "@mui/material";
import { Button } from "@mui/material-next";
import dayjs from "dayjs";

const NewItemTimePickerContext = createContext();

export const NewItemTimePickerProvider = ({ children }) => {
  const [newItemStartTime, setNewItemStartTime] = useState(
    dayjs().add(1, "hour")
  );

  return (
    <NewItemTimePickerContext.Provider
      value={{ newItemStartTime, setNewItemStartTime }}
    >
      {children}
    </NewItemTimePickerContext.Provider>
  );
};

const useNewItemTimePickerContext = () => {
  const context = React.useContext(NewItemTimePickerContext);
  if (context === undefined) {
    throw new Error(
      "useNewItemTimePickerContext must be used within a NewItemTimePickerProvider"
    );
  }
  return context;
};

const NewItemTimePicker = () => {
  const { newItemStartTime } = useNewItemTimePickerContext();
  return (
    <ListItem>
      <Stack width={"100%"} spacing={2}>
        <Stack width={"100%"} justifyContent="space-between" direction="row">
          {newItemStartTime.format("dddd, MMM YYYY")}
          <Button variant="elevated">{newItemStartTime.format("h A")}</Button>
        </Stack>
        <Stack width={"100%"} justifyContent="space-between" direction="row">
          {newItemStartTime.format("dddd, MMM YYYY")}
          <Button variant="elevated">{newItemStartTime.format("h A")}</Button>
        </Stack>
      </Stack>
    </ListItem>
  );
};

export default NewItemTimePicker;
