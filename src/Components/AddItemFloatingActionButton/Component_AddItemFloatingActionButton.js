import React from 'react';
import AddItemFloatingActionButtonProvider from './Provider_AddItemFloatingActionButton';
import AddItemFloatingActionButtonReducer, { AddItemFloatingActionButtonInitialState } from './Reducer_AddItemFloatingActionButton';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { css } from '@emotion/css';

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const [state, dispatch] = React.useReducer(AddItemFloatingActionButtonReducer, AddItemFloatingActionButtonInitialState);

  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();

  const openBottomDrawer = React.useCallback(() => {
    AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' })
  }, [AboutTimeDispatch]);

  React.useEffect(() => {
    const listenForPlusKey = (event) => {
      if (event.key === "+" && !AboutTimeState.bottomDrawerOpen) {
        AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
      }
    }
    window.addEventListener("keydown", listenForPlusKey);
    return () => window.removeEventListener("keydown", listenForPlusKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AddItemFloatingActionButtonProvider {...{ state, dispatch }}>

      <div className={fabStyle}>
        <Fab color="primary" aria-label="add" onClick={openBottomDrawer}>
          <Add />
        </Fab>
      </div>
    </AddItemFloatingActionButtonProvider>

  );
}
