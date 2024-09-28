import React from 'react';
import UpNextProvider from './Provider_UpNext';
import UpNextReducer, { UpNextInitialState } from './Reducer_UpNext';

export default function UpNext() {
  const [state, dispatch] = React.useReducer(UpNextReducer, UpNextInitialState);

  return (
  <UpNextProvider {...{ state, dispatch }}>
    <h1>UpNext</h1>
  </UpNextProvider>
  );
}
