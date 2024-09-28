import React, { createContext } from 'react';

const AddItemFloatingActionButtonContext = createContext();
export default function AddItemFloatingActionButtonProvider({ children, state, dispatch, extras }) {
  return (
    <AddItemFloatingActionButtonContext.Provider value={{ AddItemFloatingActionButtonState: state, AddItemFloatingActionButtonDispatch: dispatch }}>
      {children}
    </AddItemFloatingActionButtonContext.Provider>
  );
}

export function useAddItemFloatingActionButtonContext() {
  const context = React.useContext(AddItemFloatingActionButtonContext);
  if (!context) {
    throw new Error('useAddItemFloatingActionButton must be used within a AddItemFloatingActionButtonProvider');
  }
  return context;
}
