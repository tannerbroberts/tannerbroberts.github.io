import { CALENDAR_VIEWS } from '../../constants';
import t from '../../translation';
import React from 'react';
import SideDrawerProvider from './Provider_SideDrawer';
import SideDrawerReducer, { SideDrawerInitialState } from './Reducer_SideDrawer';
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import ItemLibrary from '../ItemLibrary';
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import ViewDaySharpIcon from "@mui/icons-material/ViewDaySharp";
import CalendarViewWeekSharpIcon from "@mui/icons-material/CalendarViewWeekSharp";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import Code from "@mui/icons-material/Code";

export default function SideDrawer() {
  const [state, dispatch] = React.useReducer(SideDrawerReducer, SideDrawerInitialState);
  const { AboutTimeState: { sideDrawerOpen, selectedView } } = useAboutTimeContext();

  const onUpNextClick = useOnUpNextClick();
  const onDayViewClick = useOnDayViewClick();
  const onWeekViewClick = useOnWeekViewClick();
  const onMonthViewClick = useOnMonthViewClick();
  const onChangelogClick = useOnChangelogClick();

  const toggleSideDrawer = useToggleSideDrawer();
  useRegisterPress_S_ToToggleSideDrawer();

  const VIEWS = React.useMemo(() => {
    return [
      { Icon: SupportAgentSharpIcon, selected: selectedView === CALENDAR_VIEWS.UP_NEXT, onClick: onUpNextClick, text: t(CALENDAR_VIEWS.UP_NEXT) },
      { Icon: ViewDaySharpIcon, selected: selectedView === CALENDAR_VIEWS.DAY, onClick: onDayViewClick, text: t(CALENDAR_VIEWS.DAY) },
      { Icon: CalendarViewWeekSharpIcon, selected: selectedView === CALENDAR_VIEWS.WEEK, onClick: onWeekViewClick, text: t(CALENDAR_VIEWS.WEEK) },
      { Icon: CalendarMonthSharpIcon, selected: selectedView === CALENDAR_VIEWS.MONTH, onClick: onMonthViewClick, text: t(CALENDAR_VIEWS.MONTH) },
      { Icon: Code, selected: selectedView === CALENDAR_VIEWS.CHANGELOG, onClick: onChangelogClick, text: t(CALENDAR_VIEWS.CHANGELOG) },
    ]
  }, [onChangelogClick, onDayViewClick, onMonthViewClick, onUpNextClick, onWeekViewClick, selectedView]);


  return (
    <SideDrawerProvider {...{ state, dispatch }}>
      <Drawer open={sideDrawerOpen} onClose={toggleSideDrawer}>
        <List>
          {VIEWS.map(({ Icon, selected, onClick, text }) => {
            return (
              <ListItemButton key={text} selected={selected} onClick={onClick}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            )
          })}
          <Divider />
          <ItemLibrary />
        </List>
      </Drawer>
    </SideDrawerProvider>
  );
}

function useOnUpNextClick() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.UP_NEXT },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);
}

function useOnDayViewClick() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.DAY },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);
}

function useOnWeekViewClick() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.WEEK },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);
}

function useOnMonthViewClick() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.MONTH },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);
}

function useOnChangelogClick() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({
      type: "BATCH", value: [
        { type: "SET_SELECTED_VIEW", value: CALENDAR_VIEWS.CHANGELOG },
        { type: "TOGGLE_SIDE_DRAWER", value: false },
      ]
    })
  }, [AboutTimeDispatch]);
}


function useRegisterPress_S_ToToggleSideDrawer() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  React.useEffect(() => {
    const listenForS = (event) => {
      if (event.key === "s") {
        AboutTimeDispatch({ type: 'TOGGLE_SIDE_DRAWER' });
      }
    }
    window.addEventListener("keydown", listenForS);
    return () => window.removeEventListener("keydown", listenForS);
  }, [AboutTimeDispatch]);

}

function useToggleSideDrawer() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => AboutTimeDispatch({ type: "TOGGLE_SIDE_DRAWER" }), [AboutTimeDispatch]);
}