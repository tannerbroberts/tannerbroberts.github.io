import { CALENDAR_VIEWS } from "../../constants";
import { isValidItem, isValidView } from "../../utils";
import { getLocalScope } from "../../utils";

const { getLocal, setLocal } = getLocalScope("AboutTime");

export const AboutTimeInitialState = {
  ...getLocal({ bottomDrawerOpen: false }),
  ...getLocal({ sideDrawerOpen: false }),
  CommandLine: {
    isOpen: false,
    command: "",
    isValidCommand: false,
  },
  selectedItem: "[No Selection]",
  selectedView: CALENDAR_VIEWS.UP_NEXT,
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(AboutTimeReducer, state);
  },
  SET_COMMAND: (state, action) => {
    if (action.value === '') return { ...state, CommandLine: { ...state.CommandLine, command: '', isValidCommand: false, isOpen: false } };
    return { ...state, command: action.value };
  },
  SET_IS_VALID_COMMAND: (state, action) => {
    return { ...state, isValidCommand: action.value };
  },
  SET_SELECTED_ITEM: (state, action) => {
    if (!isValidItem(action.value)) throw new Error("Invalid item");
    return { ...state, selectedItem: action.value };
  },
  SET_SELECTED_VIEW: (state, action) => {
    if (!isValidView(action.value)) throw new Error("Invalid view");
    return { ...state, selectedView: action.value };
  },
  TOGGLE_BOTTOM_DRAWER: (state) => {
    return { ...state, ...setLocal({ bottomDrawerOpen: !state.bottomDrawerOpen }) };
  },
  TOGGLE_COMMAND_LINE: (state) => {
    const { CommandLine: { isOpen } } = state;
    if (isOpen) {
      return { ...state, CommandLine: { ...state.CommandLine, isOpen: false, command: "/", isValidCommand: false } };
    }
    return { ...state, CommandLine: { isOpen: true, command: "/", isValidCommand: false } };
  },
  TOGGLE_SIDE_DRAWER: (state) => {
    return { ...state, ...setLocal({ sideDrawerOpen: !state.sideDrawerOpen }) };
  }
};

export default function AboutTimeReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in AboutTimeReducer`);
  }
}
