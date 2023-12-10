import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { css } from "@emotion/css";
import { AppContextProvider } from "./AppContext";
import ContextMenuShelf from "./ContextMenuShelf";
import AboutTimeScheduleView from "./AboutTimeScheduleView";

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
    <div className={fullScreenCss}>
      <AppContextProvider>
        <ContextMenuShelf>
          <AboutTimeScheduleView />
        </ContextMenuShelf>
      </AppContextProvider>
    </div>
  );
}

export default App;
