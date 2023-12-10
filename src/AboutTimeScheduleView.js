import React from "react";
import { useAppStateContext } from "./AppContext";
import { CALENDAR_VIEWS } from "./api/constants";
import { css } from "@emotion/css";

const aboutTimeScheduleViewCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

export default function AboutTimeScheduleView() {
  const { selectedView } = useAppStateContext();

  let viewString = "";

  switch (selectedView) {
    case CALENDAR_VIEWS.HEADS_UP:
      viewString = "This is the heads up view.";
      break;
    case CALENDAR_VIEWS.DAY:
      viewString = "This is the day view.";
      break;
    case CALENDAR_VIEWS.WEEK:
      viewString = "This is the week view.";
      break;
    case CALENDAR_VIEWS.MONTH:
      viewString = "This is the month view.";
      break;
    default:
      viewString = "Invalid view.";
      break;
  }

  return <div className={aboutTimeScheduleViewCss}>{viewString}</div>;
}
