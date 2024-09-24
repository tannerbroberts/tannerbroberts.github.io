import React from "react";
import { Dialog, Drawer, useMediaQuery } from "@mui/material";
import NewItemCreation from "./NewItemCreation/NewItemCreation";

const BottomDrawerContext = React.createContext();
export function BottomDrawerProvider({ children }) {

  return (
    <BottomDrawerContext.Provider value="No value" >
      {children}
    </BottomDrawerContext.Provider>
  );
};

export default function BottomDrawer() {
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

const useBottomDrawerContext = () => {
  const context = React.useContext(BottomDrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};
