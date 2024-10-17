import React from 'react';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import UpNextProvider, { useUpNextContext } from './Provider_UpNext';
import UpNextReducer, { UpNextInitialState } from './Reducer_UpNext';
import { css } from '@emotion/css';

const scrollableParentCss = css`
  overflow-y: auto;
  height: 100%;
  width: 100%;
  position: relative;
`

const ledgerLineCss = (offset, height) => css`
  position: absolute;
  // smoothly scroll the ledger lines by translating the top value
  transition: top 1s;
  top: ${offset}px;
  left: 10vw;
  width: 89vw;
  height: ${height}px;
  border-top: 1px solid black;
`

const childComponentCss = ({ offset, height }) => css`
  position: absolute;
  top: ${offset}px;
  transition: top 1s;
  left: 0;
  width: 100%;
  height: ${height}px;
  background-color: rgba(0, 0, 0, 0.5);
`

// Load enough components to fill three windows, that way scrolling will be smooth
// Toggleable "follow now" feature that automatically scrolls when the window is too far from center
// Add a "now" line that is always visible

// When scrolling too far to one side, load more elements?
// When you want to see a different time, 

export default function UpNext() {
  const [state, dispatch] = React.useReducer(UpNextReducer, UpNextInitialState);
  const updateHeight = React.useCallback(height => dispatch({ type: 'SET_OWN_HEIGHT', value: height }), [dispatch]);
  const scrollableParentRef = React.useRef(null);
  useWatchHeightOfComponentRef({ ref: scrollableParentRef, updateHeight });

  return (
    <UpNextProvider {...{ state, dispatch }}>
      <div ref={scrollableParentRef} className={scrollableParentCss}>
        <LedgerLines />
        <ChildItems />
      </div>
    </UpNextProvider>
  );
}

/**
  * @param {function} updateHeight - A function that will be called with the height of the watched component
  * @returns {React.RefObject} - A ref to the DOM component that will have its height watched
 */
export function useWatchHeightOfComponentRef({ ref, updateHeight }) {
  React.useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        updateHeight(ref.current.clientHeight);
      }
    };
    if (!ref.current.clientHeight) return;
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref, updateHeight]);

  if (!ref) throw new Error('useWatchHeightOfComponentRef must be called with a ref');
  if (!updateHeight) throw new Error('useWatchHeightOfComponentRef must be called with an updateHeight function');
  return ref;
}

function useRealtimeOffset({ millisecondsPerPixel, intervalSize, updateFrequency = 1000 }) {
  const [now, setNow] = React.useState(Date.now());
  const [remainder, setRemainder] = React.useState(now % intervalSize);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setRemainder(now % intervalSize);
    }, updateFrequency);
    return () => {
      clearInterval(interval);
    }
  }, [now, intervalSize, updateFrequency]);

  return remainder / millisecondsPerPixel;
}

function LedgerLines() {
  const { UpNextState: { windowSize, intervalSize, millisecondsPerPixel } } = useUpNextContext();

  const totalLineBlocks = Math.floor(windowSize / intervalSize);
  const remainderOffset = useRealtimeOffset({ millisecondsPerPixel, intervalSize });

  return <>
    {Array.from({ length: totalLineBlocks }).map((_, index) => {
      const offset = index * intervalSize / millisecondsPerPixel - remainderOffset;
      const height = intervalSize / millisecondsPerPixel;

      // Get the offset in hours and minutes for each time chunk
      const date = new Date(Date.now() + offset * millisecondsPerPixel);
      const hour = date.getHours() % 12;
      const minute = date.getMinutes().toString().padStart(2, '0');

      return <div className={ledgerLineCss(offset, height)} key={`${index}${hour}${minute}`}>
        {hour}:{minute}
      </div>
    })}
  </>
}

function ChildItems() {
  const { extras: { library } } = useAboutTimeContext();
  const { UpNextState: { windowSize, millisecondsPerPixel } } = useUpNextContext();
  const windowFrame = { start: Date.now(), end: Date.now() + windowSize };
  const children = useRecurringChildRequest({ windowFrame });

  return children.map((child) => {
    // Get the time from now until the child starts and divide by the milliseconds per pixel
    const offset = (child.positionMillis - Date.now()) / millisecondsPerPixel;
    const item = library.getItems({ name: child.name })[0];
    const height = item.lengthMillis / millisecondsPerPixel;

    return <div className={childComponentCss({ offset, height })} key={child.id}>
      {child.name}
    </div>
  });
}

function useRecurringChildRequest({ windowFrame, updateFrequency = 1000 }) {
  const [children, setChildren] = React.useState([]);
  const { extras: { schedule } } = useAboutTimeContext();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChildren(schedule.getItemsInWindow({ ...windowFrame }));
    }, updateFrequency);
    return () => {
      clearInterval(interval);
    }
  }, [schedule, updateFrequency, windowFrame]);

  return children;
}
