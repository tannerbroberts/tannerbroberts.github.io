import { cloneDeep } from "lodash";
import { Child, getIndexById, Item, Parent } from "../utils/item";

export type AppState = typeof initialState;
export type AppAction =
  | { type: "BATCH"; payload: AppAction[] }
  | {
    type: "CREATE_ITEM";
    payload: { id: string; name: string; duration: number; children: Child[] };
  }
  | { type: "DELETE_ITEM_BY_ID"; payload: { id: string | null } }
  | { type: "REMOVE_INSTANCES_BY_ID"; payload: { id: string | null } }
  | {
    type: "SET_FOCUSED_ITEM_BY_ID";
    payload: { focusedItemId: string | null };
  }
  | {
    type: "SET_FOCUSED_LIST_ITEM_BY_ID";
    payload: { focusedListItemId: string | null };
  }
  | {
    type: "SET_ITEM_SEARCH_WINDOW_RANGE";
    payload: { min: number; max: number };
  }
  | {
    type: "SET_SCHEDULING_DIALOG_OPEN";
    payload: { schedulingDialogOpen: boolean };
  }
  | { type: "SET_SIDE_DRAWER_OPEN"; payload: { sideDrawerOpen: boolean } }
  | {
    type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID";
    payload: { id: string; showChildren: boolean };
  };

export const DEFAULT_WINDOW_RANGE_SIZE = 4;
export const initialState = {
  expandSearchItems: false,
  focusedItemId: null as string | null,
  focusedListItemId: null as string | null,
  items: new Array<Item>(),
  itemSearchWindowRange: { min: 0, max: DEFAULT_WINDOW_RANGE_SIZE },
  schedulingDialogOpen: true,
  sideDrawerOpen: false,
};

export default function reducer(
  previous: AppState,
  action: AppAction,
): AppState {
  switch (action.type) {
    case "BATCH": {
      //* ****************************************************
      //* Everything
      //* ****************************************************
      const newState = cloneDeep(action.payload.reduce(reducer, previous));
      return newState;
    }
    case "CREATE_ITEM": {
      const id = action.payload.id;
      const name = action.payload.name;
      const duration = action.payload.duration;
      const children = action.payload.children;
      const items = previous.items;
      const newItem = new Item({
        id,
        name,
        duration,
        children,
        parents: [],
        showChildren: false,
      });

      // Add parent references to all child items
      children.forEach((child) => {
        const childIndex = getIndexById(items, child.id);
        if (childIndex !== -1) {
          const parent = new Parent({
            id: newItem.id,
            relationshipId: child.relationshipId,
          });

          //* ****************************************************
          //* parents array for each child in the new item
          //* ****************************************************
          items[childIndex].parents = [...items[childIndex].parents, parent];
        }
      });

      // Add the new item to the list
      //* ****************************************************
      //* items
      //* ****************************************************
      const newItems = [...items, newItem];

      // Sort by id
      newItems.sort((a, b) => a.id > b.id ? 1 : -1);

      //* ****************************************************
      //* appState
      //* ****************************************************
      return { ...previous, items: newItems };
    }
    case "DELETE_ITEM_BY_ID": {
      const id = action.payload.id;
      if (!id) return previous;

      //* ****************************************************
      //* parents and children with id
      //* ****************************************************
      const removedInstanceState = reducer(previous, {
        type: "REMOVE_INSTANCES_BY_ID",
        payload: { id },
      });

      //* ****************************************************
      //* items
      //* ****************************************************
      const newItems = removedInstanceState.items.filter((item) =>
        item.id !== id
      );

      const { focusedListItemId, focusedItemId } = previous;
      const shouldNullifyFocusedItemId = focusedItemId === id;
      const shouldNullifyFocusedListItemId = focusedListItemId === id;

      //* ****************************************************
      //* appState
      //* ****************************************************
      return {
        ...removedInstanceState,
        items: newItems,
        focusedItemId: shouldNullifyFocusedItemId ? null : focusedItemId,
        focusedListItemId: shouldNullifyFocusedListItemId
          ? null
          : focusedListItemId,
      };
    }
    case "REMOVE_INSTANCES_BY_ID": {
      const id = action.payload.id;
      if (!id) return previous;

      //* ****************************************************
      //* parents and children with id
      //* ****************************************************
      const newItems = previous.items.map((item) => {
        if (item.children.some((child) => child.id === id)) {
          const children = [
            ...item.children.filter((child) => child.id !== id),
          ];
          return { ...item, children };
        }
        if (item.parents.some((parent) => parent.id === id)) {
          const parents = [
            ...item.parents.filter((parent) => parent.id !== id),
          ];
          return { ...item, parents };
        }
        return item;
      });

      //* ****************************************************
      //* appState
      //* ****************************************************
      return { ...previous, items: newItems };
    }
    case "SET_FOCUSED_ITEM_BY_ID": {
      const { focusedItemId } = action.payload;
      if (!focusedItemId) return previous;

      //* ****************************************************
      //* appState
      //* focusedItemId
      //* ****************************************************
      return { ...previous, focusedItemId, focusedListItemId: null };
    }
    case "SET_FOCUSED_LIST_ITEM_BY_ID": {
      const { focusedListItemId } = action.payload;
      if (!focusedListItemId) return previous;

      //* ****************************************************
      //* appState
      //* focusedItemId
      //* ****************************************************
      return { ...previous, focusedListItemId: focusedListItemId };
    }
    case "SET_SCHEDULING_DIALOG_OPEN": {
      //* ****************************************************
      //* appState
      //* schedulingDialogOpen
      //* ****************************************************
      const { schedulingDialogOpen } = action.payload;
      return { ...previous, schedulingDialogOpen };
    }
    case "SET_SIDE_DRAWER_OPEN": {
      //* ****************************************************
      //* appState
      //* sideDrawerOpen
      //* ****************************************************
      const { sideDrawerOpen } = action.payload;
      return { ...previous, sideDrawerOpen };
    }
    case "SET_ITEM_SEARCH_WINDOW_RANGE": {
      const { min, max } = action.payload;
      return { ...previous, itemSearchWindowRange: { min, max } };
    }
    case "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID": {
      const { id, showChildren } = action.payload;

      //* ****************************************************
      //* items
      //* item with id
      //* ****************************************************
      const items = [...previous.items.map((item) => {
        if (item.id === id) {
          const { name, duration, children } = item;
          const newItem = new Item({
            id,
            name,
            duration,
            children,
            parents: item.parents,
            showChildren: !showChildren,
          });
          return newItem;
        }
        return item;
      })];
      return { ...previous, items };
    }

    default:
      return previous;
  }
}
