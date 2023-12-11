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

// Time until start
// Time left in event
// Parent events

export default function HeadsUp() {
  return (
    <div className={headsUpCss}>
    </div>
  );
}
