
export const BottomDrawerInitialState = {
  newItemName: '',
  newItemLength: 3_600_000 // Default to 1 hour
};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(BottomDrawerReducer, state);
  },
  SET_NEW_ITEM_NAME: (state, action) => {
    return { ...state, newItemName: action.value };
  },
  SET_NEW_ITEM_LENGTH: (state, action) => {
    return { ...state, newItemLength: action.value };
  }
};

export default function BottomDrawerReducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(`Action type ${action.type} not found in BottomDrawerReducer`);
  }
}
