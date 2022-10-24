import React, { useContext, useReducer, createContext } from "react"
import ATP_Reducer, { initialState } from "./ATP_Reducer"

export const ATP_StateContext = createContext()
export const ATP_DispatchContext = createContext()

export default function ATP_ContextProvider({ children }) {
	const [state, dispatch] = useReducer(ATP_Reducer, initialState)

	return (
		<ATP_StateContext.Provider value={state}>
			<ATP_DispatchContext.Provider value={dispatch}>
				{children}
			</ATP_DispatchContext.Provider>
		</ATP_StateContext.Provider>
	)
}

export const useATP_StateContext = () => useContext(ATP_StateContext)
export const useATP_DispatchContext = () =>
	useContext(ATP_DispatchContext)
