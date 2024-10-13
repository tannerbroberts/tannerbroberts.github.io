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
  const updateHeight = React.useCallback(height => dispatch({ type: 'SET_OWN_HEIGHT', value: height }), [dispatch]);
  const scrollableParentRef = React.useRef(null);
  useWatchHeightOfComponentRef({ ref: scrollableParentRef, updateHeight });

  return (
    <UpNextProvider {...{ state, dispatch }}>
      <div ref={scrollableParentRef} className={scrollableParentCss}>
        <LedgerLines />
        <NowLine />
        {/* <ChildItems /> */}
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
        console.log('setting height:', ref.current.clientHeight);
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

function LedgerLines() {
  const { UpNextState: { ownHeight } } = useUpNextContext();
  console.log('context:', useUpNextContext());
  const ledgerSectionHeight = 30;
  const ledgerSectionMillis = 120_000; // 2 minutes for now


  console.log(`${ownHeight} / ${ledgerSectionHeight} = ${ownHeight / ledgerSectionHeight}`);
  return <>
    {Array.from({ length: Math.floor(ownHeight / ledgerSectionHeight) }).map((_, index) => {
      const offset = index * ledgerSectionHeight;
      return <div className={ledgerLineCss(offset, ledgerSectionHeight)} key={index}></div>
    })}
  </>
}

function NowLine() {
  
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
