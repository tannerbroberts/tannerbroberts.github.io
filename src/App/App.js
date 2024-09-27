import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { css } from "@emotion/css";
import ViewHandler from "./ViewHandler";
import useLibrary from "./useLibrary";
import AddItemFloatingActionButton from "./AddItemFloatingActionButton";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ErrorBoundary } from 'react-error-boundary';
import { CALENDAR_VIEWS } from "./ViewHandler/ViewHandler";
import { isValidItem, isValidView } from "../utils";
import Header from "./Header";
import SideDrawer from "./SideDrawer";
import Qwerty from '../Qwerty'

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

export const defaultAppState = {
  bottomDrawerOpen: false,
  sideDrawerOpen: false,
  selectedItem: null,
  selectedView: CALENDAR_VIEWS.UP_NEXT,
};

export const appReducer = (state, action) => {
  if (Array.isArray(action)) return action.reduce(appReducer, state);
  switch (action.type) {
    case "TOGGLE_BOTTOM_DRAWER":
      return { ...state, bottomDrawerOpen: !state.bottomDrawerOpen };
    case "TOGGLE_SIDE_DRAWER":
      return { ...state, sideDrawerOpen: !state.sideDrawerOpen };
    case "SET_SELECTED_ITEM":
      if (!isValidItem(action.value)) throw new Error("Invalid item");
      return { ...state, selectedItem: action.value };
    case "SET_SELECTED_VIEW":
      if (!isValidView(action.value)) throw new Error("Invalid view");
      return { ...state, selectedView: action.value };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const AppContext = React.createContext();
export const AppProvider = ({ children, value }) => {
  const library = useLibrary();

  return (
    <AppContext.Provider value={{ library, appState: value.appState, appDispatch: value.appDispatch }} >
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  const [appState, appDispatch] = React.useReducer(appReducer, defaultAppState);

  return (
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppProvider value={{ appState, appDispatch }}>
          <div className={fullScreenCss}>
            <Header />
            <ViewHandler />
            <SideDrawer />
            <AddItemFloatingActionButton />
          </div>
        </AppProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
