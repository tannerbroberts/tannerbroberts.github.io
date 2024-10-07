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
  useForwardSlashCommandLineToggle();
  useCommandExecutionOnEnter({ AboutTimeState, commandLineCommands });
  const onChange = useCommanLineOnChangeInputListener({ commandLineCommands });

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
            className={CommandLineCss(AboutTimeState.isValidCommand)}
            value={AboutTimeState.command}
            onChange={onChange}
          />}
      </Popover>
    </CommandLineProvider>
  );
}

function useCommandExecutionOnEnter({ commandLineCommands }) {
  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();
  const listenForEnter = React.useCallback((event) => {
    const validEnterEvent = event.key === "Enter" && AboutTimeState.commandLineOpen
    if (validEnterEvent) {
      if (AboutTimeState.isValidCommand) commandLineCommands[AboutTimeState.command]();
      AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
    }
  }, [AboutTimeDispatch, AboutTimeState.commandLineOpen, commandLineCommands, AboutTimeState.command, AboutTimeState.isValidCommand]);
  React.useEffect(() => {
    window.addEventListener("keydown", listenForEnter);
    return () => window.removeEventListener("keydown", listenForEnter);
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

function useCommanLineOnChangeInputListener({ commandLineCommands }) {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return (e) => {
    const isValidCommand = Boolean(commandLineCommands[e.target.value]);
    AboutTimeDispatch({
      type: 'BATCH', value: [
        { type: 'SET_COMMAND', value: e.target.value },
        { type: 'SET_IS_VALID_COMMAND', value: isValidCommand },
      ]
    })
  }
}

function useForwardSlashCommandLineToggle() {
  const { AboutTimeDispatch } = useAboutTimeContext();
  React.useEffect(() => {
    const listenForForwardSlash = (event) => {
      if (event.key === "/") {
        event.preventDefault();
        AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
      }
    }
    window.addEventListener("keydown", listenForForwardSlash);
    return () => window.removeEventListener("keydown", listenForForwardSlash);
  }, [AboutTimeDispatch]);
}
