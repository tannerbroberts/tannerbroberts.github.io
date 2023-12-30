import React, { createContext, useCallback } from "react";
import { Drawer, List, ListItemButton, Divider } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import NewItemTimePicker, {
  NewItemTimePickerProvider,
} from "./NewItemTimePicker";

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
      <NewItemTimePickerProvider>
        <List>
          <NewItemTimePicker />
          <Divider />
          <ListItemButton>Testing</ListItemButton>
          <ListItemButton>Testing</ListItemButton>
          <ListItemButton>Testing</ListItemButton>
        </List>
      </NewItemTimePickerProvider>
    </Drawer>
  );
};

export { BottomDrawer, BottomDrawerProvider, useBottomDrawerContext };
