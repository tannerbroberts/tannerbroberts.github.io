import React, { createContext, useCallback } from "react";
import { Drawer, List, ListItemButton } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";

const BottomDrawerContext = createContext();

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
  const openBottomDrawer = useCallback(
    () => setBottomDrawerOpen(true),
    [setBottomDrawerOpen]
  );
  const closeBottomDrawer = useCallback(
    () => setBottomDrawerOpen(false),
    [setBottomDrawerOpen]
  );

  return (
    <BottomDrawerContext.Provider
      value={{ bottomDrawerIsOpen, openBottomDrawer, closeBottomDrawer }}
    >
      {children}
    </BottomDrawerContext.Provider>
  );
};

const BottomDrawer = () => {
  const { bottomDrawerIsOpen, closeBottomDrawer } = useBottomDrawerContext();

  return (
    <Drawer
      anchor="bottom"
      open={bottomDrawerIsOpen}
      onClose={closeBottomDrawer}
    >
      <List>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing</ListItemButton>
        <ListItemButton>Testing 123</ListItemButton>
      </List>
    </Drawer>
  );
};

export { BottomDrawer, BottomDrawerProvider, useBottomDrawerContext };
