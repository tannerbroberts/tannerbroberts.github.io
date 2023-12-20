import { CALENDAR_VIEWS } from "../../utils/constants";
import { saveState } from "../../utils/localStorageHelpers";

// Initial state
export const initialState = {
  shelfOpen: false,
  selectedView: CALENDAR_VIEWS.HEADS_UP,
};

// LocalStorage wrapper
export default function AppReducer(state, action) {
  let newState;
  switch (action.type) {
    case "LOAD_STATE":
      return action.value;
    case "SELECT_HEADS_UP":
      newState = {
        ...state,
        selectedView: CALENDAR_VIEWS.HEADS_UP,
        shelfOpen: false,
      };
      break;
    case "SELECT_DAY":
      newState = {
        ...state,
        selectedView: CALENDAR_VIEWS.DAY,
        shelfOpen: false,
      };
      break;
    case "SELECT_WEEK":
      newState = {
        ...state,
        selectedView: CALENDAR_VIEWS.WEEK,
        shelfOpen: false,
      };
      break;
    case "SELECT_MONTH":
      newState = {
        ...state,
        selectedView: CALENDAR_VIEWS.MONTH,
        shelfOpen: false,
      };
      break;
    case "TOGGLE_SHELF":
      newState = {
        ...state,
        shelfOpen: !state.shelfOpen,
      };
      break;
    default:
      throw new Error(`Unhandled action type in AppReducer: ${action.type}`);
  }

  // There are some actions that we don't want to save to local storage, like the act of loading state FROM local storage
  saveState("AppReducer", newState);
  return newState;
}
