import React, { createContext } from 'react';

const MonthContext = createContext();
export default function MonthProvider({ children, state, dispatch, extras }) {
  return (
    <MonthContext.Provider value={{ MonthState: state, MonthDispatch: dispatch, extras }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonthContext() {
  const context = React.useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
