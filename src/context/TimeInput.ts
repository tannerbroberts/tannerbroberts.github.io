import reducer, { initialState } from "../store/reducers/AppReducer";
import CreateReducerContext from './CreateReducerContext'
const {
  Provider: TimeInputProvider,
  useStateContext: useTimeInputState,
  useDispatchContext: useTimeInputDispatch
} = CreateReducerContext(reducer, initialState)

export { TimeInputProvider, useTimeInputState, useTimeInputDispatch }