import { v4 as uuid } from 'uuid'
import { Child, Item } from '../utils/item';

export type AppState = typeof initialState
export type AppAction =
  | { type: 'BATCH'; payload: AppAction[] }
  | { type: 'OPEN_SIDE_DRAWER' }
  | { type: 'CLOSE_SIDE_DRAWER' }
  | { type: 'TOGGLE_SIDE_DRAWER' }
  | { type: 'CREATE_ITEM', payload: { name: string, duration: number, children: Child[] } }
  | { type: 'DELETE_ITEM_BY_ID', payload: { id: string } }

export const initialState = {
  sideDrawerOpen: false,
  items: new Array<Item>(),
}

export default function reducer(previous: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BATCH': {
      return action.payload.reduce(reducer, previous)
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
      const children = action.payload.children
      const newItem = new Item(id, name, duration, children)
      const items = [...previous.items, newItem]
      items.sort((a, b) => a.duration > b.duration ? 1 : -1)
      return { ...previous, items }
    }
    case 'DELETE_ITEM_BY_ID': {
      const id = action.payload.id
      const items = previous.items.filter(item => item.id !== id)
      return { ...previous, items }
    }
    default:
      return previous
  }
}
