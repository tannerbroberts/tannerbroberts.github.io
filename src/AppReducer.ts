export type StateType = typeof initialState;
export type ActionType = 
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_FILTER_TAGS'; payload: string[][] }
  | { type: 'SET_TAB_INDEX'; payload: number }

export const initialState = {
  drawIsOpen: false,
  selectedFilterTags: [new Array<string>()],
  selectedTabIndex: 0,
}

export default function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'TOGGLE_DRAWER':
      return { ...state, drawIsOpen: !state.drawIsOpen }
    case 'SET_FILTER_TAGS':
      return { ...state, selectedFilterTags: action.payload }
    case 'SET_TAB_INDEX':
      return { ...state, selectedTabIndex: action.payload }
    default:
      return state
  }
}