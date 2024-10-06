import React, { createContext } from 'react';

const CommandLineContext = createContext();
export default function CommandLineProvider({ children, state, dispatch, extras }) {
  return (
    <CommandLineContext.Provider value={{ CommandLineState: state, CommandLineDispatch: dispatch, extras }}>
      {children}
    </CommandLineContext.Provider>
  );
}

export function useCommandLineContext() {
  const context = React.useContext(CommandLineContext);
  if (!context) {
    throw new Error('useCommandLine must be used within a CommandLineProvider');
  }
  return context;
}
