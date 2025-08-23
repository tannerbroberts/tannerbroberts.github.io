import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import { AppProvider } from './reducerContexts'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
