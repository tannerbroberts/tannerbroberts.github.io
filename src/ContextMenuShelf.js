import React from "react";
import { css } from "@emotion/css";
import { Squash as Hamburger } from "hamburger-react";
import Shelf from "./Shelf";

const contextMenuShelfCss = css`
  position: absolute; // Parent of the shelf, must be absolute positioned
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: lightyellow;
`;

const headerCss = css`
  position: absolute;
  height: 50px;
  width: 100%;
  background-color: whitesmoke;
`;

const contentCss = css`
  position: absolute;
  top: 50px;
  height: calc(100% - 50px);
  width: 100%;
  background-color: yellow;
`;

const ContextMenuShelf = ({ children }) => {
  const [shelfOpen, setShelfOpen] = React.useState(false);

  return (
    <div className={contextMenuShelfCss}>
      <div className={headerCss}>
        <Hamburger onToggle={setShelfOpen} />
      </div>
      {shelfOpen && <Shelf />}
      <div className={contentCss}>{children}</div>
    </div>
  );
};

export default ContextMenuShelf;
