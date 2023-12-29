import React, { useCallback } from "react";
import { Add } from "@mui/icons-material";
import { css } from "@emotion/css";
import { Fab } from "@mui/material";

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const toggleAddItemDialog = useCallback(() => {}, []);

  return (
    <div className={fabStyle}>
      <Fab color="primary" aria-label="add">
        <Add onClick={toggleAddItemDialog} />
      </Fab>
    </div>
  );
}
