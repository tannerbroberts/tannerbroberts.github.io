import React from "react";
import { CALENDAR_VIEWS } from "../../utils/constants";
import { css } from "@emotion/css";
import Headsup from "./Headsup";
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";
import { useLocalStorage } from "@uidotdev/usehooks";
import Changelog from "./Changelog";

const calendarViewCss = css`
  position: relative;
  top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

const CalendarViewContext = React.createContext();

/** @returns {{ selectedCalendarView: string, setSelectedCalendarView: Function }} */
const useCalendarViewContext = () => {
  const context = React.useContext(CalendarViewContext);
  if (!context) {
    throw new Error(
      "useCalendarViewContext must be used within a CalendarViewProvider"
    );
  }
  return context;
};

const CalendarViewProvider = ({ children }) => {
  const [selectedCalendarView, setSelectedCalendarView] = useLocalStorage(
    "selectedCalendarView",
    CALENDAR_VIEWS.HEADS_UP
  );

  let selectedCalendarViewString = "Missing Context Value";
  switch (selectedCalendarView) {
    case 1:
      selectedCalendarViewString = "Headsup";
      break;
    case 2:
      selectedCalendarViewString = "Day";
      break;
    case 3:
      selectedCalendarViewString = "Week";
      break;
    case 4:
      selectedCalendarViewString = "Month";
      break;
    case 5:
      selectedCalendarViewString = "Changelog";
      break;
    default:
  }

  return (
    <CalendarViewContext.Provider
      value={{
        selectedCalendarView,
        setSelectedCalendarView,
        selectedCalendarViewString
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
      {selectedCalendarView === CALENDAR_VIEWS.CHANGELOG && <Changelog />}
    </div>
  );
};

export {
  CalendarView as default,
  CalendarViewProvider,
  useCalendarViewContext,
};
