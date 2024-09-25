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
    const listenForPlusKey = (event) => {
      if (event.key === "+" && !appState.bottomDrawerOpen) {
        console.log('key pressed', event.key);
        appDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
      }
      if (event.key === '-' && appState.bottomDrawerOpen) {
        appDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
      }
    }
    window.addEventListener("keydown", listenForPlusKey);
    return () => window.removeEventListener("keydown", listenForPlusKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={fabStyle}>
      <Fab color="primary" aria-label="add" onClick={openBottomDrawer}>
        <Add />
      </Fab>
    </div>
  );
}
