import React, { useContext, useReducer, createContext } from "react"
import ItemLibraryReducer, {
	initialState,
} from "./ItemLibraryReducer"

export const StateContext = createContext()
export const DispatchContext = createContext()

export default function ItemLibraryContextProvider({ children }) {
	const [state, dispatch] = useReducer(
		ItemLibraryReducer,
		initialState
	)

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				{children}
			</DispatchContext.Provider>
		</StateContext.Provider>
	)
}

export const useItemLibraryStateContext = () =>
	useContext(StateContext)
export const useItemLibraryDispatchContext = () =>
	useContext(DispatchContext)
