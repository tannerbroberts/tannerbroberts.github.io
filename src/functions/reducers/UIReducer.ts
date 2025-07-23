export interface ItemUIState {
  itemId: string;
  showChildren: boolean;
  expanded: boolean;
}

export interface AppUIState {
  itemUIStates: Record<string, ItemUIState>;
}

export type UIAction =
  | { type: "TOGGLE_ITEM_SHOW_CHILDREN"; payload: { itemId: string; showChildren: boolean } }
  | { type: "SET_ITEM_EXPANDED"; payload: { itemId: string; expanded: boolean } };

export const initialUIState: AppUIState = {
  itemUIStates: {},
};

export function uiReducer(state: AppUIState, action: UIAction): AppUIState {
  switch (action.type) {
    case "TOGGLE_ITEM_SHOW_CHILDREN":
      return {
        ...state,
        itemUIStates: {
          ...state.itemUIStates,
          [action.payload.itemId]: {
            ...state.itemUIStates[action.payload.itemId],
            itemId: action.payload.itemId,
            showChildren: action.payload.showChildren,
            expanded: state.itemUIStates[action.payload.itemId]?.expanded ?? false,
          },
        },
      };
    case "SET_ITEM_EXPANDED":
      return {
        ...state,
        itemUIStates: {
          ...state.itemUIStates,
          [action.payload.itemId]: {
            ...state.itemUIStates[action.payload.itemId],
            itemId: action.payload.itemId,
            showChildren: state.itemUIStates[action.payload.itemId]?.showChildren ?? false,
            expanded: action.payload.expanded,
          },
        },
      };
    default:
      return state;
  }
}

export function getItemUIState(uiState: AppUIState, itemId: string): ItemUIState {
  return uiState.itemUIStates[itemId] || {
    itemId,
    showChildren: false,
    expanded: false,
  };
}
