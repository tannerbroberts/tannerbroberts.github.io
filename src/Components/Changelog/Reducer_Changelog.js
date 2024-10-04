
export const ChangelogInitialState = {
  changeLog: ''
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(ChangelogReducer, state);
  },
  SET_CHANGELOG: (state, action) => {
    return { ...state, changeLog: action.value };
  }
};

export default function ChangelogReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in ChangelogReducer`);
  }
}
