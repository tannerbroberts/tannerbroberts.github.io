import React from "react";
import { CALENDAR_VIEWS } from "../../utils/constants";
import { css } from "@emotion/css";
import Headsup from "./Headsup";
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";

const calendarViewCss = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

export default function CalendarView() {
  const selectedView = CALENDAR_VIEWS.HEADS_UP;

  return (
    <div className={calendarViewCss}>
      {selectedView === CALENDAR_VIEWS.HEADS_UP && <Headsup />}
      {selectedView === CALENDAR_VIEWS.DAY && <Day />}
      {selectedView === CALENDAR_VIEWS.WEEK && <Week />}
      {selectedView === CALENDAR_VIEWS.MONTH && <Month />}
    </div>
  );
}
