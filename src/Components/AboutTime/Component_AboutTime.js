import React, { useMemo } from 'react';
import AboutTimeProvider from './Provider_AboutTime';
import AboutTimeReducer, { AboutTimeInitialState } from './Reducer_AboutTime';
import { ErrorBoundary } from 'react-error-boundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { css } from '@emotion/css';
import { useLocalStorage } from "@uidotdev/usehooks";
import { v4 as uuid } from 'uuid';

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
  const [items, setItems] = useLocalStorage("items", []);

  const createItem = React.useCallback((item) => {
    if (!item.name) throw new Error("Attempted to set item in items without a name property.");
    if (!item.lengthMillis) throw new Error("Attempted to set item in items without a lengthMillis property.");

    setItems((prevLibrary) => {
      if (prevLibrary?.length) return [...prevLibrary, item];
      return [item];
    });
  }, [setItems]);

  const deleteItem = React.useCallback((name) => {
    setItems((prevLibrary) => {
      if (!prevLibrary.find((item) => item.name === name)) throw new Error("Attempted to delete an item that doesn't exist.");
      return prevLibrary.filter((item) => item.name !== name);
    });
  }, [setItems]);

  const getItems = React.useCallback(({ names, lengthRange }) => {
    if (!Array.isArray(names) && names !== undefined) throw new Error("Attempted to get items with a non-array names parameter.");
    if (lengthRange && (lengthRange.min === undefined || lengthRange.max === undefined)) {
      throw new Error("Attempted to get items with a lengthRange parameter that doesn't have min and max properties.");
    }
      const byName = names ? ({ name }) => names.includes(name) : () => true;
    const byLengthRange = lengthRange ? ({ lengthMillis }) => lengthRange.min <= lengthMillis && lengthMillis <= lengthRange.max : () => true;
    return [
      ...items.filter(byName).filter(byLengthRange)
    ]
  }, [items]);

  return { createItem, deleteItem, getItems };
}

export function useSchedule(nameContext = undefined) {
  const scheduleKey = nameContext ? `itemSchedule:${nameContext}` : "rootSchedule";
  const [schedule, setSchedule] = useLocalStorage(scheduleKey, []);
  const [recurrences, setRecurrences] = useLocalStorage("recurrences", []);

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

  const addRecurrence = React.useCallback(({ startPositionMillis, endPositionMillis, interval, itemName, count }) => {
    let newRecurrenceId = uuid();
    setRecurrences((prevRecurrences) => {

      if (startPositionMillis === undefined) throw new Error("Attempted to add a recurrence without a startPositionMillis.");
      if (!interval) throw new Error("Attempted to add a recurrence without an interval.");
      if (!count && !endPositionMillis) throw new Error("Attempted to add a recurrence without a count or endPositionMillis.");
      if (!itemName) throw new Error("Attempted to add a recurrence without an itemName.");
      const newRecurrence = { id: newRecurrenceId, startPositionMillis, endPositionMillis, interval, count, itemName };
      return [...prevRecurrences, newRecurrence];
    });

    return newRecurrenceId;
  }, [setRecurrences]);

  const getRecurrences = React.useCallback(() => {
    return [...recurrences];
  }, [recurrences]);

  const dropRecurrenceById = React.useCallback((recurrenceId) => {
    setRecurrences((prevRecurrences) => {
      if (!Boolean(recurrences.find(recurrence => recurrence.id === recurrenceId))) throw new Error("Attempted to drop a recurrence that doesn't exist.");
      return prevRecurrences.filter(recurrence => recurrence.id !== recurrenceId);
    });
  }, [recurrences, setRecurrences]);

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
      const items = [];
      recurrences
        .filter((recurrence) => {
          return recurrence.startPositionMillis >= start && recurrence.startPositionMillis <= end;
        })
        .forEach((recurrence) => {
          let nextOccurrence = recurrence.startPositionMillis;
          let count = recurrence.count !== undefined ? recurrence.count : Infinity;
          const endPositionMillis = recurrence.endPositionMillis !== undefined ? recurrence.endPositionMillis : end;
          while (nextOccurrence <= end && count !== 0 && endPositionMillis >= nextOccurrence) {
            const { itemName, id } = recurrence;
            items.push({ itemName, id, positionMillis: nextOccurrence });
            nextOccurrence += recurrence.interval;
            count--;
          }
        });
      return items;
    }

    const allItems = [...getScheduledItems(), ...getRecurringItems()];
    return allItems.sort((a, b) => a.positionMillis - b.positionMillis);
  }, [schedule, recurrences]);

  return { addItem, dropItem, addRecurrence, getRecurrences, dropRecurrenceById, getItemsInWindow }
}
