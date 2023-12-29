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
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, 1);
  border-right: 1px solid lightgray;
`;

export default function Shelf() {
  return (
    <div className={shelfCss}>
      <List>
        <ListItemButton>
          <ListItemIcon>
            <SupportAgentSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Heads Up" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <ViewDaySharpIcon />
          </ListItemIcon>
          <ListItemText primary="Day" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <CalendarViewWeekSharpIcon />
          </ListItemIcon>
          <ListItemText primary="Week" />
        </ListItemButton>

        <ListItemButton>
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
