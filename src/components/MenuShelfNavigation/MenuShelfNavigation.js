import React, { useReducer } from "react";
import { css } from "@emotion/css";
import Shelf from "./Shelf";
import Header from "./Header";
import MenuShelfNavigationReducer, {
  initialState,
} from "./MenuShelfNavigationReducer";
import { MenuShelfNavigationContext } from "./MenuShelfNavigationContext";

const contextMenuShelfCss = css`
  position: absolute; // Parent of the shelf, must be absolute positioned
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

const contentCss = css`
  position: absolute;
  top: 50px;
  height: calc(100% - 50px);
  width: 100%;
  background-color: yellow;
`;

export default function MenuShelfNavigation({ children }) {
  const [state, dispatch] = useReducer(
    MenuShelfNavigationReducer,
    initialState
  );
  return (
    <MenuShelfNavigationContext {...{ state, dispatch }}>
      <div className={contextMenuShelfCss}>
        <Header />
        {state.shelfOpen && <Shelf />}
        <div className={contentCss}>{children}</div>
      </div>
    </MenuShelfNavigationContext>
  );
}
