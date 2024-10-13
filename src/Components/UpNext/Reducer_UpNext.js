
export const UpNextInitialState = {
  ownHeight: 0,
  windowSize: 3_600_000,
  intervalSize: 120_000,
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(UpNextReducer, state);
  },
  SET_OWN_HEIGHT: (state, action) => {
    return { ...state, ownHeight: action.value };
  },
  SET_INTERVAL_SIZE: (state, action) => {
    return { ...state, intervalSize: action.value };
  },
  SET_WINDOW_SIZE: (state, action) => {
    return { ...state, windowSize: action.value };
  },
};

export default function UpNextReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in UpNextReducer`);
  }
}
