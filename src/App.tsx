import { useReducer } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AppStateContext, AppDispatchContext } from './AppContext'
import appReducer, { initialState } from './AppReducer'
import LandingPage from './LandingPage'
import Search from './Search'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </BrowserRouter>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}
