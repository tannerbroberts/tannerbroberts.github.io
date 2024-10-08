
export const UpNextInitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(UpNextReducer, state);
  }
};

export default function UpNextReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in UpNextReducer`);
  }
}
