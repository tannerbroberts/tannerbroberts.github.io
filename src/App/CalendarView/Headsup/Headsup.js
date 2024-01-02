import React from "react";
import { Stack } from "@mui/material";
import { css } from "@emotion/css";
import HeadsupCard, { HeadsupCardProvider } from "./HeadsupCard";
import { TIME_VALUES } from "../../../utils/constants";
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
  let items = [
    {
      name: "First",
      startTime: new Date(),
      length: TIME_VALUES.DAY,
    },
    {
      name: "Second",
      startTime: new Date(),
      length: TIME_VALUES.HOUR,
    },
  ];

  // Load from local storage, the scheduled events that intersect with the current time window

  return (
    <div className={headsUpCss}>
      {items.map((item, index, array) => {
        return (
          <HeadsupCardProvider key={item.name} value={item}>
            <HeadsupCard />
            {array.length - 1 !== index && <br />}
          </HeadsupCardProvider>
        );
      })}
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
