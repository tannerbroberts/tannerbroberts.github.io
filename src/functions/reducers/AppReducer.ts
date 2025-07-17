import { cloneDeep } from "lodash";
import { getIndexById, Item } from "../utils/item";
import { v4 as uuid } from "uuid";

export type AppState = typeof initialState;

// Base calendar entry representing a scheduled item
export interface BaseCalendarEntry {
  readonly id: string;
  readonly itemId: string;
  readonly startTime: number; // Milliseconds from Apple epoch
}

export type AppAction =
  | { type: "BATCH"; payload: AppAction[] }
  | {
    type: "CREATE_ITEM";
    payload: { newItem: Item };
  }
  | { type: "DELETE_ITEM_BY_ID"; payload: { id: string | null } }
  | { type: "REMOVE_INSTANCES_BY_ID"; payload: { id: string | null } }
  | { type: "REMOVE_INSTANCE_BY_RELATIONSHIP_ID"; payload: { relationshipId: string | null } }
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
    type: "SET_MILLISECONDS_PER_SEGMENT";
    payload: { millisecondsPerSegment: number };
  }
  | {
    type: "SET_NEW_ITEM_DIALOG_OPEN";
    payload: { newItemDialogOpen: boolean };
  }
  | {
    type: "SET_SCHEDULING_DIALOG_OPEN";
    payload: { schedulingDialogOpen: boolean };
  }
  | {
    type: "SET_PIXELS_PER_SEGMENT";
    payload: { pixelsPerSegment: number };
  }
  | { type: "SET_SIDE_DRAWER_OPEN"; payload: { sideDrawerOpen: boolean } }
  | {
    type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID";
    payload: { id: string; showChildren: boolean };
  }
  | {
    type: "UPDATE_ITEMS";
    payload: { updatedItems: Item[] };
  }
  | {
    type: "ADD_BASE_CALENDAR_ENTRY";
    payload: { entry: BaseCalendarEntry };
  }
  | {
    type: "REMOVE_BASE_CALENDAR_ENTRY";
    payload: { entryId: string };
  }
  | {
    type: "UPDATE_BASE_CALENDAR_ENTRY";
    payload: { entry: BaseCalendarEntry };
  };

export const DEFAULT_WINDOW_RANGE_SIZE = 4;
export const initialState = {
  millisecondsPerSegment: 100,
  pixelsPerSegment: 30,
  expandSearchItems: false,
  focusedItemId: null as string | null,
  focusedListItemId: null as string | null,
  items: new Array<Item>(),
  baseCalendar: new Map<string, BaseCalendarEntry>(),
  itemSearchWindowRange: { min: 0, max: DEFAULT_WINDOW_RANGE_SIZE },
  schedulingDialogOpen: false,
  sideDrawerOpen: false,
  newItemDialogOpen: false,
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
      const { newItem } = action.payload;
      if (!newItem) throw new Error("No new item provided to CREATE_ITEM");

      // Add the new item to the list
      //* ****************************************************
      //* items
      //* ****************************************************
      const newItems = [...previous.items, newItem];

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
          return new Item({ ...item, children });
        }
        if (item.parents.some((parent) => parent.id === id)) {
          const parents = [
            ...item.parents.filter((parent) => parent.id !== id),
          ];
          return new Item({ ...item, parents });
        }
        return item;
      });

      //* ****************************************************
      //* appState
      //* ****************************************************
      return { ...previous, items: newItems };
    }
    case "REMOVE_INSTANCE_BY_RELATIONSHIP_ID": {
      const relationshipId = action.payload.relationshipId;
      if (!relationshipId) return previous;

      //* ****************************************************
      //* parents and children with relationshipId
      //* ****************************************************
      const newItems = previous.items.map((item) => {
        if (item.children.some((child) => child.relationshipId === relationshipId)) {
          const children = [
            ...item.children.filter((child) => child.relationshipId !== relationshipId),
          ];
          return new Item({ ...item, children });
        }
        if (item.parents.some((parent) => parent.relationshipId === relationshipId)) {
          const parents = [
            ...item.parents.filter((parent) => parent.relationshipId !== relationshipId),
          ];
          return new Item({ ...item, parents });
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

      //* ****************************************************
      //* appState
      //* focusedItemId
      //* ****************************************************
      if (!focusedItemId) return { ...previous, focusedItemId: null, focusedListItemId: null };

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
    case "SET_MILLISECONDS_PER_SEGMENT": {
      const { millisecondsPerSegment } = action.payload;
      if (millisecondsPerSegment <= 0) {
        throw new Error(
          "millisecondsPerSegment must be greater than 0",
        );
      }
      //* ****************************************************
      //* appState
      //* millisecondsPerSegment
      //* ****************************************************
      return { ...previous, millisecondsPerSegment };
    }
    case "SET_NEW_ITEM_DIALOG_OPEN": {
      //* ****************************************************
      //* appState
      //* newItemDialogOpen
      //* ****************************************************
      const { newItemDialogOpen } = action.payload;
      return { ...previous, newItemDialogOpen };
    }
    case "SET_PIXELS_PER_SEGMENT": {
      const { pixelsPerSegment } = action.payload;
      if (pixelsPerSegment <= 0) {
        throw new Error("pixelsPerSegment must be greater than 0");
      }
      //* ****************************************************
      //* appState
      //* pixelsPerSegment
      //* ****************************************************
      return { ...previous, pixelsPerSegment };
    }
    case "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID": {
      const { id, showChildren } = action.payload;
      const index = getIndexById(previous.items, id);
      if (index === -1) {
        throw new Error("Item not found when trying to toggle showChildren");
      }

      //* ****************************************************
      //* item[index]
      //* ****************************************************
      const item = previous.items[index];
      previous.items[index] = item.updateShowChildren(showChildren);

      //* ****************************************************
      //* items
      //* ****************************************************
      //* *****************************************************
      //* appState
      //* items
      //* *****************************************************
      return { ...previous, items: [...previous.items] };
    }
    case "UPDATE_ITEMS": {
      const { updatedItems } = action.payload;
      if (updatedItems.length === 0) return previous;

      updatedItems.forEach((item) => {
        const index = getIndexById(previous.items, item.id);
        if (index === -1) {
          throw new Error("Item not found when trying to update items");
        }
        previous.items[index] = item;
      });
      //* *****************************************************
      //* appState
      //* items
      //* *****************************************************
      return { ...previous, items: [...previous.items] };
    }
    case "ADD_BASE_CALENDAR_ENTRY": {
      const { entry } = action.payload;
      const newBaseCalendar = new Map(previous.baseCalendar);
      newBaseCalendar.set(entry.id, entry);

      //* *****************************************************
      //* appState
      //* baseCalendar
      //* *****************************************************
      return { ...previous, baseCalendar: newBaseCalendar };
    }
    case "REMOVE_BASE_CALENDAR_ENTRY": {
      const { entryId } = action.payload;
      const newBaseCalendar = new Map(previous.baseCalendar);
      newBaseCalendar.delete(entryId);

      //* *****************************************************
      //* appState
      //* baseCalendar
      //* *****************************************************
      return { ...previous, baseCalendar: newBaseCalendar };
    }
    case "UPDATE_BASE_CALENDAR_ENTRY": {
      const { entry } = action.payload;
      if (!previous.baseCalendar.has(entry.id)) {
        throw new Error(`Base calendar entry with id ${entry.id} not found`);
      }
      const newBaseCalendar = new Map(previous.baseCalendar);
      newBaseCalendar.set(entry.id, entry);

      //* *****************************************************
      //* appState
      //* baseCalendar
      //* *****************************************************
      return { ...previous, baseCalendar: newBaseCalendar };
    }

    default:
      return previous;
  }
}

// Utility function to create a base calendar entry
export function createBaseCalendarEntry(itemId: string, startTime: number): BaseCalendarEntry {
  return {
    id: uuid(),
    itemId,
    startTime
  };
}
