import React, { useCallback, useState, useEffect } from "react";
import { useHeadsupCardContext } from "./HeadsupCardContext";
import { css } from "@emotion/css";
import { formatMillis } from "../../../../utils/format";
import Button from "../../../../components/Button";
import Row from "../../../../components/Row";
import { Input } from "@mui/material";
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

export default function HeadsupCard() {
  const { library, setLibrary } = useAppContext();
  const [input, setInput] = useState("");

  const onAddItem = useCallback(() => {
    if (!input) return;
    setLibrary([...library, input]);
    setInput("");
  }, [input, library, setLibrary]);

  const onEnterListener = useCallback(
    (e) => {
      if (e.key === "Enter") {
        onAddItem();
      }
    },
    [onAddItem]
  );

  useEffect(() => {
    window.addEventListener("keydown", onEnterListener);
    return () => window.removeEventListener("keydown", onEnterListener);
  });

  const onChange = useCallback((e) => setInput(e.target.value), []);

  const item = useHeadsupCardContext();
  return (
    <div className={headsupCss}>
      <h2>{item.name}</h2>
      <h3>Start: {item.startTime.toLocaleTimeString()}</h3>
      <h3>Duration: {formatMillis(item.length)}</h3>
      <Row>
        <Input placeholder="Item Name" value={input} onChange={onChange} />
        <Button onClick={onAddItem}>Add To Library</Button>
        <Button onClick={() => setLibrary([])}>Clear Library</Button>
      </Row>
    </div>
  );
}
