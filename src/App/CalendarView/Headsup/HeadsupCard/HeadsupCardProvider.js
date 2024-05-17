import React from "react";

export const HeadsupCardContext = React.createContext();

export function HeadsupCardProvider({ children, value }) {
  return (
    <HeadsupCardContext.Provider value={value}>
      {children}
    </HeadsupCardContext.Provider>
  );
}

/** @returns {{ value: Item }} */
export const useHeadsupCardContext = () => {
  const context = React.useContext(HeadsupCardContext);
  if (context === undefined) {
    throw new Error(
      "useHeadsupCardContext must be used within a HeadsupCardProvider"
    );
  }
  return context;
};