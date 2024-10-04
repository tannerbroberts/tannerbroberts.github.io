
export const HeaderInitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(HeaderReducer, state);
  }
};

export default function HeaderReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in HeaderReducer`);
  }
}
