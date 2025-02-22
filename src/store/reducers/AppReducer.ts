export type AppState = typeof initialState
export type AppAction =
  | { type: 'BATCH'; payload: AppAction[] }
  | { type: 'SET_COUNT'; payload: number }

export const initialState = {
  count: 0,
}

export default function reducer(previous: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BATCH': {
      return action.payload.reduce(reducer, previous)
    }
    case 'SET_COUNT': {
      return { ...previous, count: action.payload }
    }
    default:
      return previous
  }
}
