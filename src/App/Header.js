import React from "react";
import { Squash as Hamburger } from "hamburger-react";
import { css } from "@emotion/css";
import { CALENDAR_VIEWS } from "../utils/constants";
import { useLeftDrawerContext } from "./LeftDrawer";
import { useCalendarViewContext } from "./CalendarView/CalendarView";

const headerCss = css`
  z-index: 1;
  box-sizing: border-box;
  border-bottom: 1px solid lightgray;
  position: absolute;
  display: flex;
  flex-direction: row;
  height: 50px;
  width: 100%;
  background-color: whitesmoke;
`;

const headerTextCss = css`
  display: flex;
  align-items: center;
  margin-left: 15px;
  font-size: 20px;
  font-weight: bold;
`;

const Header = () => {
  const { leftDrawerIsOpen, openLeftDrawer } = useLeftDrawerContext();
  const { selectedCalendarView } = useCalendarViewContext();
  let calendarType = "";
  switch (selectedCalendarView) {
    case CALENDAR_VIEWS.HEADS_UP:
      calendarType = "Heads Up";
      break;
    case CALENDAR_VIEWS.DAY:
      calendarType = "Day";
      break;
    case CALENDAR_VIEWS.WEEK:
      calendarType = "Week";
      break;
    case CALENDAR_VIEWS.MONTH:
      calendarType = "Month";
      break;
    case CALENDAR_VIEWS.CHANGELOG:
      calendarType = "Software Change Log";
      break;
    default:
      calendarType = "Invalid view.";
      break;
  }

  return (
    <div className={headerCss}>
      <Hamburger toggled={leftDrawerIsOpen} toggle={openLeftDrawer} />
      <div className={headerTextCss}>{calendarType}</div>
    </div>
  );
};

export default Header;
