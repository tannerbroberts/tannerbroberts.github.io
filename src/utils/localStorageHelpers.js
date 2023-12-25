/* eslint-disable no-unused-vars */
const DELIMITER = "*";
const STATE_NAME_SPACE = `${DELIMITER}STATE${DELIMITER}`;
const ITEM_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`;
const LIBRARY_NAME_SPACE = `${DELIMITER}LIBRARY${DELIMITER}`;
const TAG_NAME_SPACE = `${DELIMITER}TAG${DELIMITER}`;

/**
 * @throws Error if stateName is undefined
 * @throws Error if stateValue is undefined
 */
export const saveState = (stateName, stateValue) => {
  if (!stateName) throw new Error("stateName is undefined");
  if (!stateValue) throw new Error("stateValue is undefined");
  localStorage.setItem(
    `${STATE_NAME_SPACE}${stateName}`,
    JSON.stringify(stateValue)
  );
};
/**
 * @throws Error if stateName is undefined
 * @throws Error if loaded state is undefined
 */
export const loadState = (stateName) => {
  if (!stateName) throw new Error("stateName is undefined");
  const savedValue = localStorage.getItem(`${STATE_NAME_SPACE}${stateName}`);
  if (savedValue) {
    return JSON.parse(savedValue);
  } else {
    throw new Error(`State ${stateName} not found`);
  }
};
/**
 * @throws Error if item is undefined
 * @throws Error if item.name is undefined
 */
export const saveItem = (item) => {
  if (!item) throw new Error("Item is undefined");
  if (!item.name) throw new Error("Item requires a name attribute");
  localStorage.setItem(`${ITEM_NAME_SPACE}${item.name}`, JSON.stringify(item));
};
/**
 * @throws Error if item is not found
 * @throws Error if name is undefined
 */
export const loadItem = (name) => {
  if (!name) throw new Error("Item name is undefined");
  const savedValue = localStorage.getItem(`${ITEM_NAME_SPACE}${name}`);
  if (savedValue) {
    return JSON.parse(savedValue);
  } else {
    throw new Error(`Item ${name} not found`);
  }
};

/**
 * 
 */
export const saveLibrary = (library) => {
  localStorage.setItem(`${ITEM_NAME_SPACE}library`, JSON.stringify(library));
};
