import reducer, { initialState } from "../store/reducers/NewItemReducer.ts";
import CreateReducerContext from "./CreateReducerContext";
const {
  Provider: NewItemProvider,
  useStateContext: useNewItemState,
  useDispatchContext: useNewItemDispatch,
} = CreateReducerContext(reducer, initialState);

export { NewItemProvider, useNewItemDispatch, useNewItemState };
