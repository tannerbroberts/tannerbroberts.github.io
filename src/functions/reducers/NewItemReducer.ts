export type NewItemState = typeof initialState;
export type NewItemAction = { type: "SET_NAME"; payload: { name: string } };

export const initialState = {
  name: "",
};

export default function reducer(
  previous: NewItemState,
  action: NewItemAction,
): NewItemState {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...previous,
        name: action.payload.name,
      };
    default:
      return previous;
  }
}
