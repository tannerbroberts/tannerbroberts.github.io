import React, { createContext } from 'react';

const WeekContext = createContext();
export default function WeekProvider({ children, state, dispatch, extras }) {
  return (
    <WeekContext.Provider value={{ WeekState: state, WeekDispatch: dispatch, extras }}>
      {children}
    </WeekContext.Provider>
  );
}

export function useWeekContext() {
  const context = React.useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within a WeekProvider');
  }
  return context;
}
