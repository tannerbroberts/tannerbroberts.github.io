import React, { createContext } from 'react';

const ItemLibraryContext = createContext();
export default function ItemLibraryProvider({ children, state, dispatch, extras }) {
  return (
    <ItemLibraryContext.Provider value={{ ItemLibraryState: state, ItemLibraryDispatch: dispatch, extras }}>
      {children}
    </ItemLibraryContext.Provider>
  );
}

export function useItemLibraryContext() {
  const context = React.useContext(ItemLibraryContext);
  if (!context) {
    throw new Error('useItemLibrary must be used within a ItemLibraryProvider');
  }
  return context;
}
