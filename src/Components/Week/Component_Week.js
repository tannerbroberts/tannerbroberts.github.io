import React from 'react';
import WeekProvider from './Provider_Week';
import WeekReducer, { WeekInitialState } from './Reducer_Week';

export default function Week() {
  const [state, dispatch] = React.useReducer(WeekReducer, WeekInitialState);

  return (
  <WeekProvider {...{ state, dispatch }}>
    <h1>Week</h1>
  </WeekProvider>
  );
}
