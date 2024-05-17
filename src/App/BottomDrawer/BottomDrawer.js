import React from "react";
import { Dialog, Drawer, useMediaQuery } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import NewItemCreation from "./NewItemCreation/NewItemCreation";

const BottomDrawerContext = React.createContext();

/** @returns {{ bottomDrawerIsOpen: boolean, openBottomDrawer: Function, closeBottomDrawer: Function, toggleBottomDrawer: Function}} */
const useBottomDrawerContext = () => {
  const context = React.useContext(BottomDrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};

const BottomDrawerProvider = ({ children }) => {
  const [bottomDrawerIsOpen, setBottomDrawerOpen] = useLocalStorage(
    "bottomDrawerIsOpen",
    false
  );
  const openBottomDrawer = React.useCallback(
    () => setBottomDrawerOpen(true),
    [setBottomDrawerOpen]
  );
  const closeBottomDrawer = React.useCallback(
    () => setBottomDrawerOpen(false),
    [setBottomDrawerOpen]
  );
  const toggleBottomDrawer = React.useCallback(
    () => setBottomDrawerOpen(!bottomDrawerIsOpen),
    [bottomDrawerIsOpen, setBottomDrawerOpen]
  );

  return (
    <BottomDrawerContext.Provider
      value={{
        bottomDrawerIsOpen,
        openBottomDrawer,
        closeBottomDrawer,
        toggleBottomDrawer,
      }}
    >
      {children}
    </BottomDrawerContext.Provider>
  );
};

const BottomDrawer = () => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { bottomDrawerIsOpen, closeBottomDrawer } = useBottomDrawerContext();

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={bottomDrawerIsOpen}
        onClose={closeBottomDrawer}
      >
        <NewItemCreation />
      </Drawer>
    );
  }

  return (
    <Dialog maxWidth="lg" onClose={closeBottomDrawer} open={bottomDrawerIsOpen}>
      <NewItemCreation />
    </Dialog>
  );
};

export { BottomDrawer, BottomDrawerProvider, useBottomDrawerContext };
