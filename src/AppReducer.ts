export type AppState = typeof initialState;
export type AppAction = 
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_FILTER_TAGS'; payload: string[][] }
  | { type: 'SET_TAB_INDEX'; payload: number }
  | { type: 'ADD_PAGE_TO_VIEWED_PAGES'; payload: string }

export const initialState = {
  drawIsOpen: false,
  selectedFilterTags: [new Array<string>()],
  selectedTabIndex: 0,
  visitedProjectNames: [] as string[],
}

export default function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_DRAWER':
      return { ...state, drawIsOpen: !state.drawIsOpen }
    case 'SET_FILTER_TAGS':
      return { ...state, selectedFilterTags: action.payload }
    case 'SET_TAB_INDEX':
      return { ...state, selectedTabIndex: action.payload }
    case 'ADD_PAGE_TO_VIEWED_PAGES':

    // Makes sure we don't add the same project name to the list of visited projects more than once
      if (state.visitedProjectNames.includes(action.payload)) return state
      
      // Adds the project name to the list of visited projects
      return { ...state, visitedProjectNames: [...state.visitedProjectNames, action.payload] }
    default:
      return state
  }
}
