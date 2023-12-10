import React from "react";
import { css } from "@emotion/css";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import CalendarViewWeekSharpIcon from "@mui/icons-material/CalendarViewWeekSharp";
import ViewDaySharpIcon from "@mui/icons-material/ViewDaySharp";
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import { useAppDispatchContext, useAppStateContext } from "./AppContext";
import { CALENDAR_VIEWS } from "./api/constants";

const shelfCss = css`
  box-sizing: border-box;
  z-index: 1;
  position: absolute;
  top: 50px;
  height: calc(100% - 50px);
  width: 200px;
  display: flex;
  flex-direction: column;
  background-color: whitesmoke;
  // Make the shelf float above the rest of the app but not the header
  box-shadow: 0 50px 50px 0 rgba(0, 0, 0, 0.5);
  border: 1px solid lightgray;
`;

export default function Shelf() {
  const dispatch = useAppDispatchContext();
  const { selectedView } = useAppStateContext();
  return (
    <div className={shelfCss}>
      <List>
        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.HEADS_UP}
          onClick={() => dispatch({ type: "SELECT_HEADS_UP" })}
        >
          <ListItemIcon>
            <SupportAgentSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Heads Up" />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.DAY}
          onClick={() => dispatch({ type: "SELECT_DAY" })}
        >
          <ListItemIcon>
            <ViewDaySharpIcon />
          </ListItemIcon>
          <ListItemText primary="Day" />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.WEEK}
          onClick={() => dispatch({ type: "SELECT_WEEK" })}
        >
          <ListItemIcon>
            <CalendarViewWeekSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Week" />
        </ListItemButton>

        <ListItemButton
          selected={selectedView === CALENDAR_VIEWS.MONTH}
          onClick={() => dispatch({ type: "SELECT_MONTH" })}
        >
          <ListItemIcon>
            <CalendarMonthSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Month" />
        </ListItemButton>

        <Divider />
      </List>
    </div>
  );
}
