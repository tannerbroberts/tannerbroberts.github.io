import React, { createContext } from 'react';

const ViewHandlerContext = createContext();
export default function ViewHandlerProvider({ children, state, dispatch, extras }) {
  return (
    <ViewHandlerContext.Provider value={{ ViewHandlerState: state, ViewHandlerDispatch: dispatch, extras }}>
      {children}
    </ViewHandlerContext.Provider>
  );
}

export function useViewHandlerContext() {
  const context = React.useContext(ViewHandlerContext);
  if (!context) {
    throw new Error('useViewHandler must be used within a ViewHandlerProvider');
  }
  return context;
}
