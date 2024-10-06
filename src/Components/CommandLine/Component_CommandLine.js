import React from 'react';
import { css } from '@emotion/css';
import { Input, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';
import CommandLineProvider from './Provider_CommandLine';
import CommandLineReducer, { CommandLineInitialState } from './Reducer_CommandLine';

const CommandLineCss = (isValidCommand) => {
  return css`
  padding: 1rem;
  background-color: ${isValidCommand ? 'lightgreen' : 'lightgrey'};
`;
}

export default function CommandLine() {
  const [state, dispatch] = React.useReducer(CommandLineReducer, CommandLineInitialState);
  const { AboutTimeState } = useAboutTimeContext();
  const commandLineCommands = useCommandLineCommands();
  useForwardSlashCommandLineToggle({ dispatch });
  useCommandExecutionOnEnter({ state, dispatch, commandLineCommands });
  const onChange = useCommanLineOnChangeInputListener({ dispatch, commandLineCommands });

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
            className={CommandLineCss(state.isValidCommand)}
            value={state.command}
            onChange={onChange}
          />}
      </Popover>
    </CommandLineProvider>
  );
}

function useCommandExecutionOnEnter({ state, dispatch, commandLineCommands }) {
  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();

  const listenForEnter = React.useCallback((event) => {
    if (event.key === "Enter") {
      if (AboutTimeState.commandLineOpen) {
        if (state.isValidCommand) {
          commandLineCommands[state.command]();
          dispatch({ type: 'SET_COMMAND', value: '' });
        }
        AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
      }
    }
  }, [AboutTimeDispatch, AboutTimeState.commandLineOpen, commandLineCommands, dispatch, state.command, state.isValidCommand]);

  React.useEffect(() => {
    window.addEventListener("keydown", listenForEnter);
    return () => window.removeEventListener("keydown", listenForEnter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenForEnter]);
}

function useCommandLineCommands() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return React.useMemo(() => ({
    "/add": () => {
      AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
    },
  }), [AboutTimeDispatch]);
}

function useCommanLineOnChangeInputListener({ dispatch, commandLineCommands }) {
  return (e) => {
    const isValidCommand = Boolean(commandLineCommands[e.target.value]);
    dispatch({
      type: 'BATCH', value: [
        { type: 'SET_COMMAND', value: e.target.value },
        { type: 'SET_IS_VALID_COMMAND', value: isValidCommand },
      ]
    })
  }
}

function useForwardSlashCommandLineToggle({ dispatch }) {
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
