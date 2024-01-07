import React from "react";
import { List } from "@mui/material";
import NameSection from "./NameSection";
import SubmitButtons from "./SubmitButtons/SubmitButtons";
import NewItemCreationReducer, { initialDefaultState } from "./NewItemReducer";
import { useAppContext } from "../../App";

const NewItemCreationContext = React.createContext();

export const NewItemCreationProvider = ({ children }) => {
  const { library } = useAppContext();
  const [state, dispatch] = React.useReducer(
    NewItemCreationReducer,
    initialDefaultState
  );

  const setNewItemName = React.useCallback(
    (newName) => {
      const nameIsTaken = library.includes(newName);
      const illegalCharactersRegex = /[^a-zA-Z0-9 ]/;
      const nameIsInvalid =
        !newName || illegalCharactersRegex.test(newName) || nameIsTaken;
      dispatch({
        type: "SET_NAME",
        value: {
          name: newName,
          nameIsTaken,
          nameIsInvalid,
        },
      });
    },
    [library]
  );
  const onNewItemNameChange = React.useCallback(
    (e) => setNewItemName(e.target.value),
    [setNewItemName]
  );
  const setNewItemTemplate = React.useCallback(
    (newName) =>
      dispatch({
        type: "SET_TEMPLATE",
        value: newName,
      }),
    [dispatch]
  );
  const onNewItemTemplateChange = React.useCallback(
    (e) => setNewItemTemplate(e.target.value),
    [setNewItemTemplate]
  );
  const newItemNameIsTaken = React.useMemo(
    () => library.includes(state.name),
    [library, state.name]
  );
  const newItemNameIsInvalid = React.useMemo(
    () => !state.name || /[^a-zA-Z0-9 ]/.test(state.name),
    [state.name]
  );
  const newItemTemplate = React.useMemo(
    () => (library.includes(state.templateName) ? state.templateName : ""),
    [library, state.templateName]
  );
  return (
    <NewItemCreationContext.Provider
      value={{
        newItemName: state.name,
        newItemNameIsTaken,
        newItemNameIsInvalid,
        newItemTemplate,
        setNewItemName,
        setNewItemTemplate,
        onNewItemNameChange,
        onNewItemTemplateChange,
      }}
    >
      {children}
    </NewItemCreationContext.Provider>
  );
};

/** @returns {{ newItemName, newItemNameIsTaken, newItemNameIsInvalid, newItemTemplate, setNewItemName, setNewItemTemplate, onNewItemNameChange, onNewItemTemplateChange, }} */
export const useNewItemCreationContext = () => {
  const context = React.useContext(NewItemCreationContext);
  if (context === undefined) {
    throw new Error(
      "useNewItemContext must be used within a NewItemContextProvider"
    );
  }
  return context;
};

export default function NewItemCreation() {
  return (
    <div style={{ minWidth: "50vw" }}>
      <List>
        <NameSection />

        <SubmitButtons />
      </List>
    </div>
  );
}
