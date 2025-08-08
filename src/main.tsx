import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import { AuthProvider } from './auth/AuthContext'
import { AppProvider } from './reducerContexts/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
)
