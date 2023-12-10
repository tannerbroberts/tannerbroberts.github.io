import React from "react";
import { Squash as Hamburger } from "hamburger-react";
import { css } from "@emotion/css";
import { useAppDispatchContext, useAppStateContext } from "./AppContext";
import { CALENDAR_VIEWS } from "./api/constants";

const headerCss = css`
  position: absolute;
  height: 50px;
  width: 100%;
  background-color: whitesmoke;
`;

const Header = () => {
  const { shelfOpen, selectedView } = useAppStateContext();
  const dispatch = useAppDispatchContext();

  let calendarType = "";
  switch (selectedView) {
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
    default:
      calendarType = "Invalid view.";
      break;
  }

  return (
    <div className={headerCss}>
      <Hamburger
        toggled={shelfOpen}
        onToggle={() => dispatch({ type: "TOGGLE_SHELF" })}
      />
      {calendarType}
    </div>
  );
};

export default Header;
