import React from "react";
import { useAppStateContext } from "../AppContext";
import { CALENDAR_VIEWS } from "../api/constants";
import { css } from "@emotion/css";
import HeadsUp from "./HeadsUp";
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";

const viewHandlerCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

export default function ViewHandler() {
  const { selectedView } = useAppStateContext();

  return (
    <div className={viewHandlerCss}>
      {selectedView === CALENDAR_VIEWS.HEADS_UP && <HeadsUp />}
      {selectedView === CALENDAR_VIEWS.DAY && <Day />}
      {selectedView === CALENDAR_VIEWS.WEEK && <Week />}
      {selectedView === CALENDAR_VIEWS.MONTH && <Month />}
    </div>
  );
}
