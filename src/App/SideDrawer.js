import React from "react";
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
import { CALENDAR_VIEWS } from "./ViewHandler/ViewHandler";
import { useAppContext } from "./App";
import t from "../translation";

export default function SideDrawer() {
  const { appState: { sideDrawerOpen, selectedView }, appDispatch } = useAppContext();

  const openUpNextView = React.useCallback(() => {
    appDispatch([
      { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.UP_NEXT },
      { type: "TOGGLE_SIDE_DRAWER", value: false },
    ]);
  }, [appDispatch]);

  const openDayView = React.useCallback(() => {
    appDispatch([
      { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.DAY },
      { type: "TOGGLE_SIDE_DRAWER", value: false },
    ])
  }, [appDispatch]);

  const openWeekView = React.useCallback(() => {
    appDispatch([
      { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.WEEK },
      { type: "TOGGLE_SIDE_DRAWER", value: false },
    ])
  }, [appDispatch]);

  const openMonthView = React.useCallback(() => {
    appDispatch([
      { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.MONTH },
      { type: "TOGGLE_SIDE_DRAWER", value: false },
    ])
  }, [appDispatch]);

  const openChangeLog = React.useCallback(() => {
    appDispatch([
      { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.CHANGELOG },
      { type: "TOGGLE_SIDE_DRAWER", value: false },
    ])
  }, [appDispatch]);

  const toggleSideDrawer = React.useCallback(() => {
    appDispatch({ type: "TOGGLE_SIDE_DRAWER" });
  }, [appDispatch]);

  return (
    <Drawer open={sideDrawerOpen} onClose={toggleSideDrawer}>
      <List>
        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.UP_NEXT}
          onClick={openUpNextView}
        >
          <ListItemIcon>
            <SupportAgentSharpIcon />
          </ListItemIcon>
          <ListItemText primary={t(CALENDAR_VIEWS.UP_NEXT)} />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.DAY}
          onClick={openDayView}
        >
          <ListItemIcon>
            <ViewDaySharpIcon />
          </ListItemIcon>
          <ListItemText primary={t(CALENDAR_VIEWS.DAY)} />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.WEEK}
          onClick={openWeekView}
        >
          <ListItemIcon>
            <CalendarViewWeekSharpIcon />
          </ListItemIcon>
          <ListItemText primary={t(CALENDAR_VIEWS.WEEK)} />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.MONTH}
          onClick={openMonthView}
        >
          <ListItemIcon>
            <CalendarMonthSharpIcon />
          </ListItemIcon>
          <ListItemText primary={t(CALENDAR_VIEWS.MONTH)} />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.CHANGELOG}
          onClick={openChangeLog}
        >
          <ListItemIcon>
            <Code />
          </ListItemIcon>
          <ListItemText primary={t(CALENDAR_VIEWS.CHANGELOG)} />
        </ListItemButton>

        <Divider />
      </List>
    </Drawer>
  );
};
