import React from 'react';
import UpNextProvider, { useUpNextContext } from './Provider_UpNext';
import UpNextReducer, { UpNextInitialState } from './Reducer_UpNext';
import { useAboutTimeContext } from '../AboutTime';
import { css } from '@emotion/css';

const scrollableParentCss = css`
  overflow-y: auto;
  height: 100%;
  width: 100%;
  position: relative;
`

const childComponentCss = ({ offset, height }) => css`
  position: absolute;
  top: ${offset}px;
  left: 0;
  width: 100%;
  height: ${height}px;
  background-color: rgba(0, 0, 0, 0.5);
`

const ledgerLineCss = (offset, height) => css`
  position: absolute;
  top: ${offset}px;
  left: 10vw;
  width: 100%;
  height: ${height}px;
  border-top: 1px solid black;
`

export default function UpNext() {
  const [state, dispatch] = React.useReducer(UpNextReducer, UpNextInitialState);
  const heightWatchingRef = useHeightWatchingRef({ dispatch });

  return (
    <UpNextProvider {...{ state, dispatch }}>
      <div ref={heightWatchingRef} className={scrollableParentCss}>
        <LedgerLines />
        {/* <ChildItems /> */}
      </div>
    </UpNextProvider>
  );
}

export function useHeightWatchingRef({ dispatch }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        console.log('setting height:', ref.current.clientHeight);
        dispatch({ type: 'SET_OWN_HEIGHT', value: ref.current.clientHeight });
      }
    };
    if (!ref.current.clientHeight) return;
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, ref]);
  return ref;
}

function LedgerLines() {
  const { UpNextState: { ownHeight, ledgerInterval, ledgerIntervalPixelHeight } } = useUpNextContext();

  return <>
    
  </>
}

// function ChildItems() {
//   const { extras: { schedule, library } } = useAboutTimeContext();
//   const { ownHeight: parentHeight } = useUpNextContext();
//   const timeWindowSize = 3_600_000;
//   const timeWindow = { start: Date.now() - timeWindowSize / 2, end: Date.now() + timeWindowSize / 2 };
//   const millisPerPixel = Math.floor(timeWindowSize / parentHeight);

//   return <>

//     {schedule.getItemsInWindow({ ...timeWindow }).map(scheduledItem => {
//       const item = library.getItems({ names: [scheduledItem.itemName] })[0];
//       const offset = (scheduledItem.positionMillis - timeWindow.start) / millisPerPixel;
//       const height = item.lengthMillis / millisPerPixel;


//       return (
//         <div className={childComponentCss({ offset, height })} key={`${item.name}${scheduledItem.positionMillis}`}>
//         </div>
//       )
//     }
//     )}
//   </>
// }
