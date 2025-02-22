import { createContext, useContext, useReducer } from "react"

export default function CreateReducerContext<Action, State>(reducer: React.Reducer<State, Action>, initialState: State) {

  const StateContext = createContext<State | null>(null) // Always null to allow for the checking of out of bounds context usage errors in useStateContext
  const DispatchContext = createContext<React.Dispatch<Action> | null>(null) // Always null to allow for the checking of out of bounds context usage errors in useDispatchContext
  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    return (
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          {children}
        </StateContext.Provider>
      </DispatchContext.Provider>
    )
  }

  const useDispatchContext = () => {
    const context = useContext(DispatchContext)
    if (!context) {
      throw new Error(`dispatch consumer of type ${typeof DispatchContext} must be used within it's provider`)
    }
    return context
  }

  const useStateContext = () => {
    const context = useContext(StateContext)
    if (context === null) {
      throw new Error(`state consumer of type ${typeof StateContext} must be used within it's provider`)
    }
    return context
  }

  return { Provider, useStateContext, useDispatchContext }
}

// Usage:
// import CreateReducerContext from './CreateReducerContext'
// const { Provider, useStateContext, useDispatchContext } = CreateReducerContext(reducer, initialState)
// export { Provider, useStateContext, useDispatchContext }

// The above code is a generic context provider that takes a reducer and initial state and returns a Provider component and two hooks for consuming the state and dispatch function.