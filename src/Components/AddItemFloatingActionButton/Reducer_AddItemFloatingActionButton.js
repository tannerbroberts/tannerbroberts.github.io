
export const AddItemFloatingActionButtonInitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(AddItemFloatingActionButtonReducer, state);
  }
};

export const AddItemFloatingActionButtonReducerActions = Object.keys(actionsMap);

export default function AddItemFloatingActionButtonReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in AddItemFloatingActionButtonReducer`);
  }
}
