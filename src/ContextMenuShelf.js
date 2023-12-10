import React from "react";
import { css } from "@emotion/css";
import Shelf from "./Shelf";
import { useAppStateContext } from "./AppContext";
import Header from "./Header";

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

const ContextMenuShelf = ({ children }) => {
  const { shelfOpen } = useAppStateContext();

  return (
    <div className={contextMenuShelfCss}>
      <Header />
      {shelfOpen && <Shelf />}
      <div className={contentCss}>{children}</div>
    </div>
  );
};

export default ContextMenuShelf;
