import React from "react";
import { Add } from "@mui/icons-material";
import { css } from "@emotion/css";
import { Fab } from "@mui/material";
import { useBottomDrawerContext } from "./BottomDrawer/BottomDrawer";
import { CALENDAR_VIEWS } from "../utils/constants";
import { useCalendarViewContext } from "./CalendarView/CalendarView";

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const { bottomDrawerIsOpen, toggleBottomDrawer } = useBottomDrawerContext();
  const { selectedCalendarView } = useCalendarViewContext();
  if (!bottomDrawerIsOpen && selectedCalendarView !== CALENDAR_VIEWS.CHANGELOG)
    return (
      <div className={fabStyle}>
        <Fab color="primary" aria-label="add" onClick={toggleBottomDrawer}>
          <Add />
        </Fab>
      </div>
    );
  return null;
}
