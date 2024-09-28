import React, { createContext } from 'react';

const HeaderContext = createContext();
export default function HeaderProvider({ children, state, dispatch, extras }) {
  return (
    <HeaderContext.Provider value={{ HeaderState: state, HeaderDispatch: dispatch }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const context = React.useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
