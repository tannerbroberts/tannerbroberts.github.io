import React from "react";
import { css } from "@emotion/css";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import CalendarViewWeekSharpIcon from "@mui/icons-material/CalendarViewWeekSharp";
import ViewDaySharpIcon from "@mui/icons-material/ViewDaySharp";
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import { useAppDispatchContext } from "./AppContext";

const shelfCss = css`
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
  return (
    <div className={shelfCss}>
      <List>
        <ListItemButton onClick={() => dispatch({ type: "SELECT_HEADS_UP" })}>
          <ListItemIcon>
            <SupportAgentSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Heads Up" />
        </ListItemButton>

        <ListItemButton onClick={() => dispatch({ type: "SELECT_DAY" })}>
          <ListItemIcon>
            <ViewDaySharpIcon />
          </ListItemIcon>
          <ListItemText primary="Day" />
        </ListItemButton>

        <ListItemButton onClick={() => dispatch({ type: "SELECT_WEEK" })}>
          <ListItemIcon>
            <CalendarViewWeekSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Week" />
        </ListItemButton>

        <ListItemButton onClick={() => dispatch({ type: "SELECT_MONTH" })}>
          <ListItemIcon>
            <CalendarMonthSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Month" />
        </ListItemButton>
      </List>
    </div>
  );
}
