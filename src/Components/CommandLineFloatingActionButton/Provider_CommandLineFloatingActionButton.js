import React, { createContext } from 'react';

const CommandLineFloatingActionButtonContext = createContext();
export default function CommandLineFloatingActionButtonProvider({ children, state, dispatch, extras }) {
  return (
    <CommandLineFloatingActionButtonContext.Provider value={{ CommandLineFloatingActionButtonState: state, CommandLineFloatingActionButtonDispatch: dispatch }}>
      {children}
    </CommandLineFloatingActionButtonContext.Provider>
  );
}

export function useCommandLineFloatingActionButtonContext() {
  const context = React.useContext(CommandLineFloatingActionButtonContext);
  if (!context) {
    throw new Error('useCommandLineFloatingActionButton must be used within a CommandLineFloatingActionButtonProvider');
  }
  return context;
}
