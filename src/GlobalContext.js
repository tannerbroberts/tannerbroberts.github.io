import { createContext, useContext } from "react"

const GlobalContext = createContext({})

export const GlobalContextProvider = GlobalContext.Provider

export const useGlobalContext = () => useContext(GlobalContext)
