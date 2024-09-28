import React, { createContext } from 'react';

const ChangelogContext = createContext();
export default function ChangelogProvider({ children, state, dispatch, extras }) {
  return (
    <ChangelogContext.Provider value={{ ChangelogState: state, ChangelogDispatch: dispatch, extras }}>
      {children}
    </ChangelogContext.Provider>
  );
}

export function useChangelogContext() {
  const context = React.useContext(ChangelogContext);
  if (!context) {
    throw new Error('useChangelog must be used within a ChangelogProvider');
  }
  return context;
}
