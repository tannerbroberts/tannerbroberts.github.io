import React from "react";
import { Add } from "@mui/icons-material";
import { css } from "@emotion/css";
import { Fab } from "@mui/material";
import { useBottomDrawerContext } from "./BottomDrawer/BottomDrawer";

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const { bottomDrawerIsOpen, openBottomDrawer } = useBottomDrawerContext();

  if (!bottomDrawerIsOpen)
    return (
      <div className={fabStyle}>
        <Fab color="primary" aria-label="add" onClick={openBottomDrawer}>
          <Add />
        </Fab>
      </div>
    );
  return null;
}
