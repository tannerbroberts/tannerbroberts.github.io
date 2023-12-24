import React from "react";
import { useHeadsupCardContext } from "./HeadsupCardContext";
import { css } from "@emotion/css";

const headsupCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;


  background-color: lightblue;
`;

export default function HeadsupCard() {
  const item = useHeadsupCardContext();
  return (
    <div className={headsupCss}>
      <h2>{item}</h2>
      <p>content</p>
    </div>
  );
}
