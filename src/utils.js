import { CALENDAR_VIEWS } from "./App/ViewHandler/ViewHandler";

export function isValidItem(item) {
  return item && item.name && item.length;
}

export function isValidView(view) {
  return view && CALENDAR_VIEWS[view];
}
