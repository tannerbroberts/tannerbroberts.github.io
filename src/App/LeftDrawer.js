import React, { createContext, useCallback } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import ViewDaySharpIcon from "@mui/icons-material/ViewDaySharp";
import CalendarViewWeekSharpIcon from "@mui/icons-material/CalendarViewWeekSharp";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import Code from "@mui/icons-material/Code";
import { CALENDAR_VIEWS } from "../utils/constants";
import { useCalendarViewContext } from "./CalendarView/CalendarView";
import { useLocalStorage } from "@uidotdev/usehooks";

const DrawerContext = createContext();

const useLeftDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};

const LeftDrawerProvider = ({ children }) => {
  const [leftDrawerIsOpen, setLeftDrawerIsOpen] = useLocalStorage(
    "leftDrawerIsOpen",
    false
  );
  const closeLeftDrawer = useCallback(
    () => setLeftDrawerIsOpen(false),
    [setLeftDrawerIsOpen]
  );
  const openLeftDrawer = useCallback(
    () => setLeftDrawerIsOpen(true),
    [setLeftDrawerIsOpen]
  );

  return (
    <DrawerContext.Provider
      value={{
        leftDrawerIsOpen,
        closeLeftDrawer,
        openLeftDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

const LeftDrawer = () => {
  const { leftDrawerIsOpen, closeLeftDrawer } = useLeftDrawerContext();
  const { selectedCalendarView, setSelectedCalendarView } =
    useCalendarViewContext();

  return (
    <Drawer open={leftDrawerIsOpen} onClose={closeLeftDrawer}>
      <List>
        <ListItemButton
          selected={selectedCalendarView === CALENDAR_VIEWS.HEADS_UP}
          onClick={() => {
            closeLeftDrawer();
            setSelectedCalendarView(CALENDAR_VIEWS.HEADS_UP);
          }}
        >
          <ListItemIcon>
            <SupportAgentSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Heads Up" />
        </ListItemButton>

        <ListItemButton
          selected={selectedCalendarView === CALENDAR_VIEWS.DAY}
          onClick={() => {
            closeLeftDrawer();
            setSelectedCalendarView(CALENDAR_VIEWS.DAY);
          }}
        >
          <ListItemIcon>
            <ViewDaySharpIcon />
          </ListItemIcon>
          <ListItemText primary="Day" />
        </ListItemButton>

        <ListItemButton
          selected={selectedCalendarView === CALENDAR_VIEWS.WEEK}
          onClick={() => {
            closeLeftDrawer();
            setSelectedCalendarView(CALENDAR_VIEWS.WEEK);
          }}
        >
          <ListItemIcon>
            <CalendarViewWeekSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Week" />
        </ListItemButton>

        <ListItemButton
          selected={selectedCalendarView === CALENDAR_VIEWS.MONTH}
          onClick={() => {
            closeLeftDrawer();
            setSelectedCalendarView(CALENDAR_VIEWS.MONTH);
          }}
        >
          <ListItemIcon>
            <CalendarMonthSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Month" />
        </ListItemButton>

        <ListItemButton
          selected={selectedCalendarView === CALENDAR_VIEWS.CHANGELOG}
          onClick={() => {
            closeLeftDrawer();
            setSelectedCalendarView(CALENDAR_VIEWS.CHANGELOG);
          }}
        >
          <ListItemIcon>
            <Code />
          </ListItemIcon>
          <ListItemText primary="Dev Log" />
        </ListItemButton>

        <Divider />
      </List>
    </Drawer>
  );
};

export { LeftDrawer as default, LeftDrawerProvider, useLeftDrawerContext };
