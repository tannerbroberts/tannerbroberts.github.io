import React from 'react';
import AddItemFloatingActionButtonProvider from './Provider_AddItemFloatingActionButton';
import AddItemFloatingActionButtonReducer, { AddItemFloatingActionButtonInitialState } from './Reducer_AddItemFloatingActionButton';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import { Fab } from '@mui/material';
import { css } from '@emotion/css';

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function AddItemFloatingActionButton() {
  const [state, dispatch] = React.useReducer(AddItemFloatingActionButtonReducer, AddItemFloatingActionButtonInitialState);
  const openCommandLine = useOpenCommandLine();

  return (
    <AddItemFloatingActionButtonProvider {...{ state, dispatch }}>

      <div className={fabStyle}>
        <Fab color="primary" aria-label="add" onClick={openCommandLine}>
          /
        </Fab>
      </div>
    </AddItemFloatingActionButtonProvider>

  );
}

function useOpenCommandLine() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return () => {
    AboutTimeDispatch({
      type: 'BATCH', value: [
        { type: 'TOGGLE_COMMAND_LINE' },
        { type: 'SET_COMMAND', value: '/' }
      ]
    });
  }
}