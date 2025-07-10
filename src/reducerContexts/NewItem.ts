import reducer, { initialState } from "../functions/reducers/NewItemReducer";
import CreateReducerContext from "./CreateReducerContext";
const {
  Provider: NewItemProvider,
  useStateContext: useNewItemState,
  useDispatchContext: useNewItemDispatch,
} = CreateReducerContext(reducer, initialState);

export { NewItemProvider, useNewItemDispatch, useNewItemState };
