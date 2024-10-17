import { CALENDAR_VIEWS } from './constants';

export function isValidItem(item) {
  return item && item.name && item.length;
}

export function isValidView(view) {
  return view && CALENDAR_VIEWS[view];
}

export const getLocalScope = (scopeKey) => {
  // Gets a value saved to localStorage to set default values for reducer state
  const getLocal = (defaultObject) => {
    console.log(`getting local with scopeKey: ${scopeKey}`, defaultObject);
    const keys = Object.keys(defaultObject);
    if (keys.length > 1) throw new Error('defaultObject must have only one key');
    const key = keys[0];
    const value = localStorage.getItem(`${scopeKey}.${key}`);
    if (!value) {
      console.log('setting default value', defaultObject[key]);
      localStorage.setItem(`${scopeKey}.${key}`, JSON.stringify(defaultObject[key]));
      return defaultObject
    }
    console.log(`returning from getLocal:`, { [key]: JSON.parse(localStorage.getItem(`${scopeKey}.${key}`)) });
    return { [key]: JSON.parse(localStorage.getItem(`${scopeKey}.${key}`)) };
  }

  // Saves a value to localStorage duing the course of a reducer action
  const setLocal = (setObject) => {
    console.log(`setting local with scopeKey: ${scopeKey}`, setObject);
    const keys = Object.keys(setObject);
    if (keys.length > 1) throw new Error('defaultObject must have only one key');
    const key = keys[0];
    const returnObject = { [key]: setObject[key] };
    localStorage.setItem(`${scopeKey}.${key}`, JSON.stringify(setObject[key]));
    console.log(`returning from setLocal:`, returnObject)
    return returnObject;
  }

  return { getLocal, setLocal };
}
