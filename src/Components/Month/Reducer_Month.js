
export const MonthInitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(MonthReducer, state);
  }
};

export const MonthReducerActions = Object.keys(actionsMap);

export default function MonthReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in MonthReducer`);
  }
}
