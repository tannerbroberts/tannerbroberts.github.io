
export const UpNextInitialState = {
  ownHeight: 0,
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(UpNextReducer, state);
  },
  SET_OWN_HEIGHT: (state, action) => {
    console.log('called set own height', action.value);
    return { ...state, ownHeight: action.value };
  },
  SET_LEDGER_INTERVAL: (state, action) => {
    return { ...state, ledgerInterval: action.value };
  },
  SET_LEDGER_INTERVAL_PIXEL_HEIGHT: (state, action) => {
    return { ...state, ledgerIntervalPixelHeight: action.value };
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
