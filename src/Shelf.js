import React from "react";
import { css } from "@emotion/css";
import { ListItem } from "@mui/material";

const shelfCss = css`
  z-index: 1;
  position: absolute;
  top: 50px;
  height: calc(100% - 50px);
  width: 200px;
  display: flex;
  flex-direction: column;
  background-color: lightblue;
`;

export default function Shelf() {
  return (
    <div className={shelfCss}>
      <ListItem />
    </div>
  );
}
