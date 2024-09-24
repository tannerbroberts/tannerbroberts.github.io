import React from "react";
import { css } from "@emotion/css";
import UpNext from "./UpNext";
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";
import Changelog from "./Changelog";
import { useAppContext } from "../App";

const viewHandlerCss = css`
  position: relative;
  top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

const ViewHandlerContext = React.createContext();
const ViewHandlerProvider = ({ children }) => {
  return (
    <ViewHandlerContext.Provider value={'Tanner says theres no context available'}>
      {children}
    </ViewHandlerContext.Provider>
  );
};

export default function ViewHandler() {
  const { appState: { selectedView } } = useAppContext();

  return (
    <ViewHandlerProvider>
      <div className={viewHandlerCss}>
        {selectedView === CALENDAR_VIEWS.UP_NEXT && <UpNext />}
        {selectedView === CALENDAR_VIEWS.DAY && <Day />}
        {selectedView === CALENDAR_VIEWS.WEEK && <Week />}
        {selectedView === CALENDAR_VIEWS.MONTH && <Month />}
        {selectedView === CALENDAR_VIEWS.CHANGELOG && <Changelog />}
      </div>
    </ViewHandlerProvider>
  );
};

export const useViewHandlerContext = () => {
  const context = React.useContext(ViewHandlerContext);
  if (!context) {
    throw new Error(
      "useViewHandlerContext must be used within a ViewHandlerProvider"
    );
  }
  return context;
};

export const CALENDAR_VIEWS = {
  UP_NEXT: "UP_NEXT",
  DAY: "DAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
  CHANGELOG: "CHANGELOG",
};
