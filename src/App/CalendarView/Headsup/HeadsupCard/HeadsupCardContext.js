import React, { createContext, useContext } from "react";

// Create the context
const HeadsupCardContext = createContext();

// Create a provider component
export function HeadsupCardProvider({ children, value }) {
  // Add your provider logic here

  return (
    <HeadsupCardContext.Provider value={value}>
      {children}
    </HeadsupCardContext.Provider>
  );
}

export function useHeadsupCardContext() {
  const context = useContext(HeadsupCardContext);
  if (context === undefined) {
    throw new Error(
      "useHeadsupCardContext must be used within a HeadsupCardProvider"
    );
  }
  return context;
}
