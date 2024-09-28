import React, { createContext } from 'react';

const SideDrawerContext = createContext();
export default function SideDrawerProvider({ children, state, dispatch, extras }) {
  return (
    <SideDrawerContext.Provider value={{ SideDrawerState: state, SideDrawerDispatch: dispatch }}>
      {children}
    </SideDrawerContext.Provider>
  );
}

export function useSideDrawerContext() {
  const context = React.useContext(SideDrawerContext);
  if (!context) {
    throw new Error('useSideDrawer must be used within a SideDrawerProvider');
  }
  return context;
}
