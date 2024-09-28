import React, { createContext } from 'react';

const BottomDrawerContext = createContext();
export default function BottomDrawerProvider({ children, state, dispatch, extras }) {
  return (
    <BottomDrawerContext.Provider value={{ BottomDrawerState: state, BottomDrawerDispatch: dispatch, extras }}>
      {children}
    </BottomDrawerContext.Provider>
  );
}

export function useBottomDrawerContext() {
  const context = React.useContext(BottomDrawerContext);
  if (!context) {
    throw new Error('useBottomDrawer must be used within a BottomDrawerProvider');
  }
  return context;
}
