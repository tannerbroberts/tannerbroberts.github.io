import reducer, { initialState } from "../functions/reducers/AppReducer";
import CreateReducerContext from "./CreateReducerContext";
const {
  Provider: AppProvider,
  useStateContext: useAppState,
  useDispatchContext: useAppDispatch,
} = CreateReducerContext(reducer, initialState);

export { AppProvider, useAppDispatch, useAppState };
