import React from 'react';
import CommandLineFloatingActionButtonProvider from './Provider_CommandLineFloatingActionButton';
import CommandLineFloatingActionButtonReducer, { CommandLineFloatingActionButtonInitialState } from './Reducer_CommandLineFloatingActionButton';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import { Fab } from '@mui/material';
import { css } from '@emotion/css';

const fabStyle = css`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

export default function CommandLineFloatingActionButton() {
  const [state, dispatch] = React.useReducer(CommandLineFloatingActionButtonReducer, CommandLineFloatingActionButtonInitialState);
  const openCommandLine = useOpenCommandLine();

  return (
    <CommandLineFloatingActionButtonProvider {...{ state, dispatch }}>

      <div className={fabStyle}>
        <Fab color="primary" aria-label="add" onClick={openCommandLine}>
          /
        </Fab>
      </div>
    </CommandLineFloatingActionButtonProvider>

  );
}

function useOpenCommandLine() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return () => {
    AboutTimeDispatch({
      type: 'BATCH', value: [
        { type: 'TOGGLE_COMMAND_LINE' },
      ]
    });
  }
}