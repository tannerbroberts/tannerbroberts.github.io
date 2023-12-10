import React from "react";
import { useAppStateContext } from "./AppContext";
import { CALENDAR_VIEWS } from "./api/constants";
import { css } from "@emotion/css";
import HeadsUp from "./calendarViews/HeadsUp";

const scheduleViewCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

export default function ScheduleView() {
  const { selectedView } = useAppStateContext();

  return (
    <div className={scheduleViewCss}>
      {selectedView === CALENDAR_VIEWS.HEADS_UP && <HeadsUp />}
      {selectedView === CALENDAR_VIEWS.DAY && (
        <div className={scheduleViewCss}>Day View not built yet</div>
      )}
      {selectedView === CALENDAR_VIEWS.WEEK && (
        <div className={scheduleViewCss}>Week View not built yet</div>
      )}
      {selectedView === CALENDAR_VIEWS.MONTH && (
        <div className={scheduleViewCss}>Month View not built yet</div>
      )}
    </div>
  );
}
