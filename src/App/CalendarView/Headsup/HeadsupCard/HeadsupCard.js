import React from "react";
import { useHeadsupCardContext } from "./HeadsupCardContext";
import { css } from "@emotion/css";
import { formatMillis } from "../../../../utils/format";

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
      <h2>{item.name}</h2>
      <h3>Start: {item.startTime.toLocaleTimeString()}</h3>
      <h3>Duration: {formatMillis(item.length + 1001)}</h3>
    </div>
  );
}
