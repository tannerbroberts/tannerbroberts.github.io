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
  if (savedValue) return JSON.parse(savedValue);
  return null;
};
