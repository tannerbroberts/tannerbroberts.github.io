import React, { createContext, useContext } from "react";
import { css } from "@emotion/css";
import { formatMillis } from "../../../../utils/format";
import { Button, Stack } from "@mui/material";
import { useAppContext } from "../../../App";

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

export const HeadsupCardContext = createContext();

export function HeadsupCardProvider({ children, value }) {
  return (
    <HeadsupCardContext.Provider value={value}>
      {children}
    </HeadsupCardContext.Provider>
  );
}

/** @returns {{ value: Item }} */
export const useHeadsupCardContext = () => {
  const context = useContext(HeadsupCardContext);
  if (context === undefined) {
    throw new Error(
      "useHeadsupCardContext must be used within a HeadsupCardProvider"
    );
  }
  return context;
};

export default function HeadsupCard() {
  const { clearLibrary } = useAppContext();

  const item = useHeadsupCardContext();
  return (
    <div className={headsupCss}>
      <h2>{item.name}</h2>
      <h3>Start: {item.startTime.toLocaleTimeString()}</h3>
      <h3>Duration: {formatMillis(item.length)}</h3>
      <Stack direction="row">
        <Button variant="contained" onClick={clearLibrary}>
          Clear Library
        </Button>
      </Stack>
    </div>
  );
}
