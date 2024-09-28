import { CALENDAR_VIEWS } from '../../constants';
import t from '../../translation';
import React from 'react';
import SideDrawerProvider from './Provider_SideDrawer';
import SideDrawerReducer, { SideDrawerInitialState } from './Reducer_SideDrawer';
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import ViewDaySharpIcon from "@mui/icons-material/ViewDaySharp";
import CalendarViewWeekSharpIcon from "@mui/icons-material/CalendarViewWeekSharp";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import Code from "@mui/icons-material/Code";

export default function SideDrawer() {
  const [state, dispatch] = React.useReducer(SideDrawerReducer, SideDrawerInitialState);
  const { AboutTimeState: { sideDrawerOpen, selectedView }, AboutTimeDispatch } = useAboutTimeContext();


  const openUpNextView = React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.UP_NEXT },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);

  const openDayView = React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.DAY },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);

  const openWeekView = React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.WEEK },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);

  const openMonthView = React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.MONTH },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);

  const openChangeLog = React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.CHANGELOG },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);

  const toggleSideDrawer = React.useCallback(() => {
    AboutTimeDispatch({ type: "TOGGLE_SIDE_DRAWER" });
  }, [AboutTimeDispatch]);


  return (
    <SideDrawerProvider {...{ state, dispatch }}>
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
    </SideDrawerProvider>
  );
}
