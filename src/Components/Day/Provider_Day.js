import React, { createContext } from 'react';

const DayContext = createContext();
export default function DayProvider({ children, state, dispatch, extras }) {
  return (
    <DayContext.Provider value={{ DayState: state, DayDispatch: dispatch, extras }}>
      {children}
    </DayContext.Provider>
  );
}

export function useDayContext() {
  const context = React.useContext(DayContext);
  if (!context) {
    throw new Error('useDay must be used within a DayProvider');
  }
  return context;
}
