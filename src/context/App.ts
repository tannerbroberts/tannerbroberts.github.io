import reducer, { initialState } from "../store/reducers/AppReducer";
import CreateReducerContext from './CreateReducerContext'
const {
  Provider: AppProvider,
  useStateContext: useAppState,
  useDispatchContext: useAppDispatch
} = CreateReducerContext(reducer, initialState)

export { AppProvider, useAppState, useAppDispatch }