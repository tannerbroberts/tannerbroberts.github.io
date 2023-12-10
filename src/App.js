import React, { createContext, useContext } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { css } from "@emotion/css";
import ContextMenuShelf from "./ContextMenuShelf";

export const AppContext = createContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
};

// Makes the app fill the entire screen
const fullScreenCss = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: lightblue;
`;

const tempBaseCss = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: green;
`;

function App() {
  return (
    <AppContext.Provider value={{}}>
      <div className={fullScreenCss}>
        <ContextMenuShelf>
          <div className={tempBaseCss}>App</div>
        </ContextMenuShelf>
      </div>
    </AppContext.Provider>
  );
}

export default App;
