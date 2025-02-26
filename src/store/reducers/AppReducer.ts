import { v4 as uuid } from "uuid";
import { Child, Item } from "../utils/item";
import { cloneDeep } from "lodash";

export type AppState = typeof initialState;
export type AppAction =
  | { type: "BATCH"; payload: AppAction[] }
  | { type: "CLOSE_SIDE_DRAWER" }
  | {
    type: "CREATE_ITEM";
    payload: { name: string; duration: number; children: Child[] };
  }
  | { type: "DELETE_ITEM_BY_ID"; payload: { id: string } }
  | { type: "OPEN_SIDE_DRAWER" }
  | { type: "REMOVE_INSTANCES_BY_ID"; payload: { id: string } }
  | { type: "SET_FOCUSED_ITEM_BY_ID"; payload: { focusedItemId: string | null } }
  | {
    type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID";
    payload: { id: string; showChildren: boolean };
  }
  | { type: "TOGGLE_SIDE_DRAWER" };

export const initialState = {
  sideDrawerOpen: false,
  items: new Array<Item>(),
  focusedItemId: null as string | null,
};

export default function reducer(
  previous: AppState,
  action: AppAction,
): AppState {
  switch (action.type) {
    case "BATCH": {
      return action.payload.reduce(reducer, previous);
    }
    case "CLOSE_SIDE_DRAWER": {
      return { ...previous, sideDrawerOpen: false };
    }
    case "CREATE_ITEM": {
      const id = uuid();
      const name = action.payload.name;
      const duration = action.payload.duration;
      const children = action.payload.children;
      const newItem = new Item(id, name, duration, children, false);
      const items = [...previous.items, newItem];
      items.sort((a, b) => a.id > b.id ? 1 : -1);
      return { ...previous, items };
    }
    case "DELETE_ITEM_BY_ID": {
      const id = action.payload.id;
      const removedInstanceState = reducer(previous, {
        type: "REMOVE_INSTANCES_BY_ID",
        payload: { id },
      });
      const items = removedInstanceState.items.filter((item) => item.id !== id);
      return { ...removedInstanceState, items };
    }
    case "OPEN_SIDE_DRAWER": {
      return { ...previous, sideDrawerOpen: true };
    }
    case "REMOVE_INSTANCES_BY_ID": {
      const id = action.payload.id;
      const newItems = previous.items.map((item) => {
        if (item.children.some((child) => child.id === id)) {
          const children = [
            ...item.children.filter((child) => child.id !== id),
          ];
          return { ...cloneDeep(item), children };
        }
        return item;
      });
      return { ...previous, items: newItems };
    }
    case "SET_FOCUSED_ITEM_BY_ID": {
      const { focusedItemId } = action.payload;
      return { ...previous, focusedItemId };
    }
    case "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID": {
      const { id, showChildren } = action.payload;
      const items = previous.items.map((item) => {
        if (item.id === id) {
          const { name, duration, children } = item;
          const newItem = new Item(id, name, duration, children, showChildren);
          return newItem;
        }
        return item;
      });
      return { ...previous, items };
    }
    case "TOGGLE_SIDE_DRAWER": {
      return { ...previous, sideDrawerOpen: !previous.sideDrawerOpen };
    }

    default:
      return previous;
  }
}
