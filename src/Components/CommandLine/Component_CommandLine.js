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
    const validEnterEvent = event.key === "Enter" && AboutTimeState.commandLineOpen && AboutTimeState.isValidCommand;
    if (validEnterEvent) {
      const argsList = AboutTimeState.command.split(" ");
      if (!Array.isArray(argsList) || argsList.length === 0) throw new Error("Command must have at least one argument.");
      // Execute the command
      const command = argsList[0];
      const theRest = argsList.slice(1);
      if (!commandLineCommands[command]) throw new Error(`Command: ${command} not found, but input was left valid.`);
      Array.isArray(theRest) && theRest.length > 0
        ? commandLineCommands[command](theRest)
        : commandLineCommands[command]()
      AboutTimeDispatch({ type: 'TOGGLE_COMMAND_LINE' });
    }
  }, [AboutTimeDispatch, AboutTimeState.commandLineOpen, commandLineCommands, AboutTimeState.command, AboutTimeState.isValidCommand]);
  React.useEffect(() => {
    window.addEventListener("keydown", listenForEnter);
    return () => window.removeEventListener("keydown", listenForEnter);
  }, [listenForEnter]);
}

function useCommandLineCommands() {
  const { AboutTimeDispatch, extras: { schedule, library } } = useAboutTimeContext();
  return React.useMemo(() => ({
    "/new": () => {
      AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
    },
    "/side": () => {
      AboutTimeDispatch({ type: 'TOGGLE_SIDE_DRAWER' });
    },
    "/schedule": ([itemName]) => {
      const noItemProvided = !itemName;
      const itemDoesntExist = !library.getItems({ names: [itemName] }).length;
      if (noItemProvided || itemDoesntExist) return;
      const items = library.getItems({ names: [itemName] });
      if (!items) throw new Error(`Illegal return from getItems.`);
      if (!Array.isArray(items)) throw new Error(`getItems must return an array.`);
      if (items.length === 0) throw new Error(`Item: ${itemName} not found, but command was left valid.`);
      if (items.length > 1) throw new Error(`getItems must return an array with only one item when scheduling by name.`);
      if (items.length === 1) {
        schedule.addItem({ itemName, positionMillis: Date.now() });
      }
    }
  }), [AboutTimeDispatch, library, schedule]);
}

function useCommanLineOnChangeInputListener({ commandLineCommands }) {
  const { AboutTimeDispatch } = useAboutTimeContext();
  return (e) => {
    const firstArg = e.target?.value?.split(" ")[0] || "";
    const isValidCommand = Boolean(commandLineCommands[firstArg]);
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
