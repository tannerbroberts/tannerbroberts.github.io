import React from "react";
import { css } from "@emotion/css";
import { formatMillis } from "../../../../utils/format";
import { Stack } from "@mui/material";
import { useHeadsupCardContext } from "./HeadsupCardProvider";


const headsupCss = css`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  padding: 10px;

  background-color: lightblue;
`;

export default function HeadsupCard() {
  const item = useHeadsupCardContext();
  return (
    <div className={headsupCss}>
      <h2>{item.name}</h2>
      <h3>Start: {item.startTime.toLocaleTimeString()}</h3>
      <h3>Duration: {formatMillis(item.length)}</h3>
      <Stack direction="row">
      </Stack>
    </div>
  );
}
