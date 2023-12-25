import React, { useEffect } from "react";
import { css } from "@emotion/css";
import HeadsupCard, { HeadsupCardProvider } from "./HeadsupCard";
import { TIME_VALUES } from "../../../utils/constants";

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
  let items = [
    {
      name: "first ever item name",
      startTime: new Date(),
      length: TIME_VALUES.DAY,
    },
  ];

  useEffect(() => {
    // Load from local storage, the scheduled events that intersect with the current time window
  }, []);

  return (
    <div className={headsUpCss}>
      {items.map((item, index, array) => {
        return (
          <HeadsupCardProvider key={item} value={item}>
            <HeadsupCard />
            {array.length - 1 !== index && <br />}
          </HeadsupCardProvider>
        );
      })}
    </div>
  );
}
