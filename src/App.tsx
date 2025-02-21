import { useReducer } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AppStateContext, AppDispatchContext } from './AppContext'
import appReducer, { initialState } from './AppReducer'
import data from './data'

export default function App() {
    const [state, dispatch] = useReducer(appReducer, initialState)

  return (
  <AppStateContext.Provider value={state}>
    <AppDispatchContext.Provider value={dispatch}>
      <BrowserRouter>
        <Routes>
          <Route {...data.landingPath} />
          <Route {...data.main}>
            {data.main.childrenRoutes.map((child) => (
              <Route key={child.routeProps.path} {...child.routeProps} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDispatchContext.Provider>
  </AppStateContext.Provider>
)
}
