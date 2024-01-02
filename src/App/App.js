import React, { createContext, useContext } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { css } from "@emotion/css";
import CalendarView, {
  CalendarViewProvider,
} from "./CalendarView/CalendarView";
import { useLocalStorage } from "@uidotdev/usehooks";
import AddItemFloatingActionButton from "./AddItemFloatingActionButton";
import LeftDrawer, { LeftDrawerProvider } from "./LeftDrawer";
import BottomDrawer, { BottomDrawerProvider } from "./BottomDrawer";
import Header from "./Header";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Makes the app fill the entire screen
const fullScreenCss = css`
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: yellow;
`;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [library, setLibrary] = useLocalStorage("library", []);
  return (
    <AppContext.Provider value={{ library, setLibrary }}>
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppProvider>
        <CalendarViewProvider>
          <LeftDrawerProvider>
            <BottomDrawerProvider>
              <div className={fullScreenCss}>
                <Header />
                <CalendarView />
                <LeftDrawer />
                <BottomDrawer />
                <AddItemFloatingActionButton />
              </div>
            </BottomDrawerProvider>
          </LeftDrawerProvider>
        </CalendarViewProvider>
      </AppProvider>
    </LocalizationProvider>
  );
}

/** @returns {{ library: [string], setLibrary: LocalStorageSetter }} */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
