import React from 'react';
import DayProvider from './Provider_Day';
import DayReducer, { DayInitialState } from './Reducer_Day';

export default function Day() {
  const [state, dispatch] = React.useReducer(DayReducer, DayInitialState);

  return (
  <DayProvider {...{ state, dispatch }}>
    <h1>Day</h1>
  </DayProvider>
  );
}
