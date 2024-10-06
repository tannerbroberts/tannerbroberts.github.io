
export const CommandLineInitialState = {
  isValidCommand: false,
  command: '',
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(CommandLineReducer, state);
  },
  SET_COMMAND: (state, action) => {
    return { ...state, command: action.value };
  },
  SET_IS_VALID_COMMAND: (state, action) => {
    return { ...state, isValidCommand: action.value };
  },
};

export default function CommandLineReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in CommandLineReducer`);
  }
}
