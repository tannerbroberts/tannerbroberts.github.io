import React from 'react';
import CommandLineProvider from './Provider_CommandLine';
import CommandLineReducer, { CommandLineInitialState } from './Reducer_CommandLine';
import { css } from '@emotion/css';
import { Input, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function CommandLine() {
  const [state, dispatch] = React.useReducer(CommandLineReducer, CommandLineInitialState);
  const { AboutTimeState } = useAboutTimeContext();
  useBackslashCommandLineToggle({ dispatch });

  const CommandLineCss = React.useMemo(() => {
    return css`
    padding: 1rem;
    background-color: ${state.isValidCommand ? 'teal' : 'lightgrey'};

  `;
  }, [state.isValidCommand]);

  const commands = React.useMemo(() => ({
    "/add": () => {
      console.log('add');
    },
  }), []);
  useRunOnEnter({ state, dispatch, commands });


  return (
    <CommandLineProvider {...{ state, dispatch }}>
      <Popover
        disableRestoreFocus
        open={AboutTimeState.commandLineOpen}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        {AboutTimeState.commandLineOpen &&
          <Input
            autoFocus
            placeholder='command'
            className={CommandLineCss}
            value={state.command}
            onChange={(e) => {
              const isValidCommand = Boolean(commands[e.target.value]);
              dispatch({
                type: 'BATCH', value: [
                  { type: 'SET_COMMAND', value: e.target.value },
                  { type: 'SET_IS_VALID_COMMAND', value: isValidCommand },
                ]
              });
            }}
          />}
      </Popover>
    </CommandLineProvider>
  );
}

function useBackslashCommandLineToggle({ dispatch }) {
  const { AboutTimeDispatch } = useAboutTimeContext();
  React.useEffect(() => {
    const listenForForwardSlash = (event) => {
      if (event.key === "/") {
        AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
        dispatch({ type: 'SET_COMMAND', value: '' });
      }
    }
    window.addEventListener("keydown", listenForForwardSlash);
    return () => window.removeEventListener("keydown", listenForForwardSlash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useRunOnEnter({ state, dispatch, commands }) {
  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();
  React.useEffect(() => {
    const listenForEnter = (event) => {
      if (event.key === "Enter") {
        if (AboutTimeState.commandLineOpen) {
          if (state.isValidCommand) {
            commands[state.command]();
            dispatch({ type: 'SET_COMMAND', value: '' });
          }
          AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
        }
      }
    };
    window.addEventListener("keydown", listenForEnter);
    return () => window.removeEventListener("keydown", listenForEnter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isValidCommand]);
}