import React from "react";
import { Stack } from "@mui/material";
import { css } from "@emotion/css";
import { useAppContext } from "../../App";

const headsUpCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: whitesmoke;
`;

export default function Headsup() {
  const { library } = useAppContext();

  // Load from local storage, the scheduled events that intersect with the current time window

  return (
    <div className={headsUpCss}>
      <h1>Library:</h1>
      <Stack direction="row">
        {library.map((itemName, index, array) => (
          <div key={itemName}>
            {index !== array.length - 1 && (
              <div key={itemName}>{itemName},</div>
            )}
            {index === array.length - 1 && <div key={itemName}>{itemName}</div>}
          </div>
        ))}
      </Stack>
    </div>
  );
}
