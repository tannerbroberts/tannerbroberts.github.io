/* eslint-disable no-unused-vars */
const DELIMITER = "*";
const STATE_NAME_SPACE = `${DELIMITER}STATE${DELIMITER}`;

export const saveState = (stateName, stateValue) => {
  localStorage.setItem(
    `${STATE_NAME_SPACE}${stateName}`,
    JSON.stringify(stateValue)
  );
};

export const loadState = (stateName) => {
  const savedValue = localStorage.getItem(`${STATE_NAME_SPACE}${stateName}`);
  if (savedValue) {
    return JSON.parse(savedValue);
  }
  return null;
};
