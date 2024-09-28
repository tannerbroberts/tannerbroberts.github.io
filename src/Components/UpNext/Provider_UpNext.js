import React, { createContext } from 'react';

const UpNextContext = createContext();
export default function UpNextProvider({ children, state, dispatch, extras }) {
  return (
    <UpNextContext.Provider value={{ UpNextState: state, UpNextDispatch: dispatch, extras }}>
      {children}
    </UpNextContext.Provider>
  );
}

export function useUpNextContext() {
  const context = React.useContext(UpNextContext);
  if (!context) {
    throw new Error('useUpNext must be used within a UpNextProvider');
  }
  return context;
}
