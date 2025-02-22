import { useAppState, useAppDispatch } from '../context/App'

function App() {
  const state = useAppState()
  const { count } = state
  const dispatch = useAppDispatch()

  return (
    <div>
      <h1>{count}</h1>
    </div>
  )
}

export default App
