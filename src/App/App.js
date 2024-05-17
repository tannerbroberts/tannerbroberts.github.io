import React from "react";
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
import { NewItemCreationProvider } from "./BottomDrawer/NewItemCreation/NewItemCreation";
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

export const AppContext = React.createContext();
export const AppProvider = ({ children }) => {
  const [library, setLibrary] = useLocalStorage("library", []);
  const addToLibrary = React.useCallback(
    (nameString) => {
      setLibrary((library) => [...library, nameString]);
    },
    [setLibrary]
  );
  const removeFromLibrary = React.useCallback(
    (stringToRemove) => {
      setLibrary((library) => {
        const index = library.indexOf(stringToRemove);
        if (index === -1) {
          return library;
        }
        const newLibrary = [...library];
        newLibrary.splice(index, 1);
        return newLibrary;
      });
    },
    [setLibrary]
  );
  const clearLibrary = React.useCallback(() => {
    setLibrary([]);
  }, [setLibrary]);

  return (
    <AppContext.Provider
      value={{
        library,
        addToLibrary,
        removeFromLibrary,
        clearLibrary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppProvider>
        <NewItemCreationProvider>
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
        </NewItemCreationProvider>
      </AppProvider>
    </LocalizationProvider>
  );
}

/** @returns {{ library: [string], addToLibrary: Function, removeFromLibrary: Function }} */
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
