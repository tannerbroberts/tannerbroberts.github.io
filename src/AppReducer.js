import { CALENDAR_VIEWS } from "./api/constants";

// Initial state
export const initialState = {
  shelfOpen: false,
  selectedView: "headsUp",
};

// Reducer function
export default function AppReducer(state, action) {
  console.log("AppReducer", state, action);
  switch (action.type) {
    case "TOGGLE_SHELF":
      return {
        ...state,
        shelfOpen: !state.shelfOpen,
      };
    case "SELECT_HEADS_UP":
      return {
        ...state,
        selectedView: CALENDAR_VIEWS.HEADS_UP,
        shelfOpen: false,
      };
    case "SELECT_DAY":
      return {
        ...state,
        selectedView: CALENDAR_VIEWS.DAY,
        shelfOpen: false,
      };
    case "SELECT_WEEK":
      return {
        ...state,
        selectedView: CALENDAR_VIEWS.WEEK,
        shelfOpen: false,
      };
    case "SELECT_MONTH":
      return {
        ...state,
        selectedView: CALENDAR_VIEWS.MONTH,
        shelfOpen: false,
      };
    default:
      throw new Error(`Unhandled action type in AppReducer: ${action.type}`);
  }
}
