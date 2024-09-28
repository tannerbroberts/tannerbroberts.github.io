import React, { createContext } from 'react';

const AboutTimeContext = createContext();
export default function AboutTimeProvider({ children, state, dispatch, extras }) {
  return (
    <AboutTimeContext.Provider value={{ AboutTimeState: state, AboutTimeDispatch: dispatch, extras }}>
      {children}
    </AboutTimeContext.Provider>
  );
}

export function useAboutTimeContext() {
  const context = React.useContext(AboutTimeContext);
  if (!context) {
    throw new Error('useAboutTime must be used within a AboutTimeProvider');
  }
  return context;
}
