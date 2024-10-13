import React from 'react';
import UpNextProvider, { useUpNextContext } from './Provider_UpNext';
import UpNextReducer, { UpNextInitialState } from './Reducer_UpNext';
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
  const { UpNextState: { windowSize, intervalSize } } = useUpNextContext();
  const millisecondsPerPixel = 1000;

  const totalBlocks = windowSize / intervalSize;




  // know how much time is being displayed
  // know how large the time chunks should be
  // calculate how many time chunks should be displayed based on those two things (height doesn't matter, the parent is a fixed height, and the child is variable height depending on the time chunk size)
  // later, virtualizing the ledger lines will be important, but for now, just render them all though they are not visible

  return <>
    {Array.from({ length: Math.floor(totalBlocks) }).map((_, index) => {
      const offset = index * intervalSize / millisecondsPerPixel
      const height = intervalSize / millisecondsPerPixel
      return <div className={ledgerLineCss(offset, height)} key={index}>
        {index}
      </div>
    })}
  </>
}

function NowLine() {

}
