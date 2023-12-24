import React, { useEffect } from "react";
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
  let items = ["test", "test2", "test3"];
  useEffect(() => {
    // Load from local storage, the scheduled events that intersect with the current moment
  }, []);

  // Get the current time

  // Get the next item that intersects with the current time

  return (
    <div className={headsUpCss}>
      {items.map((item) => {
        return <div>{item}</div>;
      })}
    </div>
  );
}
