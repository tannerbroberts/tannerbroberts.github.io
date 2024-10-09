import React, { useMemo } from 'react';
import AboutTimeProvider from './Provider_AboutTime';
import AboutTimeReducer, { AboutTimeInitialState } from './Reducer_AboutTime';
import { ErrorBoundary } from 'react-error-boundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { css } from '@emotion/css';
import { useLocalStorage } from "@uidotdev/usehooks";

import Header from '../Header';
import ViewHandler from '../ViewHandler';
import SideDrawer from '../SideDrawer';
import CommandLineFloatingActionButton from '../CommandLineFloatingActionButton';
import BottomDrawer from '../BottomDrawer';
import CommandLine from '../CommandLine/Component_CommandLine';

// Makes the app fill the entire screen
const fullScreenCss = css`
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: yellow;
`;

export default function AboutTime() {
  const [state, dispatch] = React.useReducer(AboutTimeReducer, AboutTimeInitialState);
  const library = useLibrary();
  const schedule = useSchedule();
  const extras = useMemo(() => ({ library, schedule }), [library, schedule]);

  return (
    <AboutTimeProvider {...{ state, dispatch, extras }}>
      <ErrorBoundary>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className={fullScreenCss}>
            <Header />
            <ViewHandler />
            <SideDrawer />
            <BottomDrawer />
            <CommandLine />
            <CommandLineFloatingActionButton />
          </div>
        </LocalizationProvider>
      </ErrorBoundary>  </AboutTimeProvider>
  );
}

export function useLibrary() {
  const [items, setItems] = useLocalStorage("items", {});

  const setItem = React.useCallback((item) => {
    if (!item.name) throw new Error("Attempted to set item in items without a name.");
    if (!item.length) throw new Error("Attempted to set item in items without a length.");

    setItems((prevLibrary) => ({
      ...prevLibrary,
      [item.name]: item,
    }));
  }, [setItems]);

  const deleteItem = React.useCallback((name) => {
    setItems((prevLibrary) => {
      const newLibrary = { ...prevLibrary };
      if (!newLibrary[name]) throw new Error(`Attempted to delete item ${name}, but the item does not exist in the items.`);
      delete newLibrary[name];
      return newLibrary;
    });
  }, [setItems]);

  const getItems = React.useCallback((filters) => {
    const { byName, byLength, byTag } = filters;
    return Object.entries(items).filter(byName).filter(byLength).filter(byTag);
  }, [items]);

  return { setItem, deleteItem, getItems };
}

export function useSchedule() {
  const [schedule, setSchedule] = useLocalStorage("schedule", []);
  const [recurrences, setRecurrences] = useLocalStorage("recurrences", {});

  const addItem = React.useCallback(({ itemName, positionMillis }) => {
    setSchedule((prevSchedule) => {
      const newSchedule = prevSchedule?.length ? [...prevSchedule] : [];
      let insertionIndex = 0;
      while (newSchedule[insertionIndex] && newSchedule[insertionIndex].positionMillis < positionMillis) {
        insertionIndex++;
      }
      newSchedule.splice(insertionIndex, 0, { itemName, positionMillis });
      return newSchedule;
    });
  }, [setSchedule]);

  const dropItem = React.useCallback(({ itemName, positionMillis }) => {
    setSchedule((prevSchedule) => {
      const newSchedule = prevSchedule.filter((item) => item.positionMillis !== positionMillis || item.itemName !== itemName);
      return newSchedule;
    });
  }, [setSchedule]);

  const addRecurrence = React.useCallback((recurrence) => {
    setRecurrences((prevRecurrences) => {
      const { startPositionMillis, endPositionMillis, interval, itemName, repeatCount } = recurrence;
      const newRecurrenceId = Math.floor(Math.random() * 1_000_000_000_000_000);
      const newRecurrences = { ...prevRecurrences, [itemName]: { startPositionMillis, endPositionMillis, interval, repeatCount, id: newRecurrenceId } };
      return newRecurrences;
    });
  }, [setRecurrences]);

  const dropRecurrence = React.useCallback(({ recurrenceId }) => {
    setRecurrences((prevRecurrences) => {
      delete prevRecurrences[recurrenceId];
      return prevRecurrences;
    });
  }, [setRecurrences]);

  const getItemsInWindow = React.useCallback(({ start, end }) => {
    // build up a list of scheduled items as well as a virtual list of recurring items

    const getScheduledItems = () => {
      const items = [];
      schedule.forEach((item) => {
        if (item.positionMillis >= start && item.positionMillis <= end) {
          items.push(item);
        }
      });
      return items;
    }

    const getRecurringItems = () => {
      const recurringItems = [];
      const items = [];
      Object.values(recurrences).forEach((recurrence) => {
        if (recurrence.startPositionMillis >= start && recurrence.startPositionMillis <= end) {
          recurringItems.push(recurrence);
        }
      });
      recurringItems.forEach((recurrence) => {
        let nextOccurrence = recurrence.startPositionMillis;
        let repeatCount = recurrence.repeatCount !== undefined ? recurrence.repeatCount : Infinity;
        const endPositionMillis = recurrence.endPositionMillis !== undefined ? recurrence.endPositionMillis : end;
        while (nextOccurrence <= end && repeatCount > 0 && endPositionMillis >= nextOccurrence) {
          const { itemName, id } = recurrence;
          items.push({ itemName, id, positionMillis: nextOccurrence });
          nextOccurrence += recurrence.interval;
          repeatCount--;
        }
      });
      return items;
    }

    const allItems = [...getScheduledItems(), ...getRecurringItems()];
    return allItems.sort((a, b) => a.positionMillis - b.positionMillis);
  }, [schedule, recurrences]);

  return { addItem, dropItem, addRecurrence, dropRecurrence, getItemsInWindow }
}
