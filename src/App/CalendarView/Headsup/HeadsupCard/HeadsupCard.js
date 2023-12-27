import React from "react";
import { useHeadsupCardContext } from "./HeadsupCardContext";
import { css } from "@emotion/css";
import { formatMillis } from "../../../../utils/format";
import Button from "../../../../components/Button";
import Row from "../../../../components/Row";
import { Input } from "@mui/material";

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

const onAddItem = () => {
  // Take the input's value, and if the value corresponds to a pre-existing Item, add it to the HeadsupCard's items array.
};

export default function HeadsupCard() {
  const item = useHeadsupCardContext();
  return (
    <div className={headsupCss}>
      <h2>{item.name}</h2>
      <h3>Start: {item.startTime.toLocaleTimeString()}</h3>
      <h3>Duration: {formatMillis(item.length + 1001)}</h3>
      <Row>
        <Button onClick={() => {}}>Add Item</Button>
        <Input placeholder="Item Name" />
      </Row>
    </div>
  );
}
