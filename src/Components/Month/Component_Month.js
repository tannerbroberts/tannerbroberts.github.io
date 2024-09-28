import React from 'react';
import MonthProvider from './Provider_Month';
import MonthReducer, { MonthInitialState } from './Reducer_Month';

export default function Month() {
  const [state, dispatch] = React.useReducer(MonthReducer, MonthInitialState);

  return (
  <MonthProvider {...{ state, dispatch }}>
    <h1>Month</h1>
  </MonthProvider>
  );
}
