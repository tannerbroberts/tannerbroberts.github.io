import React from 'react';
import BottomDrawerProvider from './Provider_BottomDrawer';
import BottomDrawerReducer, { BottomDrawerInitialState } from './Reducer_BottomDrawer';
import { css } from '@emotion/css';

const BottomDrawerCss = css`
  background-color: yellow;
`;

export default function BottomDrawer() {
  const [state, dispatch] = React.useReducer(BottomDrawerReducer, BottomDrawerInitialState);

  return (
  <BottomDrawerProvider {...{ state, dispatch }}>
    <div> className={BottomDrawerCss}>
      <h1>BottomDrawer</h1>
    </div>
  </BottomDrawerProvider>
  );
}
