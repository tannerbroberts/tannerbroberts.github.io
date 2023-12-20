import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { css } from "@emotion/css";
import { AppContextProvider } from "./AppContext";
import ContextMenuShelfContainer from "../ContextMenuShelfNavigation";
import CalendarView from "../CalendarView/CalendarView";

// Makes the app fill the entire screen
const fullScreenCss = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: yellow;
`;

function App() {
  return (
    <AppContextProvider>
      <div className={fullScreenCss}>
        <ContextMenuShelfContainer>
          <CalendarView />
        </ContextMenuShelfContainer>
      </div>
    </AppContextProvider>
  );
}

export default App;
