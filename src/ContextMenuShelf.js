import React from "react";
import { css } from "@emotion/css";
import { Squash as Hamburger } from "hamburger-react";

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
  background-color: lightgreen;
`;

const contextCss = css`
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

const shelfCss = css`
  position: absolute;
  top: 50px;
  height: calc(100% - 50px);
  width: 200px;
  display: flex;
  background-color: lightblue;
`;

const ContextMenuShelf = ({ children }) => {
  const [shelfOpen, setShelfOpen] = React.useState(false);

  return (
    <div className={contextMenuShelfCss}>
      <div className={headerCss}>
        <Hamburger onToggle={setShelfOpen} />
      </div>
      <div className={contextCss}>
        {shelfOpen && <div className={shelfCss}>Shelf</div>}
        {children}
      </div>
    </div>
  );
};

export default ContextMenuShelf;
