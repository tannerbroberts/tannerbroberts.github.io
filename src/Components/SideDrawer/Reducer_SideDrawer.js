
export const SideDrawerInitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(SideDrawerReducer, state);
  }
};

export const SideDrawerReducerActions = Object.keys(actionsMap);

export default function SideDrawerReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type not found in SideDrawerReducer`);
  }
}
