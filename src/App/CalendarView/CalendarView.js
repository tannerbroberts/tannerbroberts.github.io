import React, { createContext, useContext, useState } from "react";
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

const CalendarViewContext = createContext();

const useCalendarViewContext = () => {
  const context = useContext(CalendarViewContext);
  if (!context) {
    throw new Error(
      "useCalendarViewContext must be used within a CalendarViewProvider"
    );
  }
  return context;
};

const CalendarViewProvider = ({ children }) => {
  const [selectedCalendarView, setSelectedCalendarView] = useState(
    CALENDAR_VIEWS.HEADS_UP
  );
  return (
    <CalendarViewContext.Provider
      value={{
        selectedCalendarView,
        setSelectedCalendarView,
      }}
    >
      {children}
    </CalendarViewContext.Provider>
  );
};

const CalendarView = () => {
  const { selectedCalendarView } = useCalendarViewContext();

  return (
    <div className={calendarViewCss}>
      {selectedCalendarView === CALENDAR_VIEWS.HEADS_UP && <Headsup />}
      {selectedCalendarView === CALENDAR_VIEWS.DAY && <Day />}
      {selectedCalendarView === CALENDAR_VIEWS.WEEK && <Week />}
      {selectedCalendarView === CALENDAR_VIEWS.MONTH && <Month />}
    </div>
  );
};

export {
  CalendarView as default,
  CalendarViewProvider,
  useCalendarViewContext,
};
