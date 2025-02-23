import { v4 as uuid } from 'uuid'
import Item from '../utils/item';

export type AppState = typeof initialState
export type AppAction =
  | { type: 'BATCH'; payload: AppAction[] }
  | { type: 'SET_COUNT'; payload: number }
  | { type: 'OPEN_SIDE_DRAWER' }
  | { type: 'CLOSE_SIDE_DRAWER' }
  | { type: 'TOGGLE_SIDE_DRAWER' }

  | { type: 'CREATE_ITEM', payload: { name: string, duration: number } }
  | { type: 'DELETE_ITEM_BY_ID', payload: { id: string } }

export const initialState = {
  count: 0,
  sideDrawerOpen: false,
  items: new Array<Item>(),
}

export default function reducer(previous: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BATCH': {
      return action.payload.reduce(reducer, previous)
    }
    case 'SET_COUNT': {
      return { ...previous, count: action.payload }
    }
    case 'OPEN_SIDE_DRAWER': {
      return { ...previous, sideDrawerOpen: true }
    }
    case 'CLOSE_SIDE_DRAWER': {
      return { ...previous, sideDrawerOpen: false }
    }
    case 'TOGGLE_SIDE_DRAWER': {
      return { ...previous, sideDrawerOpen: !previous.sideDrawerOpen }
    }
    case 'CREATE_ITEM': {
      const id = uuid()
      const name = action.payload.name
      const duration = action.payload.duration
      const newItem = new Item(id, name, duration)
      const items = [...previous.items, newItem]
      items.sort((a, b) => a.id > b.id ? 1 : -1)
      return { ...previous, items }
    }
    default:
      return previous
  }
}
