export const initialDefaultState = {
  name: "",
  templateName: "",
  nameIsTaken: false,
  nameIsInvalid: false,
};

export default function NewItemReducer(state, action) {
  switch (action.type) {
    case "SET_NAME": {
      const { name, nameIsTaken, nameIsInvalid } = action.value;
      return { ...state, name, nameIsTaken, nameIsInvalid };
    }
    case "SET_TEMPLATE":
      return { ...state, templateName: action.value };
    default:
      throw new Error(`NewItemReducer: Unhandled action type: ${action.type}`);
  }
}
