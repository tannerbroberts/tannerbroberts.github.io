import React from "react";
import { useAppContext } from "./App";
import { Add } from "@mui/icons-material";
import { css } from "@emotion/css";
import { Fab } from "@mui/material";

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const { appDispatch, appState } = useAppContext();

  const openBottomDrawer = React.useCallback(() => appDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' }), [appDispatch]);

  React.useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "+" && !appState.bottomDrawerOpen) {
        appDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
      }
      if (event.key === '-' && appState.bottomDrawerOpen) {
        appDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
      }
    });
  }, [appState, appDispatch]);

  return (
    <div className={fabStyle}>
      <Fab color="primary" aria-label="add" onClick={openBottomDrawer}>
        <Add />
      </Fab>
    </div>
  );
}
