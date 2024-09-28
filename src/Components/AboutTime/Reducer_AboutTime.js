import { CALENDAR_VIEWS } from "../../constants";
import { isValidItem, isValidView } from "../../utils";

export const AboutTimeInitialState = {
  bottomDrawerOpen: false,
  sideDrawerOpen: false,
  selectedItem: null,
  selectedView: CALENDAR_VIEWS.UP_NEXT,
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(AboutTimeReducer, state);
  },
  TOGGLE_BOTTOM_DRAWER: (state, action) => {
    return { ...state, bottomDrawerOpen: !state.bottomDrawerOpen };
  },
  TOGGLE_SIDE_DRAWER: (state, action) => {
    return { ...state, sideDrawerOpen: !state.sideDrawerOpen };
  },
  SET_SELECTED_ITEM: (state, action) => {
    if (!isValidItem(action.value)) throw new Error("Invalid item");
    return { ...state, selectedItem: action.value };
  },
  SET_SELECTED_VIEW: (state, action) => {
    if (!isValidView(action.value)) throw new Error("Invalid view");
    return { ...state, selectedView: action.value };
  }
};

export const AboutTimeReducerActions = Object.keys(actionsMap);

export default function AboutTimeReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type not found in AboutTimeReducer`);
  }
}
