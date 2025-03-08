import reducer, { initialState } from "../store/reducers/TimeInputReducer";
import CreateReducerContext from "./CreateReducerContext";
const {
  Provider: TimeInputProvider,
  useStateContext: useTimeInputState,
  useDispatchContext: useTimeInputDispatch,
} = CreateReducerContext(reducer, initialState);

export { TimeInputProvider, useTimeInputDispatch, useTimeInputState };
