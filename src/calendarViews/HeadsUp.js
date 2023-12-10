import React from "react";
import { css } from "@emotion/css";

const headsUpCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: whitesmoke;
`;

export default function HeadsUp() {
  return (
    <div className={headsUpCss}>
      <h1>Heads Up</h1>
    </div>
  );
}
