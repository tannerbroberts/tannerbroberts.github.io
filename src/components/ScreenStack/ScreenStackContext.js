import { createContext, useContext } from "react"

const ScreenStackContext = createContext({})

export const ScreenStackProvider = ScreenStackContext.Provider

export const useScreenStackContext = () =>
	useContext(ScreenStackContext)
