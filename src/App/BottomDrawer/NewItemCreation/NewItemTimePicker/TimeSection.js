import React, { createContext, useCallback, useState } from "react";
import {
  FormControlLabel,
  Input,
  ListItem,
  Stack,
  Switch,
} from "@mui/material";
import { Button } from "@mui/material-next";
import dayjs from "dayjs";

const TimeSectionContext = createContext();

export const TimeSectionProvider = ({ children }) => {
  const [newItemStartTime, setNewItemStartTime] = useState(
    dayjs().add(1, "hour")
  );

  return (
    <TimeSectionContext.Provider
      value={{ newItemStartTime, setNewItemStartTime }}
    >
      {children}
    </TimeSectionContext.Provider>
  );
};

/**
 * @returns {{ newItemStartTime: dayjs.Dayjs, setNewItemStartTime: Function }}
 */
const useTimeSectionContext = () => {
  const context = React.useContext(TimeSectionContext);
  if (context === undefined) {
    throw new Error(
      "useTimeSectionContext must be used within a TimeSectionProvider"
    );
  }
  return context;
};

const TimeSection = () => {
  const { newItemStartTime } = useTimeSectionContext();
  const [checked, setChecked] = useState(false);
  const handleChange = useCallback(
    (event) => {
      setChecked(event.target.checked);
    },
    [setChecked]
  );
  return (
    <ListItem>
      <Stack>
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleChange} />}
          label="Once"
        />
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleChange} />}
          label="Fixed"
        />
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleChange} />}
          label="Schedule"
        />
      </Stack>

      <Stack width="100%">
        <Stack
          justifyContent="space-around"
          alignItems="center"
          direction="row"
        >
          {newItemStartTime.format("dddd, MMM YYYY")}
          <Button variant="elevated">{newItemStartTime.format("h A")}</Button>
        </Stack>
        <Stack
          justifyContent="space-around"
          alignItems="center"
          direction="row"
        >
          {newItemStartTime.format("dddd, MMM YYYY")}
          <Button variant="elevated">{newItemStartTime.format("h A")}</Button>
        </Stack>
      </Stack>
    </ListItem>
  );
};

export default TimeSection;
