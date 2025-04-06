import reducer, { initialState } from "../functions/reducers/NewItemReducer.ts";
import CreateReducerContext from "./CreateReducerContext.tsx";
const {
  Provider: NewItemProvider,
  useStateContext: useNewItemState,
  useDispatchContext: useNewItemDispatch,
} = CreateReducerContext(reducer, initialState);

export { NewItemProvider, useNewItemDispatch, useNewItemState };
