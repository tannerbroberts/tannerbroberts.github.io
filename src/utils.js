import { CALENDAR_VIEWS } from './constants';

export function isValidItem(item) {
  return item && item.name && item.length;
}

export function isValidView(view) {
  return view && CALENDAR_VIEWS[view];
}

// Gets a value saved to localStorage to set default values for reducer state
export function getLocal(defaultObject) {
  const keys = Object.keys(defaultObject);
  if (keys.length > 1) throw new Error('defaultObject must have only one key');
  const key = keys[0];
  const value = localStorage.getItem(key);
  if (!value) localStorage.setItem(key, JSON.stringify(defaultObject[key]));
  return { [key]: JSON.parse(localStorage.getItem(key)) };
}

// Saves a value to localStorage duing the course of a reducer action
export function setLocal(setObject) {
  const keys = Object.keys(setObject);
  if (keys.length > 1) throw new Error('defaultObject must have only one key');
  const key = keys[0];
  const returnObject = { [key]: setObject[key] };
  localStorage.setItem(key, JSON.stringify(setObject[key]));
  return returnObject;
}
