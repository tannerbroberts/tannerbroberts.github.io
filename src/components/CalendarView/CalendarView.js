import React from "react";
import { useMenuShelfNavigationStateContext } from "../MenuShelfNavigation/MenuShelfNavigationContext";
import { CALENDAR_VIEWS } from "../../utils/constants";
import { css } from "@emotion/css";
import HeadsUp from "./HeadsUp/HeadsUp";
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";

const calendarViewCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

export default function CalendarView() {
  const { selectedView } = useMenuShelfNavigationStateContext();

  return (
    <div className={calendarViewCss}>
      {selectedView === CALENDAR_VIEWS.HEADS_UP && <HeadsUp />}
      {selectedView === CALENDAR_VIEWS.DAY && <Day />}
      {selectedView === CALENDAR_VIEWS.WEEK && <Week />}
      {selectedView === CALENDAR_VIEWS.MONTH && <Month />}
    </div>
  );
}
