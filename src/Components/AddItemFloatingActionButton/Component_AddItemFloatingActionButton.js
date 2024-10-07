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
  const openBottomDrawer = useOpenBottomDrawer();

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

function useOpenBottomDrawer() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useCallback(() => {
    AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' })
  }, [AboutTimeDispatch]);
}
